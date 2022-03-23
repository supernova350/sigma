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
			name: 'memberlogschannel',
			parent: 'config-set',
			examples: ['#member-logs', '232305140672102400'],
			args: [
				new TextChannelArgument({
					key: 'channel',
					required: true,
				}),
			],
		});
	}

	public async run(message: Message<true>, guildConfig: GuildConfig, args: ParsedArgs): Promise<void> {
		const sent = await message.reply('Updating memberlogs channel...');
		await guildConfig.updateMemberlogsChannel(args.channel.id);
		return void (await sent.edit(`Updated memberlogs channel to <#${args.channel.id}>.`));
	}
}
