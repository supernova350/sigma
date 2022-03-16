import { Message } from 'discord.js';

export interface ParseOutput<ArgumentType> {
	parsed?: ArgumentType;
	err?: string;
}

export interface IArgumentOptions {
	key: string;
	required?: boolean;
	rest?: boolean;
}

export default class Argument<ArgumentType, ParseOptions = null> {
	protected readonly parseOptions?: ParseOptions;
	public readonly key: string;
	public readonly required?: boolean;
	public readonly rest?: boolean;

	public constructor(options: IArgumentOptions, parseOptions?: ParseOptions) {
		if (new.target === Argument) {
			throw new TypeError('Cannot construct Argument instances directly.');
		}

		this.key = options.key;
		this.required = options.required ?? undefined;
		this.rest = options.rest ?? undefined;
		this.parseOptions = parseOptions;
	}

	public async parse(message: Message<true>, parse: string): Promise<ParseOutput<ArgumentType>> {
		throw new TypeError(`${this.constructor.name}#parse() is not implemented.`);
	}
}
