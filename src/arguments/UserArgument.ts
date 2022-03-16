import { GuildMember, Message, User } from 'discord.js';
import i18next from 'i18next';
import { container } from 'tsyringe';
import SigmaClient from '../client/SigmaClient';
import { USER } from '../constants';
import Argument, { IArgumentOptions, ParseOutput } from '../structures/Argument';

export interface ParseOptions {}

export default class UserArgument extends Argument<User, ParseOptions> {
	public constructor(options: IArgumentOptions, parseOptions?: ParseOptions) {
		super(options, parseOptions);
	}

	public async parse(message: Message<true>, parse: string): Promise<ParseOutput<User>> {
		const client = container.resolve<SigmaClient>(SigmaClient);

		const matches = parse.match(USER);

		if (matches) {
			const user = client.users.resolve(matches[1]);

			if (!user) {
				return { err: i18next.t<string>(`argument.user.error.not_found`) };
			}

			return { parsed: user };
		}

		if (message.inGuild()) {
			const search = parse.toLowerCase();

			const members = message.guild.members.cache.filter(this.memberFilterLoose(search));

			if (members.size === 0) {
				return { err: i18next.t<string>(`argument.user.error.not_found`) };
			}

			if (members.size === 1) {
				return { parsed: members.first()!.user };
			}

			const exact = message.guild.members.cache.filter(this.memberFilterExact(search));

			if (exact.size === 1) {
				return { parsed: exact.first()!.user };
			}

			return { err: i18next.t<string>(`argument.user.error.too_broad`) };
		}

		return { err: i18next.t<string>(`argument.user.error.not_found`) };
	}

	private memberFilterExact(search: string): (m: GuildMember) => boolean {
		return (m: GuildMember) => {
			return (
				m.user.username.toLowerCase().includes(search) ||
				(m.nickname && m.nickname.toLowerCase().includes(search)) ||
				m.user.tag.toLowerCase().includes(search)
			);
		};
	}

	private memberFilterLoose(search: string): (m: GuildMember) => boolean {
		return (m: GuildMember) => {
			return (
				m.user.username.toLowerCase().includes(search) ||
				(m.nickname && m.nickname.toLowerCase().includes(search)) ||
				m.user.tag.toLowerCase().includes(search)
			);
		};
	}
}
