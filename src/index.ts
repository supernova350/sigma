import 'reflect-metadata';

import 'dotenv/config';
import SigmaClient from './client/SigmaClient';
import i18next from 'i18next';
import Backend from 'i18next-fs-backend';
import { container } from 'tsyringe';
import { PrismaClient } from '@prisma/client';
import logger from './logger';

//Try to prevent memory leaks
process.setMaxListeners(20);

const client = new SigmaClient();
const prisma = new PrismaClient();

container.register(SigmaClient, { useValue: client });
container.register(PrismaClient, { useValue: prisma });

async function start() {
	await i18next.use(Backend).init({
		backend: {
			loadPath: './locales/{{lng}}/{{ns}}.json',
		},
		cleanCode: true,
		fallbackLng: ['en-US'],
		defaultNS: 'translation',
		lng: 'en-US',
		ns: ['translation'],
	});

	await client.connect();
}

logger.error(new Error('This is an error'));

start();
