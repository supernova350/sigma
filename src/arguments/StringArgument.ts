import { Message } from 'discord.js';
import i18next from 'i18next';
import Argument, { IArgumentOptions, ParseOutput } from '../structures/Argument';

export interface ParseOptions {
	minLength?: number;
	maxLength?: number;
	oneOf?: string[];
	match?: RegExp;
}

export default class StringArgument extends Argument<string, ParseOptions> {
	public constructor(options: IArgumentOptions, parseOptions?: ParseOptions) {
		super(options, parseOptions);
	}

	public async parse(message: Message<true>, parse: string): Promise<ParseOutput<string>> {
		const lower = parse.toLowerCase();

		if (this.parseOptions) {
			if (this.parseOptions.minLength && parse.length < this.parseOptions.minLength) {
				return {
					err: i18next.t<string>('argument.string.error.min_length', {
						arg: this.key,
						min_length: this.parseOptions.minLength,
					}),
				};
			}

			if (this.parseOptions.maxLength && parse.length > this.parseOptions.maxLength) {
				return {
					err: i18next.t<string>('argument.string.error.max_length', {
						arg: this.key,
						max_length: this.parseOptions.maxLength,
					}),
				};
			}

			if (this.parseOptions.oneOf && !this.parseOptions.oneOf.includes(lower)) {
				return {
					err: i18next.t<string>('argument.string.error.one_of', {
						arg: this.key,
						one_of: this.parseOptions.oneOf.join(', '),
					}),
				};
			}

			if (this.parseOptions.match && !this.parseOptions.match.test(lower)) {
				return {
					err: i18next.t<string>('argument.string.error.match', {
						arg: this.key,
						match: this.parseOptions.match.toString(),
					}),
				};
			}
		}

		return { parsed: parse };
	}
}
