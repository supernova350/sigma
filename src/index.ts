import 'reflect-metadata';

import 'dotenv/config';
import SigmaClient from './client/SigmaClient';
import i18next from 'i18next';
import Backend from 'i18next-fs-backend';
import { container } from 'tsyringe';
import { PrismaClient } from '@prisma/client';
import Case, { CaseAction } from './structures/Case';

const client = new SigmaClient();
const prisma = new PrismaClient();

container.register(SigmaClient, { useValue: client });
container.register(PrismaClient, { useValue: prisma });

async function start() {
	await Case.create({
		refID: undefined,
		action: CaseAction.Timeout,
		userID: '123',
		guildID: '123',
		modID: '123',
		reason: '123',
	});
	await client.connect();
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
}

start();
