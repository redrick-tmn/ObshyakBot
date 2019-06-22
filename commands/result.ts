export class ReplayToChatResult {
  constructor (
    public text: string,
    public chatId: string
  ) { }
}

export class NoReplayResult {}

export type Result = ReplayToChatResult | NoReplayResult;
