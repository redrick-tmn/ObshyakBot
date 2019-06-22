import config from '../config';
import { getUser, getUsers, setUser } from '../storage';
import { Message, Update } from '../telegram';
import { handleAccountCommand } from './account';
import { getFirstCommand } from './common';
import { handleHelloCommand } from './hello';
import { handleAddRecord, handleEditRecord } from './record';
import { handleReportCommand } from './report';
import { NoReplayResult, Result } from './result';

const { botName, buckets: [bucket1Users, bucket2Users] } = config;

function validateMessage(message: Message): boolean {
  if (!message.from || !message.from.username) {
    console.warn('Username is not set');

    return false;
  }

  if (!message.chat || !message.chat.id) {
    console.warn('Chat id is not set');

    return false;
  }

  return true;
}

export class CommandHandlingError extends Error {
  constructor(message?: string) {
    super(message);

    Object.setPrototypeOf(this, CommandHandlingError.prototype);
  }
}
export async function handleUpdate(update: Update): Promise<Result> {
  const { message, edited_message: editedMessage } = update;

  if (message) {
    return handleMessage(message);
  } else if (editedMessage) {
    return handleEditedMessage(editedMessage);
  } else {
    return new NoReplayResult();
  }
}

async function handleMessage(message: Message): Promise<Result> {
  if (!validateMessage(message)) {
    return new NoReplayResult();
  }

  return handleCommand(message);
}

async function handleEditedMessage(message: Message): Promise<Result> {
  if (!validateMessage(message)) {
    return new NoReplayResult();
  }

  return handleEditRecord(message, getUser, setUser);
}

async function handleCommand(message: Message): Promise<Result> {
  const firstCommand = getFirstCommand(botName, message);

  switch (firstCommand) {
    case '/start':
    case '/help':
      return handleHelloCommand(message);
    case '/report':
      return handleReportCommand(message, bucket1Users, bucket2Users, getUsers);
    case '/list':
      return handleAccountCommand(message, getUser);
    default:
      return handleAddRecord(message, getUser, setUser);
  }
}
