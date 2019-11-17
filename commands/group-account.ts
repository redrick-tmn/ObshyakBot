import * as _ from 'lodash';
import config from '../config';
import { BotModel, StorageModel } from '../model';
import { Storage } from '../storage';
import { groupAccountMessage } from '../text';

const { groups } = config;

function getGroup(user: string): string[] {
  return groups.find(group => group.includes(user)) || [];
}

export async function handleGroupAccountCommand(
  command: BotModel.Message,
  storage: Storage
): Promise<BotModel.Result> {
  const users = await storage.getUsers(getGroup(command.username));
  const period = await storage.getCurrentPeriod();

  const filtered = _.mapValues(users, user => ({
    ...user,
    expenses: user.expenses.filter(item => StorageModel.isInPeriod(item, period))
  }));

  return new BotModel.ReplayToChatResult(groupAccountMessage(filtered), command.chatId);
}
