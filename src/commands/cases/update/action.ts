import type { Message } from 'discord.js';
import Case, { CaseAction } from '../../../structures/Case';
import Command from '../../../structures/Command';
import type GuildConfig from '../../../structures/GuildConfig';

interface ParsedArgs {
	caseID: number;
	action: CaseAction;
}

export default class extends Command<ParsedArgs> {
	public constructor() {
		super(__filename, {
			name: 'action',
			parent: 'cases-update',
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

		await caseData.updateAction(args.action);

		return void (await message.channel.send('Action updated.'));
	}
}
