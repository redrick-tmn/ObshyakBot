import { Storage } from '../storage';
import { Message } from '../telegram';
import { periodClose } from '../text';
import { ReplayToChatResult, Result } from './result';

export async function handleClosePeriod(message: Message, storage: Storage): Promise<Result> {
  const previousPeriodStart = await storage.getCurrentPeriodStart();
  const newPeriodStart = await storage.startNewPeriod();

  return new ReplayToChatResult(periodClose(previousPeriodStart, newPeriodStart), message.chat.id);
}
