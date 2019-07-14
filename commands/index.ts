import config from '../config';
import { Storage } from '../storage';
import { Message, Update } from '../telegram';
import { handleClosePeriod } from './close-period';
import { getFirstCommand } from './common';
import { handleGroupAccountCommand } from './group-account';
import { handleHelloCommand } from './hello';
import { handlePersonalAccountCommand } from './personal-account';
import { handleUpsertExpense } from './record';
import { handleReportCommand } from './report';
import { NoReplayResult, Result } from './result';

const { botName } = config;

function validateMessage(message: Message): boolean {
  if (!message) {
    console.warn('No message given');

    return false;
  }

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
  const { message: addedMessage, edited_message: editedMessage } = update;
  const message = addedMessage || editedMessage || null;

  if (!validateMessage(message)) {
    return new NoReplayResult();
  }

  return handleCommand(message, storage);
}

async function handleCommand(message: Message, storage: Storage): Promise<Result> {
  const firstCommand = getFirstCommand(botName, message);

  switch (firstCommand) {
    case '/start':
    case '/help':
      return handleHelloCommand(message);
    case '/report':
      return handleReportCommand(message, storage);
    case '/personal_account':
      return handlePersonalAccountCommand(message, storage);
    case '/group_account':
      return handleGroupAccountCommand(message, storage);
    case '/period':
      return handleClosePeriod(message, storage);
    default:
      return handleUpsertExpense(message, storage);
  }
}
