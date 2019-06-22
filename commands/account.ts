import { Storage } from '../storage';
import { Message } from '../telegram';
import { accountMessage } from '../text';
import { isInPeriod } from './common';
import { ReplayToChatResult, Result } from './result';

export async function handleAccountCommand(
  message: Message,
  storage: Storage
): Promise<Result> {
  const { expenses } = await storage.getUser(message.from.username);
  const period = await storage.getCurrentPeriodStart();
  const expensesInPeriod = expenses.filter(item => isInPeriod(item, period));

  return new ReplayToChatResult(accountMessage(expensesInPeriod), message.chat.id);
}
