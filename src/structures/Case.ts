import { PrismaClient } from '@prisma/client';
import { container } from 'tsyringe';

export enum CaseAction {
	Role = 'Role',
	Timeout = 'Timeout',
	Kick = 'Kick',
	Ban = 'Ban',
}

export interface ICaseData {
	uuid: string;
	caseID: number;
	refID?: number;
	action: CaseAction;
	userID: string;
	guildID: string;
	modID: string;
	reason?: string;
	created: Date;
	updated: Date;
	duration?: number;
}

export default class Case {
	public readonly uuid: string;
	public readonly caseID: number;
	private refID?: number;
	private action: CaseAction;
	public readonly userID: string;
	public readonly guildID: string;
	public readonly modID: string;
	private reason?: string;
	public readonly created: Date;
	private updated: Date;
	private duration?: number;
	private expires?: Date;
	private isActive?: boolean;

	private isDeleted?: boolean;

	public constructor(data: ICaseData) {
		this.uuid = data.uuid;
		this.caseID = data.caseID;
		this.refID = data.refID ?? undefined;
		this.action = data.action;
		this.userID = data.userID;
		this.guildID = data.guildID;
		this.modID = data.modID;
		this.reason = data.reason ?? undefined;
		this.created = data.created;
		this.updated = data.updated;
		this.duration = data.duration ?? undefined;
		this.expires = this.duration ? new Date(Date.now() + this.duration) : undefined;
		this.isActive = this.duration !== undefined && Date.now() + this.duration < Date.now();
	}

	public toJSON(): ICaseData {
		return {
			uuid: this.uuid,
			caseID: this.caseID,
			refID: this.refID ?? undefined,
			action: this.action,
			userID: this.userID,
			guildID: this.guildID,
			modID: this.modID,
			reason: this.reason ?? undefined,
			created: this.created,
			updated: this.updated,
			duration: this.duration ?? undefined,
		};
	}

	public async deleteCase(): Promise<void> {
		if (this.isDeleted) {
			throw new Error('Case is deleted.');
		}

		const prisma = container.resolve<PrismaClient>(PrismaClient);

		this.updated = new Date();

		await prisma.case.delete({
			where: {
				uuid: this.uuid,
			},
		});

		this.isDeleted = true;
	}

	public async updateReference(refID: number): Promise<boolean | this> {
		if (this.isDeleted) {
			throw new Error('Case is deleted.');
		}

		if (refID === this.refID) {
			return false;
		}

		const prisma = container.resolve<PrismaClient>(PrismaClient);

		this.updated = new Date();

		await prisma.case.update({
			where: {
				uuid: this.uuid,
			},
			data: {
				ref_id: refID,
				updated: this.updated,
			},
		});

		return this;
	}

	public async updateAction(action: CaseAction): Promise<boolean | this> {
		if (this.isDeleted) {
			throw new Error('Case is deleted.');
		}

		if (action === this.action) {
			return false;
		}

		const prisma = container.resolve(PrismaClient);

		this.action = action;
		this.updated = new Date();

		await prisma.case.update({
			where: {
				uuid: this.uuid,
			},
			data: {
				action: this.action,
				updated: this.updated,
			},
		});

		return this;
	}

	public async updateReason(newReason: string): Promise<this> {
		if (this.isDeleted) {
			throw new Error('Case is deleted.');
		}

		const prisma = container.resolve<PrismaClient>(PrismaClient);

		this.reason = newReason;
		this.updated = new Date();

		await prisma.case.update({
			where: {
				uuid: this.uuid,
			},
			data: {
				reason: this.reason,
				updated: this.updated,
			},
		});

		return this;
	}

	public async updateDuration(newDuration: number): Promise<this> {
		if (this.isDeleted) {
			throw new Error('Case is deleted.');
		}

		const prisma = container.resolve(PrismaClient);

		this.duration = newDuration;
		this.expires = new Date(Date.now() + this.duration);
		this.updated = new Date();

		await prisma.case.update({
			where: {
				uuid: this.uuid,
			},
			data: {
				duration: this.duration,
				updated: this.updated,
			},
		});

		return this;
	}

	public getRefID(): number | undefined {
		return this.refID ?? undefined;
	}

	public getAction(): CaseAction {
		return this.action;
	}

	public getReason(): string | undefined {
		return this.reason ?? undefined;
	}

	public getDuration(): number | undefined {
		return this.duration ?? undefined;
	}

	public getIsActive(): boolean {
		//If the case is expired, update isActive
		if (this.isExpired()) {
			this.isActive = false;
		}

		return this.isActive ?? false;
	}

	private isExpired(): boolean {
		return this.expires !== undefined && this.expires.getTime() >= Date.now();
	}

	public getIsDeleted(): boolean {
		return this.isDeleted ?? false;
	}

	public static async getLatest(guildID: string): Promise<Case | undefined> {
		const prisma = container.resolve<PrismaClient>(PrismaClient);

		const latestCase = await prisma.case.findFirst({
			where: {
				guild_id: guildID,
			},
			orderBy: {
				case_id: 'desc',
			},
		});

		if (!latestCase) {
			return undefined;
		}

		return new Case({
			uuid: latestCase.uuid,
			caseID: latestCase.case_id,
			refID: latestCase.ref_id ?? undefined,
			action: latestCase.action as CaseAction,
			userID: latestCase.user_id,
			guildID: latestCase.guild_id,
			modID: latestCase.mod_id,
			reason: latestCase.reason ?? undefined,
			created: latestCase.created,
			updated: latestCase.updated,
			duration: latestCase.duration ?? undefined,
		});
	}

	public static async search(data: { guildID: string; caseID: number }): Promise<Case | undefined> {
		const prisma = container.resolve(PrismaClient);

		const caseData = await prisma.case.findFirst({
			where: {
				guild_id: data.guildID,
				case_id: data.caseID,
			},
		});

		if (!caseData) {
			return undefined;
		}

		return new Case({
			uuid: caseData.uuid,
			caseID: caseData.case_id,
			refID: caseData.ref_id ?? undefined,
			action: caseData.action as CaseAction,
			userID: caseData.user_id,
			guildID: caseData.guild_id,
			modID: caseData.mod_id,
			reason: caseData.reason ?? undefined,
			created: caseData.created,
			updated: caseData.updated,
			duration: caseData.duration ?? undefined,
		});
	}

	public static async create(data: {
		refID?: number;
		action: CaseAction;
		userID: string;
		guildID: string;
		modID: string;
		reason?: string;
		duration?: number;
	}): Promise<Case> {
		const prisma = container.resolve<PrismaClient>(PrismaClient);

		const numCases = await prisma.case.count({
			where: {
				guild_id: data.guildID,
			},
		});

		const caseData = await prisma.case.create({
			data: {
				case_id: numCases + 1,
				ref_id: data.refID ?? undefined,
				action: data.action,
				user_id: data.userID,
				guild_id: data.guildID,
				mod_id: data.modID,
				reason: data.reason ?? undefined,
				duration: data.duration ?? undefined,
			},
		});

		return new Case({
			uuid: caseData.uuid,
			caseID: caseData.case_id,
			refID: caseData.ref_id ?? undefined,
			action: caseData.action as CaseAction,
			userID: caseData.user_id,
			guildID: caseData.guild_id,
			modID: caseData.mod_id,
			reason: caseData.reason ?? undefined,
			created: caseData.created,
			updated: caseData.updated,
			duration: caseData.duration ?? undefined,
		});
	}
}
