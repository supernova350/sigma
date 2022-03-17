import type { Message } from 'discord.js';
import GuildConfig from '../../structures/GuildConfig';
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
		if (message.author.bot || !message.content) {
			return;
		}

		if (!message.inGuild()) {
			//This is temporary
			return;
		}

		const guildConfig = await GuildConfig.get(message.guild.id);

		if (message.content.startsWith(guildConfig.getPrefix())) {
			return void (await this.client.commandManager.handleCommandMessage(message, guildConfig));
		}
	}
}
