import { BotModel } from '../model';
import { Storage } from '../storage';
import { personalAccountMessage } from '../text';
import { isInPeriod } from './common';

export async function handlePersonalAccountCommand(
  command: BotModel.Message,
  storage: Storage
): Promise<BotModel.Result> {
  const { expenses } = await storage.getUser(command.username);
  const period = await storage.getCurrentPeriod();

  const expensesInPeriod = expenses.filter(item => isInPeriod(item, period));

  return new BotModel.ReplayToChatResult(personalAccountMessage(expensesInPeriod), command.chatId);
}
