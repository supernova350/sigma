import SigmaClient from '../../client/SigmaClient';
import Listener from '../../structures/Listener';

type RunArguments = [SigmaClient];

export default class extends Listener<RunArguments> {
	public constructor() {
		super(__filename, {
			event: 'ready',
			emitter: 'client',
			type: 'once',
		});
	}

	public async run([client]: RunArguments): Promise<void> {
		await this.client.statcord.autopost();
		console.log('Bot is connected to the Discord Gateway.');
	}
}
