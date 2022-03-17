import type { Message } from 'discord.js';
import Command from '../../structures/Command';
import type GuildConfig from '../../structures/GuildConfig';

interface ParsedArgs {}

export default class extends Command<ParsedArgs> {
	public constructor() {
		super(__filename, {
			name: 'allcommands',
			parent: 'reload',
		});
	}

	public async run(message: Message<true>, guildConfig: GuildConfig, args: ParsedArgs): Promise<void> {
		const sent = await message.channel.send('Reloading all commands...');
		await this.client.commandManager.reloadAllCommands();
		await sent.edit('Reloaded all commands.');
	}
}
