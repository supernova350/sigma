import type { Message, TextChannel } from 'discord.js';
import TextChannelArgument from '../../../arguments/TextChannelArgument';
import Command from '../../../structures/Command';
import type GuildConfig from '../../../structures/GuildConfig';

interface ParsedArgs {
	channel?: TextChannel;
}

export default class extends Command<ParsedArgs> {
	public constructor() {
		super(__filename, {
			name: 'modlogs-channel',
			parent: 'config-set',
			args: [
				new TextChannelArgument({
					key: 'channel',
					required: false,
				}),
			],
		});
	}

	public async run(message: Message<true>, guildConfig: GuildConfig, args: ParsedArgs): Promise<void> {
		if (!args.channel) {
			return void (await message.reply(
				`The current modlogs channel is ${
					guildConfig.getModlogsChannel().length ? `<#${guildConfig.getModlogsChannel}>` : 'not set'
				}.`
			));
		}

		const sent = await message.reply('Updating modlogs channel...');
		await guildConfig.updateModlogsChannel(args.channel.id);
		return void (await sent.edit(`Updated modlogs channel to <#${args.channel.id}>.`));
	}
}
