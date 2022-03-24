import { createLogger } from 'winston';
import winstonDevConsole from '@epegzz/winston-dev-console';
import { isDev } from './config';
import SentryTransport from 'winston-transport-sentry-node';

let logger = createLogger({
	level: 'silly',
	transports: [
		new SentryTransport({
			sentry: {
				dsn: process.env.SENTRY_DSN,
			},
		}),
	],
});

if (isDev) {
	logger = winstonDevConsole.init(logger);
	logger.add(
		winstonDevConsole.transport({
			showTimestamps: false,
			addLineSeparation: true,
		})
	);
}

export default logger;
