import { Timestamp } from '@google-cloud/firestore';
import * as admin from 'firebase-admin';
import * as _ from 'lodash';
import { Dictionary } from 'lodash';
import config from './config';

const { usersCollectionName, periodsCollectionName } = config;

const app = admin.initializeApp();
const database = app.firestore();

export interface Expense {
  amount: number;
  comment: string;
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

function emptyUser(id: string): User {
  return {
    expenses: [],
    id
  };
}

function emptyPeriod(): Period {
  return {
    start: Timestamp.fromDate(new Date(0))
  };
}

function transformUser(user: User): User {
  return {
    ...user,
    expenses: user.expenses ? user.expenses : []
  };
}

export class Storage {
  async getUsers(usernames: string[]): Promise<Dictionary<User>> {
    const response = await database.collection(usersCollectionName).get();
    if (response.empty) {
      return {};
    }

    return _(response.docs)
      .filter(document => usernames.includes(document.id))
      .map(document => <User>document.data())
      .mapKeys(user => user.id)
      .mapValues(user => user)
      .value();
  }

  async getUser(username: string): Promise<User> {
    const response = await database.collection(usersCollectionName).doc(username).get();

    if (!response.exists) {
      return emptyUser(username);
    }
    const user = <User>response.data();

    return transformUser(user);
  }

  async setUser(username: string, user: User): Promise<void> {
    await database.collection(usersCollectionName).doc(username).set(user);
  }

  async startNewPeriod(start: Timestamp): Promise<Period> {
    const period: Period = {
      start
    };

    await database.collection(periodsCollectionName).add(period);

    return period;
  }

  async getCurrentPeriod(): Promise<Period> {
    const period = await database.collection(periodsCollectionName).orderBy('start', 'desc').limit(1).get();

    if (period.empty || !period.docs.length) {
      return emptyPeriod();
    }

    return <Period>period.docs[0].data();
  }
}
