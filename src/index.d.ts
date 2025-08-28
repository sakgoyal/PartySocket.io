type ServerToClientEvents = {
  clientList: { clients: string[] };
  getStorageResult: { key: string; value: any };
  play: { filename: string; time: number };
};

type ClientToServerEvents = {
  play: { filename: string; time: number; broadcast?: true };
  pullRequest: { sourceClientID: string; broadcast?: true };
  setStorage: { key: string; value: any };
  getStorage: { key: string };
};

declare const PARTYKIT_HOST: string;
