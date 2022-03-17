import { Message } from 'discord.js';
import i18next from 'i18next';
import Argument, { IArgumentOptions, ParseOutput } from '../structures/Argument';
import ms from 'ms';

export interface ParseOptions {
	min?: number;
	max?: number;
}

export default class DurationArgument extends Argument<number, ParseOptions> {
	public constructor(options: IArgumentOptions, parseOptions?: ParseOptions) {
		super(options, parseOptions);
	}

	public async parse(message: Message<true>, parse: string): Promise<ParseOutput<number>> {
		const duration = ms(parse);

		console.log(parse, duration);

		if (isNaN(duration)) {
			return {
				err: i18next.t('arguments.duration.error.not_a_duration', {
					value: parse,
				}),
			};
		}

		if (this.parseOptions) {
			if (this.parseOptions.min && duration < this.parseOptions.min) {
				return {
					err: i18next.t('arguments.duration.error.min', {
						min: this.parseOptions.min,
					}),
				};
			}

			if (this.parseOptions.max && duration > this.parseOptions.max) {
				return {
					err: i18next.t('arguments.duration.error.max', {
						max: this.parseOptions.max,
					}),
				};
			}
		}

		return {
			parsed: duration,
		};
	}
}
