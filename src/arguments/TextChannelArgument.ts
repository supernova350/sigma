import { GuildBasedChannel, Message, TextChannel } from 'discord.js';
import i18next from 'i18next';
import { container } from 'tsyringe';
import SigmaClient from '../client/SigmaClient';
import { CHANNEL } from '../constants';
import Argument, { IArgumentOptions, ParseOutput } from '../structures/Argument';

export interface ParseOptions {}

export default class TextChannelArgument extends Argument<TextChannel, ParseOptions> {
	public constructor(options: IArgumentOptions, parseOptions?: ParseOptions) {
		super(options, parseOptions);
	}

	public async parse(message: Message<true>, parse: string): Promise<ParseOutput<TextChannel>> {
		const client = container.resolve<SigmaClient>(SigmaClient);

		const matches = parse.match(CHANNEL);

		if (matches) {
			const channel = client.channels.resolve(matches[1]);
			if (!channel) {
				return { err: i18next.t<string>(`argument.text_channel.error.not_found`) };
			}

			if (!channel.isText()) {
				return { err: i18next.t<string>(`argument.text_channel.error.not_text`) };
			}

			return { parsed: channel as TextChannel };
		}

		if (message.inGuild()) {
			const search = parse.toLowerCase();

			const channels = message.guild.channels.cache.filter(this.channelFilterLoose(search));

			if (channels.size === 0) {
				return { err: i18next.t<string>(`argument.text_channel.error.not_found`) };
			}

			if (channels.size === 1) {
				if (!channels.first()!.isText()) {
					return { err: i18next.t<string>(`argument.text_channel.error.not_text`) };
				}
				return { parsed: channels.first() as TextChannel };
			}

			const exact = message.guild.channels.cache.filter(this.channelFilterExact(search));

			if (exact.size === 1) {
				if (!exact.first()!.isText()) {
					return { err: i18next.t<string>(`argument.text_channel.error.not_text`) };
				}
				return { parsed: exact.first() as TextChannel };
			}

			return { err: i18next.t<string>(`argument.text_channel.error.too_broad`) };
		}

		return { err: i18next.t<string>(`argument.text_channel.error.not_found`) };
	}

	private channelFilterLoose(search: string): (c: GuildBasedChannel) => boolean {
		return (c: GuildBasedChannel) => c.name.toLowerCase().includes(search);
	}

	private channelFilterExact(search: string): (c: GuildBasedChannel) => boolean {
		return (c: GuildBasedChannel) => c.name.toLowerCase() === search;
	}
}
