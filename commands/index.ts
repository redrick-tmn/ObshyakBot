import { BotModel, TelegramModel } from '../model';
import { Storage } from '../storage';
import { handleClosePeriod } from './close-period';
import { handleGroupAccountCommand } from './group-account';
import { handleHelloCommand } from './hello';
import { handlePersonalAccountCommand } from './personal-account';
import { handleUpsertExpense } from './record';
import { handleReportCommand } from './report';

export async function handleUpdate(update: TelegramModel.Update, storage: Storage): Promise<BotModel.Result> {
  const message = BotModel.fromUpdate(update);

  if (!message) {
    return new BotModel.NoReplayResult();
  }

  const firstCommand = message.commands[0];

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
