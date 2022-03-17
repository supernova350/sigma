import { Client, Constants, Intents, Message, PartialMessage } from 'discord.js';
import IORedis from 'ioredis';
import Command from '../structures/Command';
import { container } from 'tsyringe';
import CommandStore from '../stores/CommandStore';
import ListenerStore from '../stores/ListenerStore';
import Statcord from 'statcord.js';
import GuildConfig from '../structures/GuildConfig';

export default class SigmaClient extends Client<true> {
	public readonly redis: IORedis.Redis;
	public readonly commands: CommandStore;
	public readonly _listeners: ListenerStore;
	public readonly statcord: Statcord.Client;

	public constructor() {
		super({
			intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES],
			partials: ['MESSAGE', 'CHANNEL', 'REACTION'],
		});

		this.redis = new IORedis(process.env.REDIS_URL);
		this.statcord = new Statcord.Client({
			key: `statcord.com-${process.env.STATCORD_API_KEY}`,
			client: this,
			postCpuStatistics: true /* Whether to post CPU statistics or not, defaults to true */,
			postMemStatistics: true /* Whether to post memory statistics or not, defaults to true */,
			postNetworkStatistics: true /* Whether to post network statistics or not, defaults to true */,
		});

		this.commands = new CommandStore(this);
		this._listeners = new ListenerStore(this);
	}

	public async connect(): Promise<void> {
		//Load commands and listeners
		try {
			await this.commands.loadCommandsIn('../commands/**/*.js');
			await this._listeners.loadListenersIn('../listeners/**/*.js');
		} catch (e) {
			const error = e as Error;

			console.log(error);
		}

		//Login to the Discord Gateway
		await super.login(process.env.BOT_TOKEN);
	}

	public async handleMessageUpdate(
		oldMessage: Message | PartialMessage,
		newMessage: Message | PartialMessage
	): Promise<void> {
		if (newMessage.partial) {
			await newMessage.fetch().catch(() => null);
			if (newMessage.partial) {
				//If newMessage is still partial, something went wrong.
				return;
			}
		}

		if (newMessage.author.bot || !newMessage.content) {
			return;
		}

		if (!newMessage.inGuild()) {
			//This is temporary
			return;
		}

		if (oldMessage.content === newMessage.content) {
			return;
		}

		const guildConfig = await GuildConfig.get(newMessage.guild.id);

		if (newMessage.content.startsWith(guildConfig.getPrefix())) {
			await this.handleCommandMessage(newMessage, guildConfig);
		}
	}

	public async handleMessageCreate(message: Message<true>): Promise<void> {
		if (message.author.bot || !message.content) {
			return;
		}

		if (!message.inGuild()) {
			//This is temporary
			return;
		}

		const guildConfig = await GuildConfig.get(message.guild.id);

		if (message.content.startsWith(guildConfig.getPrefix())) {
			await this.handleCommandMessage(message, guildConfig);
		}
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

		let command = this.commands.getCommand(commandName);

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
					const subcommand = this.commands.getCommand(`${command.id}-${subcommandName}`);

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
					command = this.commands.getCommand(`${command?.id}-${args[i]}`);
					toShift++;
				}
			}

			if (!command) {
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

		const parsed = await this.parseCommandArgs(message, command, args);

		if (!parsed && command.args?.length) {
			//Don't run the command.
			return;
		}

		await this.statcord.postCommand(command.id, message.author.id);
		await command.run(message, guildConfig, parsed);
	}

	private async parseCommandArgs(
		message: Message<true>,
		command: Command,
		args: string[]
	): Promise<Record<string, unknown> | undefined> {
		if (!command.args?.length) {
			return undefined;
		}

		const parsed: Record<string, unknown> = {};

		for (let i = 0, argsIndex = 0; i < command.args.length; i++) {
			const arg = command.args[i];

			if (arg.rest) {
				const str = args.slice(argsIndex).join(' ');
				const res = await arg.parse(message, str);

				if (res.err) {
					await message.channel.send(res.err);
					return undefined;
				}

				parsed[arg.key] = res.parsed;
				return parsed;
			}

			if (!args[argsIndex] || typeof args[argsIndex] !== 'string') {
				if (!arg.required) {
					//argsIndex++;
					continue;
				}

				//If the argument is required and there are no more arguments,
				//then we know that they provided an invalid argument.
				await message.channel.send(`Argument \`${arg.key}\` is required.`);
				return undefined;
			}

			const res = await arg.parse(message, args[argsIndex]);

			if (res.err) {
				if (!arg.required && command.args.length !== args.length) {
					//argsIndex++;
					parsed[arg.key] = undefined;
					continue;
				}

				await message.channel.send(res.err);
				return undefined;
			}

			parsed[arg.key] = res.parsed;

			argsIndex++;
		}

		return parsed;
	}
}
