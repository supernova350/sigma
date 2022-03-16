import { Message, Role } from 'discord.js';
import i18next from 'i18next';
import { USER } from '../constants';
import Argument, { IArgumentOptions, ParseOutput } from '../structures/Argument';

export interface ParseOptions {}

export default class RoleArgument extends Argument<Role, ParseOptions> {
	public constructor(options: IArgumentOptions, parseOptions?: ParseOptions) {
		super(options, parseOptions);
	}

	public async parse(message: Message<true>, parse: string): Promise<ParseOutput<Role>> {
		const matches = parse.match(USER);

		if (matches) {
			const role = message.guild.roles.resolve(matches[1]);

			if (!role) {
				return { err: i18next.t<string>(`argument.user.role.not_found`) };
			}

			return { parsed: role };
		}

		if (message.inGuild()) {
			const search = parse.toLowerCase();

			const roles = message.guild.roles.cache.filter(r => r.name.toLowerCase().includes(search));

			if (roles.size === 0) {
				return { err: i18next.t<string>(`argument.role.error.not_found`) };
			}

			if (roles.size === 1) {
				return { parsed: roles.first()! };
			}

			const exact = message.guild.roles.cache.filter(r => r.name.toLowerCase() === search);

			if (exact.size === 1) {
				return { parsed: exact.first()! };
			}

			return { err: i18next.t<string>(`argument.role.error.too_broad`) };
		}

		return { err: i18next.t<string>(`argument.role.error.not_found`) };
	}
}
