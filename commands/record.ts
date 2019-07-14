import { Timestamp } from '@google-cloud/firestore';
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

  if (!user.expenses.some(item => item.messageId === message.message_id)) {
    const expense = {
      amount: record.amount,
      comment: record.comment,
      chatId: message.chat.id,
      messageId: message.message_id,
      date: Timestamp.fromDate(new Date(Date.now()))
    };

    user.expenses.push(expense);

    await storage.setUser(message.from.username, user);

    return new ReplayToChatResult(
      addRecordMessage(expense),
      message.chat.id
    );
  } else {
    console.log(`Message with id '${message.message_id}' was already handled`);
    return new NoReplayResult();
  }
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

  if (!expense) {
    // TODO: replace with error message
    return new NoReplayResult();
  }

  await storage.setUser(username, user);

  return new ReplayToChatResult(
    editRecordMessage(expense),
    message.chat.id
  );
}
