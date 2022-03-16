import Listener from '../../structures/Listener';

type RunArguments = [string | boolean | Error];

export default class extends Listener<RunArguments> {
	public constructor() {
		super(__filename, {
			event: 'post',
			emitter: 'statcord',
			type: 'on',
		});
	}

	public async run([status]: RunArguments): Promise<void> {
		if (!status) {
			return void console.log('Successful post');
		}

		console.error(status);
	}
}
