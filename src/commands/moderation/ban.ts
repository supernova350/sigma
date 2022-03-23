import { GuildMember, Message, Permissions } from 'discord.js';
import MemberArgument from '../../arguments/MemberArgument';
import StringArgument from '../../arguments/StringArgument';
import Case, { CaseAction } from '../../structures/Case';
import Command from '../../structures/Command';
import type GuildConfig from '../../structures/GuildConfig';
import humanizeDuration from 'humanize-duration';
import RoleUtils from '../../utils/RoleUtils';

interface ParsedArgs {
	member: GuildMember;
	duration: number;
	reason?: string;
}

export default class extends Command<ParsedArgs> {
	public constructor() {
		super(__filename, {
			name: 'ban',
			category: 'Moderation',
			clientPerms: ['BAN_MEMBERS'],
			userPerms: ['BAN_MEMBERS'],
			args: [
				new MemberArgument({
					key: 'member',
					required: true,
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
		if (!RoleUtils.highestRoleCheck(args.member)) {
			return void (await message.channel.send(`<@${args.member.user.id}> has a higher role than me.`));
		}

		if (!args.member.moderatable) {
			return void (await message.channel.send(`<@${args.member.user.id}> is not moderatable.`));
		}

		if (!args.member.manageable) {
			return void (await message.channel.send(`<@${args.member.user.id}> is not manageable.`));
		}

		const caseData = await Case.create({
			action: CaseAction.Ban,
			userID: args.member.id,
			guildID: message.guild.id,
			modID: message.author.id,
			reason: args.reason ?? undefined,
			duration: args.duration ?? undefined,
		});

		return void (await message.channel.send(
			`Banned <@${args.member.user.id}>${args.duration ? ` for ${humanizeDuration(args.duration)}` : ''}.`
		));
	}
}
