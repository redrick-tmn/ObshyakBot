import * as firebase from 'firebase';
import * as _ from 'lodash';
import { Dictionary } from 'lodash';
import config from './config';

const { collectionName, firebaseConfig } = config;

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

export async function getUsers(usernames: string[]): Promise<Dictionary<User>> {
  const response = await database.ref(`/${collectionName}`).once('value');
  const value: Dictionary<User> = response.exists() ? response.val() : {};

  return _(value).pick(usernames).mapValues(user => transformUser(user)).value();
}

export async function getUser(username: string): Promise<User> {
  const response = await database.ref(`/${collectionName}/${username}`).once('value');
  const user: User = response.exists() ? response.val() : {};

  return transformUser(user);
}

export async function setUser(username: string, user: User): Promise<void> {
  await database.ref(`/${collectionName}/${username}`).set(user);
}

function transformUser(user: User): User {
  return {
    ...user,
    expenses: user.expenses ? user.expenses : []
  };
}
