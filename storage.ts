import * as firebase from 'firebase';
import * as _ from 'lodash';
import { Dictionary } from 'lodash';
import config from './config';

const { usersCollectionName, periodsCollectionName, firebaseConfig } = config;

const database = firebase.initializeApp(firebaseConfig).database();

export interface Expense {
  amount: number;
  comment: string;
  date: number;
  chatId: string;
  messageId: number;
}

export interface User {
  expenses: Expense[];
}

function transformUser(user: User): User {
  return {
    ...user,
    expenses: user.expenses ? user.expenses : []
  };
}

export class Storage {
  async getUsers(usernames: string[]): Promise<Dictionary<User>> {
    const response = await database.ref(`/${usersCollectionName}`).once('value');
    const value: Dictionary<User> = response.exists() ? response.val() : {};

    return _(value).pick(usernames).mapValues(user => transformUser(user)).value();
  }

  async getUser(username: string): Promise<User> {
    const response = await database.ref(`/${usersCollectionName}/${username}`).once('value');
    const user: User = response.exists() ? response.val() : {};

    return transformUser(user);
  }

  async setUser(username: string, user: User): Promise<void> {
    await database.ref(`/${usersCollectionName}/${username}`).set(user);
  }

  private async getPeriods(): Promise<number[]> {
    const response = await database.ref(`/${periodsCollectionName}/periodStartDates`).once('value');
    return response.exists() ? response.val() : [];
  }

  async startNewPeriod(): Promise<Date> {
    const newPeriodStart = Date.now();
    const periods = await this.getPeriods();
    periods.push(newPeriodStart);

    console.log(periodsCollectionName, periods);
    await database.ref(`/${periodsCollectionName}/periodStartDates`).set(periods);

    return new Date(newPeriodStart);
  }

  async getCurrentPeriodStart(): Promise<Date> {
    const periods = await this.getPeriods();
    console.log(periods);

    return new Date(_(periods).orderBy().last() || 0);
  }
}
