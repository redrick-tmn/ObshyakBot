import { handleUpdate } from './commands';
import { sendMessage } from './messaging';
import { BotModel } from './model/bot';
import { TelegramModel } from './model/telegram';
import { Storage } from './storage';

const storage = new Storage();

export async function main(req, res): Promise<void> {
  try {
    const update = <TelegramModel.Update>req.body;
    if (!update) {
      res.sendStatus(200);
      return;
    }

    console.log('Update received', JSON.stringify(update));

    const result = await handleUpdate(update, storage);

    if (result instanceof BotModel.ReplayToChatResult) {
      await sendMessage(result.text, result.chatId);
    }

    res.sendStatus(200);
  } catch (error) {
    console.error(error);
    res.sendStatus(500);
  }
}
