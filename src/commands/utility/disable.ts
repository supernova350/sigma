import type { Message } from 'discord.js';
import StringArgument from '../../arguments/StringArgument';
import Command from '../../structures/Command';
import type GuildConfig from '../../structures/GuildConfig';

interface ParsedArgs {
	command: string;
}

export default class extends Command<ParsedArgs> {
	public constructor() {
		super(__filename, {
			name: 'disable',
			args: [
				new StringArgument({
					key: 'command',
					required: true,
				}),
			],
		});
	}

	public async run(message: Message<true>, guildConfig: GuildConfig, args: ParsedArgs): Promise<void> {
		const command = this.client.commandManager.getCommand(args.command);
		if (!command) {
			return void (await message.channel.send(`Command \`${args.command}\` does not exist.`));
		}

		const sent = await message.channel.send(`Disabling command \`${command.name}\`...`);
		if (!(await guildConfig.disableCommand(command))) {
			return void sent.edit(`Command \`${command.name}\` is already disabled.`);
		}

		return void (await sent.edit(`Disabled command \`${command.name}\`.`));
	}
}
