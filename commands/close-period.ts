import { Timestamp } from '@google-cloud/firestore';
import { Storage } from '../storage';
import { Message } from '../telegram';
import { periodClose } from '../text';
import { ReplayToChatResult, Result } from './result';

export async function handleClosePeriod(message: Message, storage: Storage): Promise<Result> {
  const previousPeriod = await storage.getCurrentPeriod();
  const start = Timestamp.fromMillis(message.date);
  const newPeriod = await storage.startNewPeriod(start);

  const messageText = periodClose(previousPeriod.start, newPeriod.start);

  return new ReplayToChatResult(messageText, message.chat.id);
}
