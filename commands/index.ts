import config from '../config';
import { Storage } from '../storage';
import { Message, Update } from '../telegram';
import { handleAccountCommand } from './account';
import { handleClosePeriod } from './close-period';
import { getFirstCommand } from './common';
import { handleHelloCommand } from './hello';
import { handleAddRecord, handleEditRecord } from './record';
import { handleReportCommand } from './report';
import { NoReplayResult, Result } from './result';

const { botName } = config;

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

export async function handleUpdate(update: Update, storage: Storage): Promise<Result> {
  const { message, edited_message: editedMessage } = update;

  if (message) {
    return handleMessage(message, storage);
  } else if (editedMessage) {
    return handleEditedMessage(editedMessage, storage);
  } else {
    return new NoReplayResult();
  }
}

async function handleMessage(message: Message, storage: Storage): Promise<Result> {
  if (!validateMessage(message)) {
    return new NoReplayResult();
  }

  return handleCommand(message, storage);
}

async function handleEditedMessage(message: Message, storage: Storage): Promise<Result> {
  if (!validateMessage(message)) {
    return new NoReplayResult();
  }

  return handleEditRecord(message, storage);
}

async function handleCommand(message: Message, storage: Storage): Promise<Result> {
  const firstCommand = getFirstCommand(botName, message);

  switch (firstCommand) {
    case '/start':
    case '/help':
      return handleHelloCommand(message);
    case '/report':
      return handleReportCommand(message, storage, await storage.getCurrentPeriodStart());
    case '/list':
      return handleAccountCommand(message, storage);
    case '/period':
      return handleClosePeriod(message, storage);
    default:
      return handleAddRecord(message, storage);
  }
}
