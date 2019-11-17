import config from '../config';
import { BotModel } from '../model';
import { helloMessage } from '../text';

export function handleHelloCommand(command: BotModel.Message): BotModel.ReplayToChatResult {
  return new BotModel.ReplayToChatResult(helloMessage(config.botName), command.chatId);
}
