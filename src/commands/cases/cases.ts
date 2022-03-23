import type { Message } from 'discord.js';
import Command from '../../structures/Command';
import type GuildConfig from '../../structures/GuildConfig';

interface ParsedArgs {}

export default class extends Command<ParsedArgs> {
	public constructor() {
		super(__filename, {
			name: 'cases',
			aliases: ['case'],
			category: 'Cases',
			subcommands: ['search', 'delete', 'update'],
		});
	}

	public async run(message: Message<true>, guildConfig: GuildConfig, args: ParsedArgs): Promise<void> {}
}
