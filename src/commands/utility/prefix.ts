import type { Message } from 'discord.js';
import StringArgument from '../../arguments/StringArgument';
import Command from '../../structures/Command';
import type GuildConfig from '../../structures/GuildConfig';

interface ParsedArgs {
	prefix?: string;
}

export default class extends Command<ParsedArgs> {
	public constructor() {
		super(__filename, {
			name: 'prefix',
			category: 'Utility',
			args: [
				new StringArgument({
					key: 'prefix',
					required: false,
				}),
			],
		});
	}

	public async run(message: Message<true>, guildConfig: GuildConfig, args: ParsedArgs): Promise<void> {
		console.log(args);

		if (!args.prefix) {
			return void (await message.reply(`The current prefix is \`${guildConfig.getPrefix()}\`.`));
		}

		const sent = await message.reply('Updating prefix...');
		await guildConfig.updatePrefix(args.prefix);
		return void (await sent.edit(`Updated prefix to \`${args.prefix}\`.`));
	}
}
