import { eq, and, isNull } from 'drizzle-orm';
import { organization, user, project } from '$lib/server/db/schema';
import type { db as dbType } from '$lib/server/db';

type DbClient = typeof dbType;

export type OrganizationRole = 'owner' | 'admin';

/**
 * Check if a user with the given role can add an admin to the organization.
 */
export function canAddAdmin(role: string | null): boolean {
	return role === 'owner' || role === 'admin';
}

/**
 * Check if a user with the given role can delete the organization.
 */
export function canDeleteOrganization(role: string | null): boolean {
	return role === 'owner';
}

export interface OrganizationRepository {
	findOrganizationById(id: number): Promise<{ id: number } | undefined>;
	findUserInOrganization(
		userId: number,
		organizationId: number
	): Promise<{ id: number; role: string | null } | undefined>;
	findUserByEmail(
		email: string
	): Promise<{ id: number; organizationId: number | null } | undefined>;
	updateUserRole(userId: number, role: string, organizationId: number): Promise<void>;
	findUserIdsByOrganization(organizationId: number): Promise<{ id: number }[]>;
	softDeleteProjectsByUserId(userId: number, deletedAt: Date): Promise<void>;
	softDeleteOrganization(organizationId: number, deletedAt: Date): Promise<void>;
}

/**
 * Create a repository implementation backed by a real Drizzle DB client.
 */
export function createOrganizationRepository(db: DbClient): OrganizationRepository {
	return {
		async findOrganizationById(id: number) {
			const [org] = await db
				.select({ id: organization.id })
				.from(organization)
				.where(and(eq(organization.id, id), isNull(organization.deletedAt)));
			return org;
		},
		async findUserInOrganization(userId: number, organizationId: number) {
			const [u] = await db
				.select({ id: user.id, role: user.role })
				.from(user)
				.where(and(eq(user.id, userId), eq(user.organizationId, organizationId)));
			return u;
		},
		async findUserByEmail(email: string) {
			const [u] = await db
				.select({ id: user.id, organizationId: user.organizationId })
				.from(user)
				.where(eq(user.email, email));
			return u;
		},
		async updateUserRole(userId: number, role: string, organizationId: number) {
			await db.update(user).set({ role, organizationId }).where(eq(user.id, userId));
		},
		async findUserIdsByOrganization(organizationId: number) {
			return db.select({ id: user.id }).from(user).where(eq(user.organizationId, organizationId));
		},
		async softDeleteProjectsByUserId(userId: number, deletedAt: Date) {
			await db
				.update(project)
				.set({ deletedAt })
				.where(and(eq(project.userId, userId), isNull(project.deletedAt)));
		},
		async softDeleteOrganization(organizationId: number, deletedAt: Date) {
			await db.update(organization).set({ deletedAt }).where(eq(organization.id, organizationId));
		}
	};
}

export async function addOrganizationAdmin(
	repo: OrganizationRepository,
	params: {
		organizationId: number;
		requestingUserId: number;
		targetUserEmail: string;
	}
): Promise<{ success: boolean; error?: string }> {
	const { organizationId, requestingUserId, targetUserEmail } = params;

	// Check that the organization exists and is not deleted
	const org = await repo.findOrganizationById(organizationId);
	if (!org) {
		return { success: false, error: '組織が見つかりません' };
	}

	// Check requesting user's role
	const requestingUser = await repo.findUserInOrganization(requestingUserId, organizationId);
	if (!requestingUser) {
		return { success: false, error: '権限がありません' };
	}

	if (!canAddAdmin(requestingUser.role)) {
		return { success: false, error: '組織管理者を追加する権限がありません' };
	}

	// Find target user by email
	const targetUser = await repo.findUserByEmail(targetUserEmail);
	if (!targetUser) {
		return { success: false, error: '指定されたメールアドレスのユーザーが見つかりません' };
	}

	// Prevent moving users from another organization
	if (targetUser.organizationId && targetUser.organizationId !== organizationId) {
		return { success: false, error: 'このユーザーは別の組織に所属しています' };
	}

	// Update target user's role and organization
	await repo.updateUserRole(targetUser.id, 'admin', organizationId);

	return { success: true };
}

export async function deleteOrganization(
	repo: OrganizationRepository,
	params: {
		organizationId: number;
		requestingUserId: number;
	}
): Promise<{ success: boolean; error?: string }> {
	const { organizationId, requestingUserId } = params;

	// Check that the organization exists and is not deleted
	const org = await repo.findOrganizationById(organizationId);
	if (!org) {
		return { success: false, error: '組織が見つかりません' };
	}

	// Check requesting user's role
	const requestingUser = await repo.findUserInOrganization(requestingUserId, organizationId);
	if (!requestingUser) {
		return { success: false, error: '権限がありません' };
	}

	if (!canDeleteOrganization(requestingUser.role)) {
		return { success: false, error: '組織を削除する権限がありません' };
	}

	const now = new Date();

	// Soft delete all projects belonging to users in this organization
	const orgUsers = await repo.findUserIdsByOrganization(organizationId);
	for (const orgUser of orgUsers) {
		await repo.softDeleteProjectsByUserId(orgUser.id, now);
	}

	// Soft delete the organization
	await repo.softDeleteOrganization(organizationId, now);

	return { success: true };
}
