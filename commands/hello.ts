import config from '../config';
import { helloMessage } from '../text';

export function handleHelloCommand() {
  return helloMessage(config.botName);
}
