export namespace TelegramModel {
  export enum ChatType {
    Private = 'private'
  }

  export interface Chat {
    id: string;
    type: ChatType;
  }

  export interface User {
    username: string;
    userId: string;
  }

  export interface Message {
    message_id: number;
    text: string;
    chat: Chat;
    from: User;
    entities: MessageEntity[];
  }

  export enum MessageEntityType {
    BotCommand = 'bot_command',
    Mention = 'mention'
  }

  export interface MessageEntity {
    type: MessageEntityType;
    offset: number;
    length: number;
  }

  export interface Update {
    update_id: number;
    message: Message;
    edited_message: Message;
    date: number;
  }
}
