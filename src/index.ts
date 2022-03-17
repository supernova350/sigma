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
		guildID: '951611637956247552',
		userID: '348477266704990208',
		modID: '949652124852179014',
		action: CaseAction.Ban,
	});
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

start();
