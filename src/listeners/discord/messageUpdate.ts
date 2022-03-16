import { Constants, Message } from 'discord.js';
import Listener from '../../structures/Listener';

type RunArguments = [Message<true>, Message<true>];

export default class extends Listener<RunArguments> {
	public constructor() {
		super(__filename, {
			event: Constants.Events.MESSAGE_UPDATE,
			emitter: 'client',
			type: 'on',
		});
	}

	public async run([oldMessage, newMessage]: RunArguments): Promise<void> {
		await this.client.handleMessageUpdate(oldMessage, newMessage);
	}
}
