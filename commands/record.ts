import { Timestamp } from '@google-cloud/firestore';
import * as _ from 'lodash';
import config from '../config';
import { BotModel, StorageModel } from '../model';
import { Storage } from '../storage';
import { notRecognizedMessage, upsertExpenseMessage } from '../text';
import { getExpenseText, parseExpenseText } from './common';

const { botName } = config;

export async function handleUpsertExpense(
  message: BotModel.Message,
  storage: Storage
): Promise<BotModel.Result> {
  const expenseText = getExpenseText(botName, message);
  if (!expenseText) {
    return new BotModel.NoReplayResult();
  }

  const record = parseExpenseText(expenseText);
  if (!record) {
    return new BotModel.ReplayToChatResult(
      notRecognizedMessage(),
      message.chatId
    );
  }

  const user = await storage.getUser(message.username);
  const expense: StorageModel.Expense = {
    amount: record.amount,
    comment: record.comment,
    chatId: message.chatId,
    messageId: message.messageId,
    date: Timestamp.fromMillis(message.date * 1000)
  };

  const newUser: StorageModel.User = {
    ...user,
    expenses: [
      ...user.expenses.filter(item => !(item.chatId === expense.chatId && item.messageId === expense.messageId)),
      expense
    ]
  };

  await storage.setUser(message.username, newUser);

  return new BotModel.ReplayToChatResult(
    upsertExpenseMessage(expense),
    message.chatId
  );
}
