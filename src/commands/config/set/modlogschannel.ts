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
			name: 'modlogschannel',
			parent: 'config-set',
			examples: ['#mod-logs', '222145952578928641'],
			args: [
				new TextChannelArgument({
					key: 'channel',
					required: true,
				}),
			],
		});
	}

	public async run(message: Message<true>, guildConfig: GuildConfig, args: ParsedArgs): Promise<void> {
		const sent = await message.reply('Updating modlogs channel...');
		await guildConfig.updateModlogsChannel(args.channel.id);
		return void (await sent.edit(`Updated modlogs channel to <#${args.channel.id}>.`));
	}
}
