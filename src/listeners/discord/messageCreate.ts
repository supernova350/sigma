import type { Message } from 'discord.js';
import Listener from '../../structures/Listener';

type RunArguments = [Message<true>];

export default class extends Listener<RunArguments> {
	public constructor() {
		super(__filename, {
			event: 'messageCreate',
			emitter: 'client',
			type: 'on',
		});
	}

	public async run([message]: RunArguments): Promise<void> {
		await this.client.handleMessageCreate(message);
	}
}
