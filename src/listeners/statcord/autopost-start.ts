import SigmaClient from '../../client/SigmaClient';
import Listener from '../../structures/Listener';

export default class extends Listener {
	public constructor() {
		super(__filename, {
			event: 'autopost-start',
			emitter: 'statcord',
			type: 'once',
		});
	}

	public async run(): Promise<void> {
		console.log('Started autoposting to Statcord.');
	}
}
