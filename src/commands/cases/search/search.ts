import type { Message } from 'discord.js';
import IntegerArgument from '../../../arguments/IntegerArgument';
import Case from '../../../structures/Case';
import Command from '../../../structures/Command';
import type GuildConfig from '../../../structures/GuildConfig';

interface ParsedArgs {
	caseID: number;
}

export default class extends Command<ParsedArgs> {
	public constructor() {
		super(__filename, {
			name: 'search',
			parent: 'cases',
			subcommands: ['latest'],
			args: [
				new IntegerArgument({
					key: 'caseID',
					required: true,
				}),
			],
		});
	}

	public async run(message: Message<true>, guildConfig: GuildConfig, args: ParsedArgs): Promise<void> {
		const caseData = await Case.search({
			guildID: message.guild.id,
			caseID: args.caseID,
		});

		if (!caseData) {
			return void (await message.reply(`No case found with that ID.`));
		}

		return void (await message.reply(`\`\`\`json\n${JSON.stringify(caseData, null, 2)}\`\`\``));
	}
}
