import { Client, Message } from 'discord.js';
import IORedis from 'ioredis';
import CommandManager from '../managers/CommandManager';
import ListenerManager from '../managers/ListenerManager';
import GuildConfig from '../structures/GuildConfig';

export default class SigmaClient extends Client<true> {
	public readonly redis: IORedis.Redis;
	public readonly commandManager: CommandManager;
	public readonly listenerManager: ListenerManager;

	public constructor() {
		super({
			intents: ['GUILDS', 'GUILD_MESSAGES'],
			partials: ['MESSAGE', 'CHANNEL', 'REACTION'],
		});

		this.redis = new IORedis(process.env.REDIS_URL);
		this.commandManager = new CommandManager(this);
		this.listenerManager = new ListenerManager(this);
	}

	public async connect(): Promise<void> {
		await this.commandManager.init();
		await this.listenerManager.init();
		await super.login(process.env.BOT_TOKEN);
	}
}
