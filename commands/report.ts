import * as _ from 'lodash';
import { Dictionary } from 'lodash';
import { User } from '../storage';
import { Message } from '../telegram';
import { reportMessage } from '../text';
import { isInPeriod } from './common';
import { ReplayToChatResult, Result } from './result';

export async function handleReportCommand(
  message: Message,
  bucket1Users: string[],
  bucket2Users: string[],
  getUsers: (usernames: string[]) => Promise<Dictionary<User>>
): Promise<Result> {
  const users = await getUsers([...bucket1Users, ...bucket2Users]);

  const bucket1 = _.pick(users, bucket1Users);
  const bucket2 = _.pick(users, bucket2Users);

  const totals: [number, number] = [total(bucket1), total(bucket2)];

  const text = reportMessage(
    [bucket1Users, bucket2Users],
    totals,
    owes(
      [bucket1Users.length, bucket2Users.length],
      totals
    )
  );

  return new ReplayToChatResult(text, message.chat.id);
}

function owes(
  [bucket1Count, bucket2Count]: [number, number],
  [bucket1Total, bucket2Total]: [number, number]
): [number, number] {
  const part = Math.round((bucket1Total + bucket2Total) / (bucket1Count + bucket2Count));

  const bucket1Owes = Math.max(part * bucket1Count - bucket1Total, 0);
  const bucket2Owes = Math.max(part * bucket2Count - bucket2Total, 0);

  return [bucket1Owes, bucket2Owes];
}

function total(bucket: Dictionary<User>): number {
  return _(bucket)
    .map<User>(item => item)
    .flatMap(item => item.expenses)
    .filter(isInPeriod)
    .sumBy(item => item.amount);
}
