import * as _ from 'lodash';
import config from '../config';
import { User } from '../storage';
import { Message } from '../telegram';
import { addRecordMessage, editRecordMessage, notRecognizedMessage } from '../text';
import { getRecordText, isInPeriod, parseRecordText } from './common';
import { NoReplayResult, ReplayToChatResult, Result } from './result';

const { botName } = config;

export async function handleAddRecord(
  message: Message,
  getUser: (username: string) => Promise<User>,
  setUser: (username: string, user: User) => Promise<void>
): Promise<Result> {
  const recordText = getRecordText(botName, message);
  if (!recordText) {
    return new NoReplayResult();
  }

  const record = parseRecordText(recordText);
  if (!record) {
    return new ReplayToChatResult(
      notRecognizedMessage(),
      message.chat.id
    );
  }

  const user = await getUser(message.from.username);

  user.expenses.push({
    amount: record.amount,
    comment: record.comment,
    chatId: message.chat.id,
    messageId: message.message_id,
    date: Date.now()
  });

  await setUser(message.from.username, user);

  const total = _(user.expenses).filter(isInPeriod).sumBy(item => item.amount);

  return new ReplayToChatResult(
    addRecordMessage(record.amount, record.comment, total),
    message.chat.id
  );
}

export async function handleEditRecord(
  message: Message,
  getUser: (username: string) => Promise<User>,
  setUser: (username: string, user: User) => Promise<void>
): Promise<Result> {
  const recordText = getRecordText(botName, message);
  if (!recordText) {
    return new NoReplayResult();
  }

  const record = parseRecordText(recordText);
  if (!record) {
    return new ReplayToChatResult(
      notRecognizedMessage(),
      message.chat.id
    );
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

  return new ReplayToChatResult(
    editRecordMessage(record.amount, record.comment, oldAmount, oldComment, total),
    message.chat.id
  );
}
