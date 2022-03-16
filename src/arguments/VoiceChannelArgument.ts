import { VoiceChannel, GuildBasedChannel, Message } from 'discord.js';
import i18next from 'i18next';
import { container } from 'tsyringe';
import SigmaClient from '../client/SigmaClient';
import { VOICE_CHANNEL } from '../constants';
import Argument, { IArgumentOptions, ParseOutput } from '../structures/Argument';

export interface ParseOptions {}

export default class VoiceChannelArgument extends Argument<VoiceChannel, ParseOptions> {
	public constructor(options: IArgumentOptions, parseOptions?: ParseOptions) {
		super(options, parseOptions);
	}

	public async parse(message: Message<true>, parse: string): Promise<ParseOutput<VoiceChannel>> {
		const client = container.resolve<SigmaClient>(SigmaClient);

		const matches = parse.match(VOICE_CHANNEL);

		if (matches) {
			const channel = client.channels.resolve(matches[1]);

			if (!channel) {
				return { err: i18next.t<string>(`argument.voice_channel.error.not_found`) };
			}

			if (!channel.isVoice()) {
				return { err: i18next.t<string>(`argument.voice_channel.error.not_voice`) };
			}

			return { parsed: channel as VoiceChannel };
		}

		if (message.inGuild()) {
			const search = parse.toLowerCase();

			const channels = message.guild.channels.cache.filter(this.channelFilterLoose(search));

			console.log(message.guild.channels.cache.map(c => c.name));

			if (channels.size === 0) return { err: i18next.t<string>(`argument.voice_channel.error.not_found`) };

			if (channels.size === 1) {
				if (!channels.first()!.isVoice()) {
					return { err: i18next.t<string>(`argument.voice_channel.error.not_voice`) };
				}
				return { parsed: channels.first()! as VoiceChannel };
			}

			const exact = message.guild.channels.cache.filter(this.channelFilterExact(search));

			if (exact.size === 1) {
				if (!exact.first()!.isVoice()) {
					return { err: i18next.t<string>(`argument.voice_channel.error.not_voice`) };
				}
				return { parsed: exact.first()! as VoiceChannel };
			}

			return { err: i18next.t<string>(`argument.voice_channel.error.too_broad`) };
		}

		return { err: i18next.t<string>(`argument.voice_channel.error.not_found`) };
	}

	private channelFilterLoose(search: string): (c: GuildBasedChannel) => boolean {
		return (c: GuildBasedChannel) => c.name.toLowerCase().includes(search);
	}

	private channelFilterExact(search: string): (c: GuildBasedChannel) => boolean {
		return (c: GuildBasedChannel) => c.name.toLowerCase() === search;
	}
}
