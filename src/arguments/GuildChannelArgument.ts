import { GuildBasedChannel, GuildChannel, Message } from 'discord.js';
import i18next from 'i18next';
import { container } from 'tsyringe';
import SigmaClient from '../client/SigmaClient';
import { CHANNEL } from '../constants';
import Argument, { IArgumentOptions, ParseOutput } from '../structures/Argument';

export interface ParseOptions {}

export default class GuildChannelArgument extends Argument<GuildChannel, ParseOptions> {
	public constructor(options: IArgumentOptions, parseOptions?: ParseOptions) {
		super(options, parseOptions);
	}

	public async parse(message: Message<true>, parse: string): Promise<ParseOutput<GuildChannel>> {
		const client = container.resolve<SigmaClient>(SigmaClient);

		const matches = parse.match(CHANNEL);

		if (matches) {
			const channel = client.channels.resolve(matches[1]);
			if (!channel) {
				return { err: i18next.t<string>(`argument.guild_channel.error.not_found`) };
			}

			if (!(channel instanceof GuildChannel)) {
				return { err: i18next.t<string>(`argument.guild_channel.error.not_guild`) };
			}

			return { parsed: channel };
		}

		if (message.inGuild()) {
			const search = parse.toLowerCase();

			const channels = message.guild.channels.cache.filter(this.channelFilterLoose(search));

			if (channels.size === 0) {
				return { err: i18next.t<string>(`argument.guild_channel.error.not_found`) };
			}

			if (channels.size === 1) {
				return { parsed: channels.first() as GuildChannel };
			}

			const exact = message.guild.channels.cache.filter(this.channelFilterExact(search));

			if (exact.size === 1) {
				return { parsed: exact.first() as GuildChannel };
			}

			return { err: i18next.t<string>(`argument.guild_channel.error.too_broad`) };
		}

		return { err: i18next.t<string>(`argument.guild_channel.error.not_found`) };
	}

	private channelFilterLoose(search: string): (c: GuildBasedChannel) => boolean {
		return (c: GuildBasedChannel) => c.name.toLowerCase().includes(search);
	}

	private channelFilterExact(search: string): (c: GuildBasedChannel) => boolean {
		return (c: GuildBasedChannel) => c.name.toLowerCase() === search;
	}
}
