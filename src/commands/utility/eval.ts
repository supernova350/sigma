import djs, { Message, MessageAttachment } from 'discord.js';
import StringArgument from '../../arguments/StringArgument';
import Command from '../../structures/Command';
import type GuildConfig from '../../structures/GuildConfig';
import { inspect } from 'util';
import { performance } from 'perf_hooks';
import { VM } from 'vm2';
import { request } from 'undici';

interface ParsedArgs {
	code: string;
}

export default class extends Command<ParsedArgs> {
	public constructor() {
		super(__filename, {
			name: 'eval',
			category: 'Utility',
			ownerOnly: true,
			args: [
				new StringArgument(
					{
						key: 'code',
						required: true,
						rest: true,
					},
					{
						minLength: 1,
						maxLength: 1500,
					}
				),
			],
		});
	}

	public async run(message: Message<true>, guildConfig: GuildConfig, args: ParsedArgs): Promise<void> {
		const vm = new VM({
			eval: false,
			timeout: 1000,
			sandbox: {
				client: this.client,
				message,
				guildConfig,
				args,
				djs,
				request,
			},
		});

		const destroy = this.client.destroy;

		Object.defineProperty(this.client, 'destroy', {
			enumerable: true,
			configurable: true,
			value: null,
		});

		const start = performance.now();

		try {
			var evaled = vm.run(args.code);

			if (evaled && typeof evaled.then === 'function') {
				evaled = await evaled;
			}
		} catch (e) {
			const error = e as Error;

			return void (await message.reply(`\`\`\`xl\n${error.stack}\n\`\`\``));
		}

		const duration = performance.now() - start;

		Object.defineProperty(this.client, 'destroy', {
			value: destroy,
		});

		if (typeof evaled !== 'string') {
			evaled = inspect(evaled, { depth: 0 });
		}

		if (`\`\`\`js\n${evaled}\`\`\``.length < 2000) {
			return void (await message.reply(`\`\`\`js\n${evaled}\`\`\`\nTime taken: \`${duration.toFixed(2)}ms\`.`));
		}

		const file = new MessageAttachment(Buffer.from(evaled), 'eval.js');

		return void (await message.reply({
			content: [
				'The eval result was over 2000 characters so it was uploaded as a file.',
				`\`${duration.toFixed(2)}\` ms`,
			].join('\n'),
			files: [file],
		}));
	}
}
