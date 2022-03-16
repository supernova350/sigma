import { container } from 'tsyringe';
import SigmaClient from '../client/SigmaClient';
import Module from './Module';

export interface IListenerOptions {
	event: string;
	emitter: string;
	type: 'on' | 'once';
}

export default class Listener<RunArguments = unknown> extends Module {
	public readonly id: string;
	public readonly event: string;
	public readonly emitter: string;
	public readonly type: 'on' | 'once';

	protected readonly client: SigmaClient;

	protected constructor(filepath: string, options: IListenerOptions) {
		if (new.target === Listener) {
			throw new TypeError('Cannot construct Listener instances directly.');
		}

		super(filepath);
		this.event = options.event;
		this.emitter = options.emitter;
		this.id = `${this.emitter}-${this.event}`;
		this.type = options.type;
		this.client = container.resolve<SigmaClient>(SigmaClient);
	}

	//When implementing Listener#run(), destructure the args param.
	public async run(args: RunArguments): Promise<void> {
		throw new TypeError(`${this.constructor.name}#run() is not implemented.`);
	}

	public async reload(): Promise<void> {
		//We need to cast this to Listener because of the templated arguments.
		await this.client._listeners.reloadListener(this as Listener);
	}
}
