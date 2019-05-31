import config from '../config';
import { ReplayMessage } from '../messaging';
import { getUser, getUsers, setUser } from '../storage';
import { Message, Update } from '../telegram';
import { handleAccountCommand } from './account';
import { getFirstCommand } from './common';
import { handleHelloCommand } from './hello';
import { handleAddRecord, handleEditRecord } from './record';
import { handleReportCommand } from './report';

const { botName, buckets: [bucket1Users, bucket2Users] } = config;

export async function handleUpdate(update: Update): Promise<ReplayMessage> {
  if (!update) {
    console.log('[handleUpdate] Update is undefined');
    return null;
  }

  const { message, edited_message: editedMessage } = update;

  if (message) {
    return handleMessage(message);
  }

  if (editedMessage) {
    return handleEditedMessage(editedMessage);
  }

  console.log('[handleUpdate] no message or edited_message');
  return null;
}

async function handleMessage(message: Message): Promise<ReplayMessage> {
  return toReplay(
    await handleCommand(message) || await handleAddRecord(message, getUser, setUser),
    message
  );
}

async function handleEditedMessage(message: Message): Promise<ReplayMessage> {
  return toReplay(await handleEditRecord(message, getUser, setUser), message);
}

async function handleCommand(message: Message): Promise<string> {
  const firstCommand = getFirstCommand(botName, message);

  console.log(`[handleCommand] Fist command found is ${firstCommand}`);

  switch (firstCommand) {
    case '/start':
    case '/help':
      return handleHelloCommand();
    case '/report':
      return handleReportCommand(bucket1Users, bucket2Users, getUsers);
    case '/list':
      return handleAccountCommand(message.from.username, getUser);
    default:
      return null;
  }
}

async function toReplay(replayText: string, message: Message): Promise<ReplayMessage> {
  if (!replayText) {
    return null;
  }

  const result = {
    chatId: message.chat.id,
    text: replayText
  };

  console.log(`[toReplay] Replay is ${JSON.stringify(result)}`);

  return result;
}
