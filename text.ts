import { Timestamp } from '@google-cloud/firestore';
import * as _ from 'lodash';
import { Dictionary } from 'lodash';
import * as moment from 'moment-timezone';
import config from './config';
import { StorageModel } from './model';

const { timezone } = config;

const DEFAULT_FORMAT = 'DD.MM.YYYY hh:mm';

export function periodClose(start: Timestamp, end: Timestamp): string {
  return `Отчетный период c ${formatTimestamp(start)} по ${formatTimestamp(end)} закрыт.`;
}

export function reportMessage(
  [group1Users, group2Users]: [string[], string[]],
  [group1Total, group2Total]: [number, number],
  [group1Owes, group2Owes]: [number, number],
  period: StorageModel.Period
): string {
  const group1Names = joinUserNames(group1Users);
  const group2Names = joinUserNames(group2Users);

  return `
Начало отчетного периода: _${formatTimestamp(period.start)}_
Всего потрачено: _${group1Total + group2Total} р._

Траты:
  ${group1Names}: _${group1Total} р._
  ${group2Names}: _${group2Total} р._

Долги:
  ${group1Names}: _${group1Owes} р._
  ${group2Names}: _${group2Owes} р._`;
}

export function upsertExpenseMessage(expense: StorageModel.Expense): string {
  return `
Принято: ${formatExpense(expense)}
`;
}

export function personalAccountMessage(expenses: StorageModel.Expense[]): string {
  if (!expenses.length) {
    return `Пока ничего не потрачено`;
  }

  const lines = expenses.map(expense => `  ${formatExpense(expense)}`);

  return `За этот отчетный период потрачено:
${_.join(lines, '\n')}`;
}

export function groupAccountMessage(users: Dictionary<StorageModel.User>): string {
  const lines = _.map(users, user => `
*Пользователь:* @${user.id}

${personalAccountMessage(user.expenses)}
`);

  return `${_.join(lines, '')}`;
}

export function notRecognizedMessage(): string {
  return 'Извини, но я не понимаю.';
}

export function helloMessage(botName: string): string {
  return `Привет!

Я - общак бот.
Ты можешь отправлять мне свои расходы, а я буду их ссумировать и в конце месяца сгенерирую отчет.

Отправь мне сумму которую ты потратил и коментарий чтобы занести ее на свой счет:

100 Молоко

Ты также можешь добавить меня в групповой чат, но тогда тебе нужно будет сперва меня упомняуть:

@${botName} 100 Молоко

Посмотреть список своих трат за этот месяц можно отправив команду

/personal_account

Посмотреть список трат за всю группу за этот месяц можно отправив команду

/group_account

Сколько всего ты потратил в этом месяце, сколько тебе должны или сколько должен ты можно узнать отправив команду

/report

Спасибо за внимание :)`;
}

function joinUserNames(userNames: string[]): string {
  return _(userNames).map(user => `@${user}`).join(',');
}

function formatTimestamp(timestamp: Timestamp): string {
  return moment(timestamp.toDate()).tz(timezone).format(DEFAULT_FORMAT);
}

function formatExpense({ amount, comment, date }: StorageModel.Expense): string {
  return `[${formatTimestamp(date)}] _${amount} р.${comment ? ` - ${comment}` : ''}_`;
}
