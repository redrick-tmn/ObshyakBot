import * as _ from 'lodash';
import config from '../config';
import { User } from '../storage';
import { Message } from '../telegram';
import { addRecordMessage, editRecordMessage, notRecognizedMessage } from '../text';
import { isInPeriod, parseRecord } from './common';

const { botName } = config;

export async function handleAddRecord(
  message: Message,
  getUser: (username: string) => Promise<User>,
  setUser: (username: string, user: User) => Promise<void>
): Promise<string> {
  const record = parseRecord(botName, message);

  if (!record) {
    return null;
  }

  if (_.isNaN(record.amount)) {
    return notRecognizedMessage();
  }

  console.log(`[handleAddRecord] Record parsed ${JSON.stringify(record)}`);

  const { message_id: messageId, chat: { id: chatId }, from: { username } } = message;

  const user = await getUser(username);

  user.expenses.push({
    amount: record.amount,
    comment: record.comment,
    chatId,
    messageId,
    date: Date.now()
  });

  await setUser(username, user);

  const total = _(user.expenses).filter(isInPeriod).sumBy(item => item.amount);

  return addRecordMessage(record.amount, record.comment, total);
}

export async function handleEditRecord(
  message: Message,
  getUser: (username: string) => Promise<User>,
  setUser: (username: string, user: User) => Promise<void>
): Promise<string> {
  const record = parseRecord(botName, message);

  if (!record) {
    return null;
  }

  if (_.isNaN(record.amount)) {
    return notRecognizedMessage();
  }

  const { message_id: messageId, chat: { id: chatId }, from: { username } } = message;

  const user = await getUser(username);
  const expense = user.expenses.find(item => item.chatId === chatId && item.messageId === messageId);
  const oldAmount = expense.amount;
  const oldComment = expense.comment;
  if (expense) {
    expense.amount = record.amount;
    expense.comment = record.comment;
  }

  await setUser(username, user);

  const total = _(user.expenses).filter(isInPeriod).sumBy(item => item.amount);

  return editRecordMessage(record.amount, record.comment, oldAmount, oldComment, total);
}
