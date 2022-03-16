import type { Message } from 'discord.js';
import Case from '../../../structures/Case';
import Command from '../../../structures/Command';
import type GuildConfig from '../../../structures/GuildConfig';

interface ParsedArgs {}

export default class extends Command<ParsedArgs> {
	public constructor() {
		super(__filename, {
			name: 'latest',
			parent: 'cases-search',
		});
	}

	public async run(message: Message<true>, guildConfig: GuildConfig, args: ParsedArgs): Promise<void> {
		const latestCase = await Case.getLatest(message.guild.id);

		if (!latestCase) {
			return void (await message.reply('No cases found.'));
		}

		return void (await message.reply(`\`\`\`json\n${JSON.stringify(latestCase, null, 2)}\`\`\``));
	}
}
