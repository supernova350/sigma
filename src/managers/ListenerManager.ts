import type SigmaClient from '../client/SigmaClient';
import ListenerStore from '../stores/ListenerStore';

export default class ListenerManager extends ListenerStore {
	public constructor(client: SigmaClient) {
		super(client);
	}

	public async init(): Promise<void> {
		await super.loadListenersIn('../listeners/**/*.js');
	}
}
