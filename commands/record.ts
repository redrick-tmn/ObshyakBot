import { Timestamp } from '@google-cloud/firestore';
import * as _ from 'lodash';
import config from '../config';
import { Expense, Storage, User } from '../storage';
import { Message } from '../telegram';
import { notRecognizedMessage, upsertExpenseMessage } from '../text';
import { getExpenseText as getExpenseText, parseExpenseText as parseExpenseText } from './common';
import { NoReplayResult, ReplayToChatResult, Result } from './result';

const { botName } = config;

export async function handleUpsertExpense(
  message: Message,
  storage: Storage
): Promise<Result> {
  const expenseText = getExpenseText(botName, message);
  if (!expenseText) {
    return new NoReplayResult();
  }

  const record = parseExpenseText(expenseText);
  if (!record) {
    return new ReplayToChatResult(
      notRecognizedMessage(),
      message.chat.id
    );
  }

  const user = await storage.getUser(message.from.username);
  const expense: Expense = {
    amount: record.amount,
    comment: record.comment,
    chatId: message.chat.id,
    messageId: message.message_id,
    date: Timestamp.fromMillis(message.date)
  };

  const newUser: User = {
    ...user,
    expenses: upsertExpense(expense, user.expenses)
  };

  await storage.setUser(message.from.username, newUser);

  return new ReplayToChatResult(
    upsertExpenseMessage(expense),
    message.chat.id
  );
}

function upsertExpense(newExpense: Expense, expenses: Expense[]): Expense[] {
  return [
    ...expenses.filter(item => !(item.chatId === newExpense.chatId && item.messageId === newExpense.messageId)),
    newExpense
  ];
}
