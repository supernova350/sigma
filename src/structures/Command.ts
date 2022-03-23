// TODO: DIRECTLY EXECUTABLE CHECK

import { Guild, GuildMember, Message, PermissionString } from 'discord.js';
import { container } from 'tsyringe';
import Module from './Module';

import BooleanArgument from '../arguments/BooleanArgument';
import ChannelArgument from '../arguments/ChannelArgument';
import FloatArgument from '../arguments/FloatArgument';
import IntegerArgument from '../arguments/IntegerArgument';
import MemberArgument from '../arguments/MemberArgument';
import NumberArgument from '../arguments/NumberArgument';
import RoleArgument from '../arguments/RoleArgument';
import StringArgument from '../arguments/StringArgument';
import TextChannelArgument from '../arguments/TextChannelArgument';
import UserArgument from '../arguments/UserArgument';
import VoiceChannelArgument from '../arguments/VoiceChannelArgument';
import SigmaClient from '../client/SigmaClient';
import GuildConfig from './GuildConfig';

export interface ICommandOptions {
	name: string;
	aliases?: string[];
	category?: string;
	description?: string;
	ownerOnly?: boolean;
	subcommands?: string[];
	examples?: string[];
	parent?: string;
	args?: ArgumentType[];
	clientPerms?: PermissionString[];
	userPerms?: PermissionString[];
}

export type ArgumentType =
	| BooleanArgument
	| ChannelArgument
	| FloatArgument
	| IntegerArgument
	| MemberArgument
	| NumberArgument
	| RoleArgument
	| StringArgument
	| TextChannelArgument
	| UserArgument
	| VoiceChannelArgument;

export default class Command<ParsedArgs = Record<string, unknown>> extends Module {
	public readonly id: string;
	public readonly name: string;
	public readonly aliases?: string[];
	public readonly category?: string;
	public readonly subcommands?: string[];
	public readonly examples?: string[];
	public readonly parent?: string;
	public readonly args?: ArgumentType[];
	public readonly ownerOnly?: boolean;

	public readonly clientPerms?: PermissionString[];
	public readonly userPerms?: PermissionString[];

	protected readonly client: SigmaClient;

	protected constructor(filepath: string, options: ICommandOptions) {
		if (new.target === Command) {
			throw new TypeError('Cannot construct Command instances directly.');
		}

		Command.validateOptions(options);

		super(filepath);
		this.id = options.parent ? `${options.parent}-${options.name}` : options.name;
		this.name = options.name;
		this.aliases = options.aliases;
		this.category = options.category;
		this.subcommands = options.subcommands;
		this.examples = options.examples;
		this.parent = options.parent;
		this.args = options.args;
		this.ownerOnly = options.ownerOnly;

		this.clientPerms = options.clientPerms;
		this.userPerms = options.userPerms;

		this.client = container.resolve<SigmaClient>(SigmaClient);
	}

	private static validateOptions(options: ICommandOptions): void {
		//Validate args
		if (options.args) {
			const numRest = options.args?.filter(a => a.rest).length;

			if (numRest && numRest > 1) {
				throw new Error(`Command ${options.name} has more than the maximum one rest argument.`);
			}

			if (numRest && !options.args[options.args.length - 1].rest) {
				throw new Error(
					`Command ${options.name} has a rest argument but the last argument is not a rest argument.`
				);
			}
		}
	}

	public getCommandExamples(prefix: string): string[] | undefined {
		if (!this.examples) {
			return undefined;
		}

		return this.examples.map(example => `\`${prefix}${this.id.replaceAll('-', ' ')} ${example}\``);
	}

	public getCommandUsage(): string | undefined {
		const { args } = this;

		if (!args) {
			//If command doesn't have any args, return undefined
			//because there's no usage
			return undefined;
		}

		const tokens = [];

		for (const arg of args) {
			tokens.push(arg.required ? `<${arg.key}>` : `[${arg.key}]`);
		}

		return tokens.join(' ');
	}

	public canMemberRun(member: GuildMember): boolean {
		if (member.user.id === process.env.OWNER_ID) {
			//If user is owner, return true (owner can run any command)
			return true;
		}

		if (this.ownerOnly) {
			//User is not owner so if command is owner only, return false
			return false;
		}

		const missingPerms = this.missingMemberPerms(member);

		//If no missing perms, user can run command
		return missingPerms.length === 0;
	}

	public canClientRun(guild: Guild): boolean {
		const missing = this.missingClientPerms(guild);

		//If no missing perms, client can run command
		return missing.length === 0;
	}

	public missingClientPerms(guild: Guild): PermissionString[] {
		if (!this.clientPerms) {
			return [];
		}

		const missingPerms: PermissionString[] = [];

		for (const perm of this.clientPerms) {
			if (!guild.me?.permissions.has(perm, true)) {
				missingPerms.push(perm);
			}
		}

		return missingPerms;
	}

	public missingMemberPerms(member: GuildMember): PermissionString[] {
		if (!this.userPerms) {
			return [];
		}

		const missingPerms: PermissionString[] = [];

		for (const perm of this.userPerms) {
			if (!member.permissions.has(perm, true)) {
				missingPerms.push(perm);
			}
		}

		return missingPerms;
	}

	//We need to cast this to Command because of the templated arguments.

	public isEnabledIn(guildConfig: GuildConfig): boolean {
		return guildConfig.isCommandEnabled(this as Command);
	}

	public async enableIn(guildConfig: GuildConfig): Promise<boolean> {
		return await guildConfig.enableCommand(this as Command);
	}

	public async disableIn(guildConfig: GuildConfig): Promise<boolean> {
		return await guildConfig.disableCommand(this as Command);
	}

	public async reload(): Promise<void> {
		await this.client.commandManager.reloadCommand(this as Command);
	}

	public isSubcommand(): boolean {
		//If command doesn't have a parent, it's not a subcommand
		//If command has a parent, it's a subcommand
		return this.parent !== undefined;
	}

	public async run(message: Message, guildConfig: GuildConfig, args?: ParsedArgs): Promise<void> {
		throw new TypeError(`${this.constructor.name}#run() is not implemented.`);
	}
}
