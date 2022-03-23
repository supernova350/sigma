import type { Message, TextChannel } from 'discord.js';
import TextChannelArgument from '../../../arguments/TextChannelArgument';
import Command from '../../../structures/Command';
import type GuildConfig from '../../../structures/GuildConfig';

interface ParsedArgs {
	channel: TextChannel;
}

export default class extends Command<ParsedArgs> {
	public constructor() {
		super(__filename, {
			name: 'messagelogschannel',
			parent: 'config-set',
			examples: ['#mesasge-logs', '232305140672102400'],
			args: [
				new TextChannelArgument({
					key: 'channel',
					required: true,
				}),
			],
		});
	}

	public async run(message: Message<true>, guildConfig: GuildConfig, args: ParsedArgs): Promise<void> {
		const sent = await message.reply('Updating messagelogs channel...');
		await guildConfig.updateMessagelogsChannel(args.channel.id);
		return void (await sent.edit(`Updated messagelogs channel to <#${args.channel.id}>.`));
	}
}
