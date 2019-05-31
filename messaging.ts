import axios from 'axios';
import config from './config';

const SEND_MESSAGE_URL = `https://api.telegram.org/bot${config.botToken}/sendMessage`;

export interface ReplayMessage {
  text: string;
  chatId: string;
}

export async function sendMessage({ text, chatId }: ReplayMessage): Promise<void> {
  try {
    await axios.post(SEND_MESSAGE_URL, {
      chat_id: chatId,
      text
    });
  } catch (error) {
    console.error(`Unable to send the message: '${text}' to the chat: ${chatId}`);
    throw error;
  }
}
