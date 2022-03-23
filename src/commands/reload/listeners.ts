import type { Message } from 'discord.js';
import Command from '../../structures/Command';
import type GuildConfig from '../../structures/GuildConfig';

interface ParsedArgs {}

export default class extends Command<ParsedArgs> {
	public constructor() {
		super(__filename, {
			name: 'listeners',
			parent: 'reload',
			ownerOnly: true,
		});
	}

	public async run(message: Message<true>, guildConfig: GuildConfig, args: ParsedArgs): Promise<void> {
		const sent = await message.channel.send('Reloading all listeners...');
		await this.client.listenerManager.reloadAllListeners();
		await sent.edit('Reloaded all listeners.');
	}
}
