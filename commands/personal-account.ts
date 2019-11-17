import { BotModel, StorageModel } from '../model';
import { Storage } from '../storage';
import { personalAccountMessage } from '../text';

export async function handlePersonalAccountCommand(
  command: BotModel.Message,
  storage: Storage
): Promise<BotModel.Result> {
  const { expenses } = await storage.getUser(command.username);
  const period = await storage.getCurrentPeriod();

  const expensesInPeriod = expenses.filter(item => StorageModel.isInPeriod(item, period));

  return new BotModel.ReplayToChatResult(personalAccountMessage(expensesInPeriod), command.chatId);
}
