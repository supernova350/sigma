import EventEmitter from 'events';
import { container, delay, inject, injectable } from 'tsyringe';
import SigmaClient from '../client/SigmaClient';
import Listener from '../structures/Listener';
import Store from '../structures/Store';

@injectable()
export default class ListenerStore extends Store<Listener> {
	protected readonly emitters: Map<string, EventEmitter>;
	protected readonly client: SigmaClient;

	public constructor(client: SigmaClient, emitters?: Map<string, EventEmitter>) {
		super();
		this.client = client;
		this.emitters = emitters ?? new Map();
		//Emitters are stored in the <Emitter>-<Event> format.

		//Default emitters.
		//TODO: Make this configurable (but not essential).
		this.emitters.set('client', this.client);
		this.emitters.set('redis', this.client.redis);
		this.emitters.set('statcord', this.client.commandManager.statcord);
	}

	public async resolveListenerFile(filepath: string): Promise<Listener | undefined> {
		if (require.cache[filepath]) {
			delete require.cache[filepath];
		}

		const { default: ListenerConstructor } = await import(filepath);

		if (!ListenerConstructor || JSON.stringify(ListenerConstructor) === '{}') {
			console.warn(`File ${filepath} does not have a default export.`);
			return undefined;
		}

		if (!(ListenerConstructor.prototype instanceof Listener)) {
			throw new Error(`File ${filepath} does not have a default export that is an instance of Listener.`);
		}

		return container.resolve<Listener>(ListenerConstructor);
	}

	public async loadListenersIn(directory: string): Promise<this> {
		const filepaths = await this.readFilesIn(directory, ['.js']);

		for (const filepath of filepaths) {
			const listener = await this.resolveListenerFile(filepath);
			if (!listener) {
				continue;
			}

			this.loadListener(listener);
			console.log(`Loaded listener ${listener.id}.`);
		}

		return this;
	}

	public loadListener(listener: Listener): this {
		if (this.store.has(listener.id)) {
			throw new Error(`Listener ${listener.id} already exists.`);
		}

		const emitter = this.emitters.get(listener.emitter);

		if (!emitter) {
			throw new Error(`Emitter ${emitter} does not exist.`);
		}

		//Register the listener
		emitter[listener.type](listener.event, async (...args: unknown[]): Promise<void> => {
			return void listener.run.bind(listener)(args);
		});

		this.store.set(listener.id, listener);

		return this;
	}

	public unloadListener(listener: Listener): this {
		if (!this.store.has(listener.id)) {
			throw new Error(`Listener ${listener.id} does not exist.`);
		}

		const client = container.resolve<SigmaClient>(SigmaClient);

		client.removeAllListeners(listener.event);

		this.store.delete(listener.id);
		return this;
	}

	public async reloadListener(listener: Listener): Promise<this> {
		if (!this.store.has(listener.id)) {
			throw new Error(`Listener ${listener.id} does not exist.`);
		}

		this.unloadListener(listener);

		const newListener = await this.resolveListenerFile(listener.filepath);
		if (!newListener) {
			throw new Error(`Listener ${listener.id} does not exist.`);
		}

		this.loadListener(newListener);

		return this;
	}

	public async reloadAllListeners(): Promise<this> {
		for (const [id, listener] of Object.entries(this.store) as [string, Listener][]) {
			await this.reloadListener(listener);
		}

		return this;
	}

	public getListener(name: string): Listener | undefined {
		return this.store.get(name);
	}
}
