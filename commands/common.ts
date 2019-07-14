import * as _ from 'lodash';
import * as moment from 'moment';
import { Expense, Period } from '../storage';
import { ChatType, Message, MessageEntity, MessageEntityType } from '../telegram';

export function isInPeriod(expense: Expense, period: Period): boolean {
  return expense && moment(expense.date.toDate()).isAfter(period.start.toDate());
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
    console.log(`'${recordText}' doesn't match regex`);
    return null;
  }

  const amount = parseInt(regexResult[1], 10);

  if (!_.isInteger(amount)) {
    console.log(`'${recordText}' is not integer`);
    return null;
  }

  const result = {
    amount,
    comment: regexResult[3] || ''
  };

  console.log(`'${recordText}' parsed successfully`, result);

  return result;
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
