import { Message } from 'discord.js';
import i18next from 'i18next';
import Argument, { IArgumentOptions, ParseOutput } from '../structures/Argument';

export interface ParseOptions {}

export default class BooleanArgument extends Argument<boolean, ParseOptions> {
	private readonly truthyValues = ['y', 't', '+'] as const;
	private readonly falsyValues = ['n', 'f', '-'] as const;

	public constructor(options: IArgumentOptions, parseOptions?: ParseOptions) {
		super(options, parseOptions);
	}

	public async parse(message: Message<true>, parse: string): Promise<ParseOutput<boolean>> {
		const lower = parse.toLowerCase();

		const isTruthy = this.truthyValues.some(value => lower.includes(value));
		const isFalsy = this.falsyValues.some(value => lower.includes(value));

		if (!isTruthy && !isFalsy) {
			return {
				err: i18next.t<string>('argument.boolean.error.unrecognized', {
					truthy: this.truthyValues.join(', '),
					falsy: this.falsyValues.join(', '),
				}),
			};
		}

		return {
			parsed: isTruthy,
		};
	}
}
