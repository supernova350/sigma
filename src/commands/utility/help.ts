import { Message, MessageEmbed } from 'discord.js';
import StringArgument from '../../arguments/StringArgument';
import { CARROT } from '../../constants';
import Command from '../../structures/Command';
import type GuildConfig from '../../structures/GuildConfig';

interface ParsedArgs {
	command?: string;
}

export default class extends Command<ParsedArgs> {
	public constructor() {
		super(__filename, {
			name: 'help',
			category: 'Utility',
			args: [
				new StringArgument({
					key: 'command',
					required: false,
					rest: true,
				}),
			],
		});
	}

	public async run(message: Message<true>, guildConfig: GuildConfig, args: ParsedArgs): Promise<void> {
		if (args.command) {
			const command = this.client.commandManager.getCommand(args.command);

			if (!command) {
				return void (await message.channel.send(`Command \`${args.command}\` does not exist.`));
			}

			const usage = command.getCommandUsage();

			const embed = new MessageEmbed()
				.setColor('AQUA')
				.addField(`${CARROT} Command Help`, `Type \`${guildConfig.getPrefix()}help\` to see all commands.`)
				.addField(
					'❯ Usage',
					`\`${guildConfig.getPrefix()}${command.id.replaceAll('-', ' ')}${usage ? ` ${usage}` : ''}\``
				);

			const commandExamples = command.getCommandExamples(guildConfig.getPrefix());

			if (commandExamples) {
				embed.addField('❯ Examples', commandExamples.join('\n'));
			}

			return void (await message.channel.send({ embeds: [embed] }));
		}

		const embed = new MessageEmbed().setColor('AQUA');

		embed.addField(
			'❯ Commands',
			[
				'A list of available commands.',
				`For additional info on a command, type \`${guildConfig.getPrefix()}help <command>\`.`,
			].join('\n')
		);

		this.client.commandManager.getCategories().forEach((commands, category) => {
			embed.addField(category, commands.map(command => `\`${command}\``).join(', '));
		});

		return void (await message.channel.send({ embeds: [embed] }));
	}
}
