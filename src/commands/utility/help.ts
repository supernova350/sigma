import type { Message } from 'discord.js';
import StringArgument from '../../arguments/StringArgument';
import Command from '../../structures/Command';
import type GuildConfig from '../../structures/GuildConfig';

interface ParsedArgs {
	command?: string;
}

export default class extends Command<ParsedArgs> {
	public constructor() {
		super(__filename, {
			name: 'help',
			args: [
				new StringArgument({
					key: 'command',
					required: false,
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

			if (!usage) {
				return void (await message.channel.send(`Command \`${args.command}\` does not have any arguments.`));
			}

			return void (await message.channel.send(usage));
		}
	}
}
