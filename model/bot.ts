import * as _ from 'lodash';
import config from '../config';
import { TelegramModel } from './telegram';

const { botName } = config;

export namespace BotModel {
  export interface Mention {
    text: string;
    offset: number;
    length: number;
  }

  export interface Message {
    messageId: number;
    chatId: string;
    userId: string;

    username: string;
    isPrivate: boolean;
    rawText: string;
    date: number;

    commands: string[];
    mentions: Mention[];
  }

  export class ReplayToChatResult {
    constructor (
      public text: string,
      public chatId: string
    ) { }
  }

  export class NoReplayResult {}

  export type Result = ReplayToChatResult | NoReplayResult;

  export function fromUpdate(update: TelegramModel.Update): Message | null {
    const { message: addedMessage, edited_message: editedMessage } = update;
    const message = addedMessage || editedMessage || null;

    if (!message || !message.chat || !message.chat.id || !message.from || !message.from.username) {
      return null;
    }

    return {
      chatId: message.chat.id,
      userId: message.from.userId,
      messageId: message.message_id,
      username: message.from.username,
      isPrivate: message.chat.type === TelegramModel.ChatType.Private,
      rawText: message.text,
      date: update.date,
      commands: _(message.entities)
        .filter(({ type }) => type === TelegramModel.MessageEntityType.BotCommand)
        .map(({ offset, length }) => message.text.substr(offset, length).replace(`@${botName}`, ''))
        .value(),
      mentions: _(message.entities)
        .filter(({ type }) => type === TelegramModel.MessageEntityType.Mention)
        .map(({ offset, length }) => ({
          text: message.text.substr(offset, length),
          offset,
          length
        }))
        .value()
    };
  }
}
