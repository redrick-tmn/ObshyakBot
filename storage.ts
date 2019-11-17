import { Timestamp } from '@google-cloud/firestore';
import * as admin from 'firebase-admin';
import * as _ from 'lodash';
import { Dictionary } from 'lodash';
import config from './config';
import { StorageModel } from './model/storage';

const { usersCollectionName, periodsCollectionName } = config;

const app = admin.initializeApp();
const database = app.firestore();

export class Storage {
  async getUsers(usernames: string[]): Promise<Dictionary<StorageModel.User>> {
    const response = await database.collection(usersCollectionName).get();
    if (response.empty) {
      return {};
    }

    return _(response.docs)
      .filter(document => usernames.includes(document.id))
      .map(document => <StorageModel.User>document.data())
      .mapKeys(user => user.id)
      .mapValues(user => user)
      .value();
  }

  async getUser(username: string): Promise<StorageModel.User> {
    const response = await database.collection(usersCollectionName).doc(username).get();

    if (!response.exists) {
      return StorageModel.emptyUser(username);
    }

    const user = <StorageModel.User>response.data();

    return {
      ...user,
      expenses: user.expenses ? user.expenses : []
    };
  }

  async setUser(username: string, user: StorageModel.User): Promise<void> {
    await database.collection(usersCollectionName).doc(username).set(user);
  }

  async startNewPeriod(start: Timestamp): Promise<StorageModel.Period> {
    const period: StorageModel.Period = {
      start
    };

    await database.collection(periodsCollectionName).add(period);

    return period;
  }

  async getCurrentPeriod(): Promise<StorageModel.Period> {
    const period = await database.collection(periodsCollectionName).orderBy('start', 'desc').limit(1).get();

    if (period.empty || !period.docs.length) {
      return StorageModel.emptyPeriod();
    }

    return <StorageModel.Period>period.docs[0].data();
  }
}
