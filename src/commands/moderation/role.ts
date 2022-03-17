import type { GuildMember, Message } from 'discord.js';
import DurationArgument from '../../arguments/DurationArgument';
import MemberArgument from '../../arguments/MemberArgument';
import StringArgument from '../../arguments/StringArgument';
import Case, { CaseAction } from '../../structures/Case';
import Command from '../../structures/Command';
import type GuildConfig from '../../structures/GuildConfig';
import humanizeDuration from 'humanize-duration';

interface ParsedArgs {
	member: GuildMember;
	duration: number;
	reason?: string;
}

export default class extends Command<ParsedArgs> {
	public constructor() {
		super(__filename, {
			name: 'role',
			args: [
				new MemberArgument({
					key: 'member',
					required: true,
				}),
				new DurationArgument({
					key: 'duration',
					required: false,
				}),
				new StringArgument({
					key: 'reason',
					required: false,
					rest: true,
				}),
			],
		});
	}

	public async run(message: Message<true>, guildConfig: GuildConfig, args: ParsedArgs): Promise<void> {
		const caseData = await Case.create({
			action: CaseAction.Role,
			userID: args.member.id,
			guildID: message.guild.id,
			modID: message.author.id,
			reason: args.reason ?? undefined,
			duration: args.duration ?? undefined,
		});

		return void (await message.channel.send(
			`Roled <@${args.member.user.id}>${args.duration ? ` for ${humanizeDuration(args.duration)}` : ''}.`
		));
	}
}
