type ServerToClientEvents = {
	globalState: { state: GlobalState };
	filesList: { files: string[] };
	clientList: { clients: string[] };
	requestCurrentState: { requestingClientID: string };
	getStorageResult: { key: string; value: any };
}

type ClientToServerEvents = {
	play: { filename: string; time: number };
	pause: { filename: string; time: number };
	seeked: { filename: string; time: number };
	transferRequest: { targetClientID: string; state: { filename: string; time: number; isPlaying: boolean } };
	pullRequest: { sourceClientID: string };
	setStorage: { key: string; value: any };
	getStorage: { key: string };
}

type GlobalState = {
	isPlaying: boolean;
	currentTrack: string | null;
	currentTime: number;
	activeClientID: string | null;
};

declare const PARTYKIT_HOST: string;
