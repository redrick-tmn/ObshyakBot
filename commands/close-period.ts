import { Timestamp } from '@google-cloud/firestore';
import { BotModel } from '../model';
import { Storage } from '../storage';
import { periodClose } from '../text';

export async function handleClosePeriod(
  command: BotModel.Message,
  storage: Storage
): Promise<BotModel.Result> {
  const previousPeriod = await storage.getCurrentPeriod();
  const start = Timestamp.fromMillis(command.date);
  const newPeriod = await storage.startNewPeriod(start);

  const text = periodClose(previousPeriod.start, newPeriod.start);

  return new BotModel.ReplayToChatResult(text, command.chatId);
}
