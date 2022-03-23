import { Message, MessageEmbed } from 'discord.js';
import { CARROT } from '../../../constants';
import Command from '../../../structures/Command';
import type GuildConfig from '../../../structures/GuildConfig';

interface ParsedArgs {}

export default class extends Command<ParsedArgs> {
	public constructor() {
		super(__filename, {
			name: 'view',
			parent: 'config',
		});
	}

	public async run(message: Message<true>, guildConfig: GuildConfig, args: ParsedArgs): Promise<void> {
		const embed = new MessageEmbed()
			.setColor('AQUA')
			.addField(`${CARROT} Config`, 'This is your current guild configuration.');

		embed.addField(`${CARROT} Prefix`, `\`${guildConfig.getPrefix()}\``);
		//If gulidConfig.getModlogsChannel() is undefined, add a field with value 'None'
		embed.addField(
			`${CARROT} Modlogs Channel`,
			guildConfig.getModlogsChannel() ? `<#${guildConfig.getModlogsChannel()}>` : 'Not set'
		);
		//If gulidConfig.getMemberlogsChannel() is undefined, add a field with value 'None'
		embed.addField(
			`${CARROT} Memberlogs Channel`,
			guildConfig.getMemberlogsChannel() ? `<#${guildConfig.getMemberlogsChannel()}>` : 'Not set'
		);
		//If gulidConfig.getMessagelogsChannel() is undefined, add a field with value 'None'
		embed.addField(
			`${CARROT} Messagelogs Channel`,
			guildConfig.getMessagelogsChannel() ? `<#${guildConfig.getMessagelogsChannel()}>` : 'Not set'
		);

		return void (await message.channel.send({ embeds: [embed] }));
	}
}
