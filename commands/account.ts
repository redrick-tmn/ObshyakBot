import { User } from '../storage';
import { Message } from '../telegram';
import { accountMessage } from '../text';
import { isInPeriod } from './common';
import { NoReplayResult, ReplayToChatResult, Result } from './result';

export async function handleAccountCommand(
  message: Message,
  getUser: (username: string) => Promise<User>
): Promise<Result> {
  const { expenses } = await getUser(message.from.username);

  return new ReplayToChatResult(accountMessage(expenses.filter(isInPeriod)), message.chat.id);
}
