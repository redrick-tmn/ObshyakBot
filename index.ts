import * as _ from 'lodash';

import { handleUpdate } from './commands';
import { sendMessage } from './messaging';
import { Update } from './telegram';

export async function main(req, res) {
  try {
    if (req.body) {
      const update = <Update>req.body;
      console.log(JSON.stringify(update));

      const replay = await handleUpdate(update);
      if (replay) {
        await sendMessage(replay);
      }
    }

    res.sendStatus(200);
  } catch (error) {
    console.error(error);
    res.sendStatus(500);
  }
}
