import { Timestamp } from '@google-cloud/firestore';
import * as moment from 'moment';

export namespace StorageModel {
  export interface Expense {
    amount: number;
    comment?: string;
    date: Timestamp;
    chatId: string;
    messageId: number;
  }

  export interface User {
    id: string;
    expenses: Expense[];
  }

  export interface Period {
    start: Timestamp;
  }

  export function emptyUser(id: string): User {
    return {
      expenses: [],
      id
    };
  }

  export function emptyPeriod(): Period {
    return {
      start: Timestamp.fromDate(new Date(0))
    };
  }

  export function isInPeriod(expense: Expense, period: Period): boolean {
    return expense && moment(expense.date.toDate()).isAfter(period.start.toDate());
  }
}
