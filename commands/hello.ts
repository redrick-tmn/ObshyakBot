import config from '../config';
import { Message } from '../telegram';
import { helloMessage } from '../text';
import { ReplayToChatResult } from './result';

export function handleHelloCommand(message: Message): ReplayToChatResult {
  return new ReplayToChatResult(helloMessage(config.botName), message.chat.id);
}
