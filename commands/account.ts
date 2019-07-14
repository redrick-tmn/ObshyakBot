import { Storage } from '../storage';
import { Message } from '../telegram';
import { personalAccountMessage } from '../text';
import { isInPeriod } from './common';
import { ReplayToChatResult, Result } from './result';

export async function handlePersonalAccountCommand(
  message: Message,
  storage: Storage
): Promise<Result> {
  const { expenses } = await storage.getUser(message.from.username);
  const period = await storage.getCurrentPeriod();

  const expensesInPeriod = expenses.filter(item => isInPeriod(item, period));

  return new ReplayToChatResult(personalAccountMessage(expensesInPeriod), message.chat.id);
}
