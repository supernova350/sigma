import { Message } from 'discord.js';
import i18next from 'i18next';
import Argument, { IArgumentOptions, ParseOutput } from '../structures/Argument';

export interface ParseOptions {
	min?: number;
	max?: number;
	oneOf?: number[];
}

export default class IntegerArgument extends Argument<number, ParseOptions> {
	public constructor(options: IArgumentOptions, parseOptions?: ParseOptions) {
		super(options, parseOptions);
	}

	public async parse(message: Message<true>, parse: string): Promise<ParseOutput<number>> {
		if (Number.isNaN(parse)) {
			return { err: i18next.t<string>(`argument.integer.error.not_a_number`) };
		}

		const number = Number(parse);
		console.log(parse, number);

		if (number % 1 !== 0) {
			return { err: i18next.t<string>(`argument.integer.error.not_an_integer`) };
		}

		if (this.parseOptions) {
			if (this.parseOptions.min && number < this.parseOptions.min) {
				return {
					err: i18next.t<string>('argument.integer.error.min', {
						min: this.parseOptions.min,
					}),
				};
			}

			if (this.parseOptions.max && number > this.parseOptions.max) {
				return {
					err: i18next.t<string>('argument.integer.error.max', {
						max: this.parseOptions.max,
					}),
				};
			}

			if (this.parseOptions.oneOf && !this.parseOptions.oneOf.includes(number)) {
				return {
					err: i18next.t<string>('argument.integer.error.one_of', {
						one_of: this.parseOptions.oneOf.join(', '),
					}),
				};
			}
		}

		return { parsed: number };
	}
}
