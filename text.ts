import * as _ from 'lodash';
import { Dictionary } from 'lodash';
import * as moment from 'moment';
import { Expense, Period, User } from './storage';

const DEFAULT_FORMAT = 'DD.MM.YYYY hh:mm';

export function periodClose(periodStartDate: Date, periodEndDate: Date): string {
  return `Отчетный период c ${moment(periodStartDate).format(DEFAULT_FORMAT)} по ${moment(periodEndDate).format(DEFAULT_FORMAT)} закрыт`;
}

export function reportMessage(
  [group1Users, group2Users]: [string[], string[]],
  [group1Total, group2Total]: [number, number],
  [group1Owes, group2Owes]: [number, number],
  period: Period
): string {
  const group1Names = joinUserNames(group1Users);
  const group2Names = joinUserNames(group2Users);

  return `Начало отчетного периода: ${moment(period.start.toDate()).format(DEFAULT_FORMAT)}
Всего потрачено: ${group1Total + group2Total} р.

Траты:
${group1Names}: ${group1Total} р.
${group2Names}: ${group2Total} р.

Долги:
${group1Names}: ${group1Owes} р.
${group2Names}: ${group2Owes} р.`;
}

export function addRecordMessage(amount: number, comment: string, total: number): string {
  return `Принято!
${amount} р.${comment ? ` - ${comment}` : ''}

Всего потрачено за этот отчетный период: ${total} р.`;
}

export function editRecordMessage(amount: number, comment: string, oldAmount: number, oldComment: string, total: number): string {
  return `Обновлено!
Было:
${oldAmount} р.${oldComment ? ` - ${oldComment}` : ''}

Стало:
${amount} р.${comment ? ` - ${comment}` : ''}

Всего потрачено за этот отчетный период: ${total} р.`;
}

export function personalAccountMessage(expenses: Expense[]): string {
  if (!expenses.length) {
    return `Пока ничего не потрачено`;
  }

  const lines = expenses.map(({
    date,
    comment,
    amount
  }) => `[${moment(date.toDate()).format(DEFAULT_FORMAT)}] ${amount} р.${comment ? ` - ${comment}` : ''}`);

  return `За этот отчетный период потрачено:

${_.join(lines, '\n')}`;
}

export function groupAccountMessage(users: Dictionary<User>): string {
  const lines = _.map(users, user => {
    return `
Пользователь: ${user.id}

${personalAccountMessage(user.expenses)}`;
  });

  return `${_.join(lines, '\n')}`;
}

export function notRecognizedMessage(): string {
  return 'Извини, но я не понимаю сколько это.';
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

/list

Сколько всего ты потратил в этом месяце, сколько тебе должны или сколько должен ты можно узнать отправив команду

/report

Спасибо за внимание :)`;
}

function joinUserNames(userNames: string[]): string {
  return _(userNames).map(user => `@${user}`).join(',');
}
