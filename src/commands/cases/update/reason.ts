import type { Message } from 'discord.js';
import IntegerArgument from '../../../arguments/IntegerArgument';
import StringArgument from '../../../arguments/StringArgument';
import Case from '../../../structures/Case';
import Command from '../../../structures/Command';
import type GuildConfig from '../../../structures/GuildConfig';

interface ParsedArgs {
	caseID: number;
	reason: string;
}

export default class extends Command<ParsedArgs> {
	public constructor() {
		super(__filename, {
			name: 'reason',
			parent: 'cases-update',
			args: [
				new IntegerArgument({
					key: 'caseID',
					required: true,
				}),
				new StringArgument(
					{
						key: 'reason',
						required: true,
					},
					{
						maxLength: 200,
					}
				),
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

		await caseData.updateReason(args.reason);

		return void (await message.channel.send('Reason updated.'));
	}
}
