import { GuildConfig as PrismaGuildConfig, PrismaClient } from '@prisma/client';
import { container } from 'tsyringe';
import Command from './Command';

export interface IGuildConfig {
	guildID: string;
	prefix: string;
	disabledCommands: string[];
	modlogsChannelID: string;
	memberlogsChannelID: string;
	messagelogsChannelID: string;
}

export default class GuildConfig {
	public readonly guildID: string;
	private prefix: string;
	private disabledCommands: string[];
	private modlogsChannelID: string;
	private memberlogsChannelID: string;
	private messagelogsChannelID: string;

	public constructor(data: IGuildConfig) {
		this.guildID = data.guildID;
		this.prefix = data.prefix;
		this.disabledCommands = data.disabledCommands;
		this.modlogsChannelID = data.modlogsChannelID;
		this.memberlogsChannelID = data.memberlogsChannelID;
		this.messagelogsChannelID = data.messagelogsChannelID;
	}

	public toJSON(): IGuildConfig {
		return {
			guildID: this.guildID,
			prefix: this.prefix,
			disabledCommands: this.disabledCommands,
			modlogsChannelID: this.modlogsChannelID,
			memberlogsChannelID: this.memberlogsChannelID,
			messagelogsChannelID: this.messagelogsChannelID,
		};
	}

	public getPrefix(): string {
		return this.prefix;
	}

	public async updatePrefix(prefix: string): Promise<boolean> {
		if (prefix.length > 4) {
			return false;
		}

		this.prefix = prefix;

		const prisma = container.resolve<PrismaClient>(PrismaClient);

		await prisma.guildConfig.update({
			where: {
				guild_id: this.guildID,
			},
			data: {
				prefix: prefix,
			},
		});

		return true;
	}

	public getModlogsChannel(): string {
		return this.modlogsChannelID;
	}

	public async updateModlogsChannel(channelID: string): Promise<void> {
		this.modlogsChannelID = channelID;

		const prisma = container.resolve<PrismaClient>(PrismaClient);

		await prisma.guildConfig.update({
			where: {
				guild_id: this.guildID,
			},
			data: {
				modlogs_channel_id: channelID,
			},
		});
	}

	public getMemberlogsChannel(): string {
		return this.memberlogsChannelID;
	}

	public async updateMemberlogsChannel(channelID: string): Promise<void> {
		this.memberlogsChannelID = channelID;

		const prisma = container.resolve<PrismaClient>(PrismaClient);

		await prisma.guildConfig.update({
			where: {
				guild_id: this.guildID,
			},
			data: {
				memberlogs_channel_id: channelID,
			},
		});
	}

	public getMessagelogsChannel(): string {
		return this.messagelogsChannelID;
	}

	public async updateMessagelogsChannel(channelID: string): Promise<void> {
		this.messagelogsChannelID = channelID;

		const prisma = container.resolve<PrismaClient>(PrismaClient);

		await prisma.guildConfig.update({
			where: {
				guild_id: this.guildID,
			},
			data: {
				messagelogs_channel_id: channelID,
			},
		});
	}

	public isCommandEnabled(command: Command): boolean {
		return !this.disabledCommands.includes(command.name);
	}

	public async enableCommand(command: Command): Promise<boolean> {
		if (this.isCommandEnabled(command)) {
			//If command is enabled, return false (can't enable a command that's already enabled)
			return false;
		}

		this.disabledCommands = this.disabledCommands.filter(c => c !== command.id);

		const prisma = container.resolve<PrismaClient>(PrismaClient);

		await prisma.guildConfig.update({
			where: {
				guild_id: this.guildID,
			},
			data: {
				disabled_commands: this.disabledCommands,
			},
		});

		return true;
	}

	public async disableCommand(command: Command): Promise<boolean> {
		if (command.ownerOnly || ['enable', 'disable'].includes(command.id)) {
			//If command is owner only, don't allow disabling
			//because it's likely a utility command. Or, don't allow to diable
			//enable/disable because then you can't enable or disable any other commands.
			return false;
		}

		if (this.disabledCommands.includes(command.id)) {
			//If command is disabled, return false (don't push duplicate)
			return false;
		}

		this.disabledCommands.push(command.id);

		const prisma = container.resolve<PrismaClient>(PrismaClient);

		await prisma.guildConfig.update({
			where: {
				guild_id: this.guildID,
			},
			data: {
				disabled_commands: this.disabledCommands,
			},
		});

		return true;
	}

	public static async get(guildID: string): Promise<GuildConfig> {
		const prisma = container.resolve<PrismaClient>(PrismaClient);

		let guildConfig = await prisma.guildConfig.findFirst({
			where: {
				guild_id: guildID,
			},
		});

		if (!guildConfig) {
			guildConfig = await prisma.guildConfig.create({
				data: {
					guild_id: guildID,
				},
			});
		}

		return new GuildConfig({
			guildID: guildConfig.guild_id,
			prefix: guildConfig.prefix,
			disabledCommands: guildConfig.disabled_commands,
			modlogsChannelID: guildConfig.modlogs_channel_id,
			memberlogsChannelID: guildConfig.memberlogs_channel_id,
			messagelogsChannelID: guildConfig.messagelogs_channel_id,
		});
	}
}
