import { Message, MessageEmbed } from 'discord.js';
import { Client as StatcordClient } from 'statcord.js';
import SigmaClient from '../client/SigmaClient';
import type Command from '../structures/Command';
import type GuildConfig from '../structures/GuildConfig';
import CommandStore from '../stores/CommandStore';

export default class CommandManager extends CommandStore {
	public readonly statcord: StatcordClient;

	public constructor(client: SigmaClient) {
		super(client);

		this.statcord = new StatcordClient({
			key: `statcord.com-${process.env.STATCORD_API_KEY}`,
			client: this.client,
			postCpuStatistics: false,
			postMemStatistics: false,
			postNetworkStatistics: false,
		});
	}

	public async init(): Promise<void> {
		await this.loadCommandsIn('../commands/**/*.js');
	}

	public async handleCommandMessage(message: Message<true>, guildConfig: GuildConfig): Promise<void> {
		const args = message.content.slice(guildConfig.getPrefix().length).split(/ +/);

		if (!args.length) {
			return;
		}

		const commandName = args.shift()?.toLowerCase();

		if (!commandName?.length) {
			return;
		}

		let command = this.getCommand(commandName);

		if (!command) {
			//Send a message saying that the command doesn't exist
			await message.channel.send(`Command \`${commandName}\` does not exist.`);
			return;
		}

		let toShift = 0;

		for (let i = 0; i < args.length; i++) {
			let foundSubcommandAlias = false;
			if (command.subcommands) {
				for (const subcommandName of command.subcommands) {
					const subcommand = this.getCommand(`${command.id}-${subcommandName}`);

					if (!(subcommand && subcommand.aliases)) {
						continue;
					}

					if (subcommand.aliases.includes(args[i])) {
						foundSubcommandAlias = true;
						command = subcommand;
						toShift++;
					}
				}

				if (!foundSubcommandAlias && command.subcommands?.includes(args[i].toLowerCase())) {
					command = this.getCommand(`${command?.id}-${args[i]}`);
					toShift++;
				}
			}

			if (!command) {
				//Shouldn't happen, but just in case
				throw new Error(`Command ${commandName}-${args[i]} does not exist.`);
			}
		}

		for (let i = 0; i < toShift; i++) {
			args.shift();
		}

		//Here, command has been established as either a regular command or subcommand.
		if (command.ownerOnly && message.author.id !== process.env.OWNER_ID) {
			//If command is owner only and user is not the owner, return.
			return;
		}

		if (!(await guildConfig.isCommandEnabled(command))) {
			//If command is disabled in this guild, return.
			return void (await message.channel.send(`Command \`${commandName}\` is disabled in this guild.`));
		}

		//Needs refactoring
		if (!command.canMemberRun(message.member!)) {
			//If user is not allowed to run the command, return.
			return void (await message.channel.send(
				`You are not allowed to run the command \`${commandName}\`.\nMissing permissions: ${command
					.missingMemberPerms(message.member!)
					.map(perm => `\`${perm}\``)
					.join(', ')}`
			));
		}

		//Message#guild#me has to be non-null, because we check isGuild() above.
		if (!command.canClientRun(message.guild)) {
			//If bot is not allowed to run the command, return.
			return void (await message.channel.send(
				`I am not allowed to run the command \`${commandName}\`.\nMissing permissions: ${command
					.missingMemberPerms(message.guild.me!)
					.join(', ')}`
			));
		}

		const parsed = await CommandManager.parseCommandArguments(message, guildConfig, args, command);

		if (!parsed && command.args?.length) {
			//Don't run the command.
			return;
		}

		await this.statcord.postCommand(command.id, message.author.id);
		await command.run(message, guildConfig, parsed);
	}

	public static async parseCommandArguments(
		message: Message<true>,
		guildConfig: GuildConfig,
		args: string[],
		command: Command
	): Promise<Record<string, unknown> | undefined> {
		//If command does not have any arguments, return undefined.
		if (!command.args?.length) {
			return undefined;
		}

		const parsed: Record<string, unknown> = {};

		for (
			let expectedArgsIndex = 0, providedArgsIndex = 0;
			expectedArgsIndex < command.args.length;
			expectedArgsIndex++
		) {
			const expectedArg = command.args[expectedArgsIndex];

			if (
				!args[providedArgsIndex] ||
				!args[providedArgsIndex].length ||
				typeof args[providedArgsIndex] !== 'string'
			) {
				if (!expectedArg.required) {
					continue;
				}

				//If the argument is required and there are no more arguments,
				//then we know that they provided an invalid argument.

				const embed = new MessageEmbed()
					.setColor('AQUA')
					.addField(
						'❯ Command Usage',
						`\`${guildConfig.getPrefix()}${command.id.replaceAll('-', ' ')} ${command.getCommandUsage()}\``
					)
					.setDescription(`Please provide a valid \`${expectedArg.key}\` argument.`);

				const commandExamples = command.getCommandExamples(guildConfig.getPrefix());

				if (commandExamples) {
					embed.addField('❯ Commmand Examples', commandExamples.join('\n'));
				}

				await message.channel.send({ embeds: [embed] });
				return undefined;
			}

			if (expectedArg.rest) {
				const str = args.slice(providedArgsIndex).join(' ');
				const res = await expectedArg.parse(message, str);

				if (res.err) {
					await message.channel.send(res.err);
					return undefined;
				}

				parsed[expectedArg.key] = res.parsed;
				return parsed;
			}

			const res = await expectedArg.parse(message, args[providedArgsIndex]);

			if (res.err) {
				if (!expectedArg.required) {
					parsed[expectedArg.key] = undefined;
					continue;
				}

				await message.channel.send(res.err);
				return undefined;
			}

			parsed[expectedArg.key] = res.parsed;

			providedArgsIndex++;
		}

		return parsed;
	}
}
