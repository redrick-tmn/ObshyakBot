import * as _ from 'lodash';
import config from '../config';
import { Storage } from '../storage';
import { Message } from '../telegram';
import { groupAccountMessage } from '../text';
import { isInPeriod } from './common';
import { ReplayToChatResult, Result } from './result';

const { groups } = config;

function getGroup(user: string): string[] {
  return groups.find(group => group.includes(user));
}

export async function handleGroupAccountCommand(
  message: Message,
  storage: Storage
): Promise<Result> {
  const users = await storage.getUsers(getGroup(message.from.username));
  const period = await storage.getCurrentPeriod();

  const filtered = _.mapValues(users, user => ({
    ...user,
    expenses: user.expenses.filter(item => isInPeriod(item, period))
  }));

  return new ReplayToChatResult(groupAccountMessage(filtered), message.chat.id);
}
