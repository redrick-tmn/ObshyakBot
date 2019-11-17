import * as _ from 'lodash';
import { Dictionary } from 'lodash';
import config from '../config';
import { BotModel, StorageModel } from '../model';
import { Storage } from '../storage';
import { reportMessage } from '../text';

const { groups: [group1Users, group2Users] } = config;

export async function handleReportCommand(
  command: BotModel.Message,
  storage: Storage
): Promise<BotModel.Result> {
  const period = await storage.getCurrentPeriod();
  const users = await storage.getUsers([...group1Users, ...group2Users]);

  const group1 = _.pick(users, group1Users);
  const group2 = _.pick(users, group2Users);

  const totals = calculateTotal(
    [group1, group2],
    period
  );

  const debts = calculateDebt(
    [group1Users.length, group2Users.length],
    totals
  );

  const text = reportMessage(
    [group1Users, group2Users],
    totals,
    debts,
    period
  );

  return new BotModel.ReplayToChatResult(text, command.chatId);
}

function calculateDebt(
  [group1Count, group2Count]: [number, number],
  [group1Total, group2Total]: [number, number]
): [number, number] {
  const part = Math.round((group1Total + group2Total) / (group1Count + group2Count));

  const group1Owes = Math.max(part * group1Count - group1Total, 0);
  const group2Owes = Math.max(part * group2Count - group2Total, 0);

  return [group1Owes, group2Owes];
}

function calculateTotal(
  [group1, group2]: [Dictionary<StorageModel.User>, Dictionary<StorageModel.User>],
  period: StorageModel.Period
): [number, number] {
  return [
    calculateGroupTotal(group1, period),
    calculateGroupTotal(group2, period)
  ];
}

function calculateGroupTotal(group: Dictionary<StorageModel.User>, period: StorageModel.Period): number {
  return _(group)
    .map<StorageModel.User>(item => item)
    .flatMap(item => item.expenses)
    .filter(item => StorageModel.isInPeriod(item, period))
    .sumBy(item => item.amount);
}
