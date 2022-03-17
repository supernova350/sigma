import type { Message } from 'discord.js';
import StringArgument from '../../arguments/StringArgument';
import Command from '../../structures/Command';
import type GuildConfig from '../../structures/GuildConfig';

interface ParsedArgs {
	type: 'command' | 'listener';
	item: string;
}

export default class extends Command<ParsedArgs> {
	public constructor() {
		super(__filename, {
			name: 'reload',
			subcommands: ['allcommands', 'alllisteners', 'all'],
			args: [
				new StringArgument(
					{
						key: 'type',
						required: true,
					},
					{
						oneOf: ['command', 'listener'],
					}
				),
				new StringArgument({
					key: 'item',
					required: true,
				}),
			],
		});
	}

	public async run(message: Message<true>, guildConfig: GuildConfig, args: ParsedArgs): Promise<void> {
		const item =
			args.type === 'command'
				? this.client.commandManager.getCommand(args.item)
				: this.client.listenerManager.getListener(args.item);

		if (!item) {
			return void (await message.channel.send(
				`${args.type === 'command' ? 'Command' : 'Listener'} \`${args.item}\` does not exist.`
			));
		}

		const sent = await message.channel.send(
			`Reloading ${args.type === 'command' ? 'command' : 'listener'} ${item.id}...`
		);

		await item.reload();
		//We can call reload because both Command and Listener
		//structures implement the reload method.

		return void (await sent.edit(`Reloaded ${args.type === 'command' ? 'command' : 'listener'} ${item.id}.`));
	}
}
