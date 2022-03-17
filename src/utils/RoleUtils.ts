import type { GuildMember } from 'discord.js';
import { container } from 'tsyringe';
import SigmaClient from '../client/SigmaClient';

export default class RoleUtils {
	//Should not be allowed to construct a RoleUtils instance.
	private constructor() {}

	//Return true if the bot's highest role is higher than the given member's highest role.
	public static highestRoleCheck(member: GuildMember): boolean {
		const client = container.resolve<SigmaClient>(SigmaClient);

		if (!member.guild.me?.roles.highest) {
			return false;
		}

		//If the given member's highest role is higher than the bot's highest role
		if (member.roles.highest > member.guild.me?.roles.highest) {
			return false;
		}

		return true;
	}
}
