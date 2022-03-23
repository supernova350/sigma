import { createLogger } from 'winston';
import { isDev } from './config';
import SentryTransport from 'winston-transport-sentry-node';

const logger = createLogger({
	transports: [
		new SentryTransport({
			sentry: {
				dsn: process.env.SENTRY_DSN,
			},
		}),
	],
});

export default logger;
