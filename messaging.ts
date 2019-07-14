import axios from 'axios';
import config from './config';

const SEND_MESSAGE_URL = `https://api.telegram.org/bot${config.botToken}/sendMessage`;

export async function sendMessage(text: string, chatId: string): Promise<void> {
  try {
    await axios.post(SEND_MESSAGE_URL, {
      chat_id: chatId,
      text,
      parse_mode: 'Markdown'
    });
  } catch (error) {
    console.error(`Unable to send the message: '${text}' to the chat: ${chatId}`);
    throw error;
  }
}
