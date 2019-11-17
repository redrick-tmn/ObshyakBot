import * as _ from 'lodash';
import { BotModel } from '../model';

export function parseExpenseText(recordText: string): { amount: number, comment?: string } | null {
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

export function getExpenseText(botName: string, command: BotModel.Message): string | null {
  if (command.isPrivate) {
    return command.rawText;
  }

  const botMention = command.mentions.find(({ text }) => text === `@${botName}`);

  if (botMention) {
    return command.rawText.slice(botMention.offset + botMention.length + 1);
  } else {
    return null;
  }
}
