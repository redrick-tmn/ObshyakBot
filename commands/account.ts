import { User } from '../storage';
import { accountMessage } from '../text';
import { isInPeriod } from './common';

export async function handleAccountCommand(
  username: string,
  getUser: (username: string) => Promise<User>
): Promise<string> {
  const { expenses } = await getUser(username);

  return accountMessage(expenses.filter(isInPeriod));
}
