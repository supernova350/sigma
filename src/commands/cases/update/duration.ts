import type { Message } from 'discord.js';
import IntegerArgument from '../../../arguments/IntegerArgument';
import Case from '../../../structures/Case';
import Command from '../../../structures/Command';
import type GuildConfig from '../../../structures/GuildConfig';

interface ParsedArgs {
	caseID: number;
	duration: number;
}

export default class extends Command<ParsedArgs> {
	public constructor() {
		super(__filename, {
			name: 'duration',
			parent: 'cases-update',
			aliases: ['dur'],
			args: [
				new IntegerArgument({
					key: 'caseID',
					required: true,
				}),
				new IntegerArgument({
					key: 'duration',
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
			return void (await message.channel.send(`No case with ID ${args.caseID} was found.`));
		}

		await caseData.updateDuration(args.duration);

		return void (await message.channel.send('Duration updated.'));
	}
}
