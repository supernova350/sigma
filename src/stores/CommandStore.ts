import { container } from 'tsyringe';
import SigmaClient from '../client/SigmaClient';
import Command from '../structures/Command';
import Store from '../structures/Store';

export default class CommandStore extends Store<Command> {
	private client: SigmaClient;

	public constructor(client: SigmaClient) {
		super();
		this.client = client;
	}

	public async resolveCommandFile(filepath: string): Promise<Command | undefined> {
		if (require.cache[filepath]) {
			delete require.cache[filepath];
		}

		const { default: CommandConstructor } = await import(filepath);

		if (!CommandConstructor || JSON.stringify(CommandConstructor) === '{}') {
			console.warn(`File ${filepath} does not have a default export.`);
			return undefined;
		}

		if (!(CommandConstructor.prototype instanceof Command)) {
			throw new Error(`File ${filepath} does not have a default export that is an instance of Command.`);
		}

		return container.resolve<Command>(CommandConstructor);
	}

	public async loadCommandsIn(directory: string): Promise<this> {
		const filepaths = await this.readFilesIn(directory, ['.js']); //'../commands/**/*.js'

		for (const filepath of filepaths) {
			const command = await this.resolveCommandFile(filepath);
			if (!command) {
				continue;
			}

			this.loadCommand(command);
			console.log(`Loaded command ${command.id}.`);
		}

		return this;
	}

	public loadCommand(command: Command): this {
		if (this.store.has(command.id)) {
			throw new Error(`Command ${command.id} already exists.`);
		}

		this.store.set(command.id, command);
		return this;
	}

	public unloadCommand(command: Command): this {
		if (!this.store.has(command.id)) {
			throw new Error(`Command ${command.id} does not exist.`);
		}

		this.store.delete(command.id);
		return this;
	}

	public async reloadCommand(command: Command): Promise<this> {
		if (!this.store.has(command.id)) {
			throw new Error(`Command ${command.id} does not exist.`);
		}

		this.unloadCommand(command);

		const newCommand = await this.resolveCommandFile(command.filepath);
		if (!newCommand) {
			throw new Error(`Command ${command.id} does not exist.`);
		}

		this.loadCommand(newCommand);

		return this;
	}

	public async reloadAllCommands(): Promise<this> {
		for (const [id, command] of Object.entries(this.store) as [string, Command][]) {
			await this.reloadCommand(command);
		}

		return this;
	}

	public getCommand(name: string): Command | undefined {
		const command = this.store.get(name);

		if (command) {
			//If command is valid, great, return it.
			//However, if it is not, it might be an alias.
			return command;
		}

		//Check aliases
		for (const [id, command] of Object.entries(this.store) as [string, Command][]) {
			if (command.aliases?.includes(name)) {
				return command;
			}
		}

		return undefined;
	}
}
