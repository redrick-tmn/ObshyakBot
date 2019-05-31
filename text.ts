import * as _ from 'lodash';
import * as moment from 'moment';
import { getCurrentPeriod } from './commands/common';
import { Expense } from './storage';

const DEFAULT_FORMAT = 'DD.MM.YYYY';

export function reportMessage(
  [bucket1Users, bucket2Users]: [string[], string[]],
  [bucket1Total, bucket2Total]: [number, number],
  [bucket1Owes, bucket2Owes]: [number, number]
): string {
  const bucket1Names = joinUserNames(bucket1Users);
  const bucket2Names = joinUserNames(bucket2Users);
  const [start, end] = getCurrentPeriod();

  return `Отчетный период: ${start.format(DEFAULT_FORMAT)} - ${end.format(DEFAULT_FORMAT)}
Всего потрачено: ${bucket1Total + bucket2Total} р.

Траты:
${bucket1Names}: ${bucket1Total} р.
${bucket2Names}: ${bucket2Total} р.

Долги:
${bucket1Names}: ${bucket1Owes} р.
${bucket2Names}: ${bucket2Owes} р.`;
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

export function accountMessage( expenses: Expense[]): string {
  if (!expenses.length) {
    return `Пока ничего не потрачено`;
  }

  const lines = expenses.map(({
    date,
    comment,
    amount
  }) => `[${moment(date).format(DEFAULT_FORMAT)}] ${amount} р.${comment ? ` - ${comment}` : ''}`);

  return `За этот отчетный период потрачено:

${_.join(lines, '\n')}`;
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
