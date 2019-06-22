import * as _ from 'lodash';
import config from '../config';
import { Storage } from '../storage';
import { Message } from '../telegram';
import { addRecordMessage, editRecordMessage, notRecognizedMessage } from '../text';
import { getRecordText, isInPeriod, parseRecordText } from './common';
import { NoReplayResult, ReplayToChatResult, Result } from './result';

const { botName } = config;

export async function handleAddRecord(
  message: Message,
  storage: Storage
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

  const user = await storage.getUser(message.from.username);

  user.expenses.push({
    amount: record.amount,
    comment: record.comment,
    chatId: message.chat.id,
    messageId: message.message_id,
    date: Date.now()
  });

  await storage.setUser(message.from.username, user);

  const period = await storage.getCurrentPeriodStart();
  const total = _(user.expenses).filter(item => isInPeriod(item, period)).sumBy(item => item.amount);

  return new ReplayToChatResult(
    addRecordMessage(record.amount, record.comment, total),
    message.chat.id
  );
}

export async function handleEditRecord(
  message: Message,
  storage: Storage
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

  const user = await storage.getUser(username);
  const expense = user.expenses.find(item => item.chatId === chatId && item.messageId === messageId);
  const oldAmount = expense.amount;
  const oldComment = expense.comment;
  if (expense) {
    expense.amount = record.amount;
    expense.comment = record.comment;
  }

  await storage.setUser(username, user);

  const period = await storage.getCurrentPeriodStart();
  const total = _(user.expenses).filter(item => isInPeriod(item, period)).sumBy(item => item.amount);

  return new ReplayToChatResult(
    editRecordMessage(record.amount, record.comment, oldAmount, oldComment, total),
    message.chat.id
  );
}
