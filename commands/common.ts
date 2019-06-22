import * as _ from 'lodash';
import * as moment from 'moment';
import { Expense } from '../storage';
import { ChatType, Message, MessageEntity, MessageEntityType } from '../telegram';

export function isInPeriod(expense: Expense, periodStartDate: Date): boolean {
  return expense && moment(expense.date).isAfter(periodStartDate);
}

export function getFirstCommand(botName: string, message: Message): string {
  if (!message || !message.entities) {
    return null;
  }

  const firstCommand = _(message.entities)
    .filter(({ type }) => type === MessageEntityType.BotCommand)
    .map(({ offset, length }) => message.text.substr(offset, length))
    .first();

  if (!firstCommand) {
    return null;
  }

  return firstCommand.replace(`@${botName}`, '');
}

export function parseRecordText(recordText: string): { amount: number, comment?: string } {
  const regexResult = new RegExp(/^([\-\+]?\d*)(\s(.*))?$/, 'g').exec(recordText.trim());
  if (!regexResult) {
    console.log(`Record text has not passed regex`);
    return null;
  }

  const amount = parseInt(regexResult[1], 10);

  if (!_.isInteger(amount)) {
    console.log(`[parseRecordText] Record text is not integer`);
    return null;
  }

  return {
    amount,
    comment: regexResult[3] || ''
  };
}

export function getRecordText(botName: string, message: Message): string {
  if (message.chat.type === ChatType.Private) {
    return message.text;
  }

  const firstMention = getFirstMention(botName, message);

  if (firstMention) {
    return message.text.slice(firstMention.offset + firstMention.length + 1);
  } else {
    return null;
  }
}

function getFirstMention(botName: string, message: Message): MessageEntity {
  if (!message || !message.entities) {
    return null;
  }

  return _(message.entities)
    .filter(({ type }) => type === MessageEntityType.Mention)
    .map(mention => ({
      ...mention,
      text: message.text.substr(mention.offset, mention.length)
    }))
    .filter(({ text }) => text === `@${botName}`)
    .first();
}
