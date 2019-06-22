import * as _ from 'lodash';

import { handleUpdate } from './commands';
import { ReplayToChatResult } from './commands/result';
import { sendMessage } from './messaging';
import { Storage } from './storage';
import { Update } from './telegram';

const storage = new Storage();

export async function main(req, res): Promise<void> {
  try {
    const update = <Update>req.body;
    if (!update) {
      res.sendStatus(200);
      return;
    }

    const result = await handleUpdate(update, storage);

    if (result instanceof ReplayToChatResult) {
      await sendMessage(result.text, result.chatId);
    }

    res.sendStatus(200);
  } catch (error) {
    console.error(error);
    res.sendStatus(500);
  }
}
