import type { Message } from 'discord.js';
import Command from '../../structures/Command';
import type GuildConfig from '../../structures/GuildConfig';

interface ParsedArgs {}

export default class extends Command<ParsedArgs> {
	public constructor() {
		super(__filename, {
			name: 'config',
			aliases: ['cfg'],
			category: 'Config',
			subcommands: ['set', 'view'],
		});
	}

	public async run(message: Message<true>, guildConfig: GuildConfig, args: ParsedArgs): Promise<void> {}
}
