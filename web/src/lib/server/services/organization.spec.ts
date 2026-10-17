import { describe, it, expect, vi } from 'vitest';
import type { OrganizationRepository } from './organization';
import {
	canAddAdmin,
	canDeleteOrganization,
	addOrganizationAdmin,
	createOrganization,
	deleteOrganization
} from './organization';

function createMockRepo(overrides: Partial<OrganizationRepository> = {}): OrganizationRepository {
	return {
		findOrganizationById: vi.fn().mockResolvedValue(undefined),
		findUserInOrganization: vi.fn().mockResolvedValue(undefined),
		findUserByEmail: vi.fn().mockResolvedValue(undefined),
		updateUserRole: vi.fn().mockResolvedValue([{ id: 1 }]),
		findUserIdsByOrganization: vi.fn().mockResolvedValue([]),
		softDeleteProjectsByUserId: vi.fn().mockResolvedValue(undefined),
		softDeleteOrganization: vi.fn().mockResolvedValue(undefined),
		...overrides
	};
}

describe('canAddAdmin', () => {
	it('owner can add admin', () => {
		expect(canAddAdmin('owner')).toBe(true);
	});

	it('admin can add admin', () => {
		expect(canAddAdmin('admin')).toBe(true);
	});

	it('member cannot add admin', () => {
		expect(canAddAdmin('member')).toBe(false);
	});

	it('null role cannot add admin', () => {
		expect(canAddAdmin(null)).toBe(false);
	});
});

describe('canDeleteOrganization', () => {
	it('owner can delete organization', () => {
		expect(canDeleteOrganization('owner')).toBe(true);
	});

	it('admin cannot delete organization', () => {
		expect(canDeleteOrganization('admin')).toBe(false);
	});

	it('member cannot delete organization', () => {
		expect(canDeleteOrganization('member')).toBe(false);
	});

	it('null role cannot delete organization', () => {
		expect(canDeleteOrganization(null)).toBe(false);
	});
});

describe('addOrganizationAdmin', () => {
	it('should fail when organization does not exist', async () => {
		const repo = createMockRepo();

		const result = await addOrganizationAdmin(repo, {
			organizationId: 1,
			requestingUserId: 1,
			targetUserEmail: 'admin@example.com'
		});

		expect(result.success).toBe(false);
		expect(result.error).toBe('組織が見つかりません');
	});

	it('should fail when requesting user is not in the organization', async () => {
		const repo = createMockRepo({
			findOrganizationById: vi.fn().mockResolvedValue({ id: 1 })
		});

		const result = await addOrganizationAdmin(repo, {
			organizationId: 1,
			requestingUserId: 1,
			targetUserEmail: 'admin@example.com'
		});

		expect(result.success).toBe(false);
		expect(result.error).toBe('権限がありません');
	});

	it('should fail when requesting user is a member (not owner or admin)', async () => {
		const repo = createMockRepo({
			findOrganizationById: vi.fn().mockResolvedValue({ id: 1 }),
			findUserInOrganization: vi.fn().mockResolvedValue({ id: 1, role: 'member' })
		});

		const result = await addOrganizationAdmin(repo, {
			organizationId: 1,
			requestingUserId: 1,
			targetUserEmail: 'admin@example.com'
		});

		expect(result.success).toBe(false);
		expect(result.error).toBe('組織管理者を追加する権限がありません');
	});

	it('should fail when target user email does not exist', async () => {
		const repo = createMockRepo({
			findOrganizationById: vi.fn().mockResolvedValue({ id: 1 }),
			findUserInOrganization: vi.fn().mockResolvedValue({ id: 1, role: 'owner' })
		});

		const result = await addOrganizationAdmin(repo, {
			organizationId: 1,
			requestingUserId: 1,
			targetUserEmail: 'nonexistent@example.com'
		});

		expect(result.success).toBe(false);
		expect(result.error).toBe('指定されたメールアドレスのユーザーが見つかりません');
	});

	it('should succeed when owner adds an admin', async () => {
		const repo = createMockRepo({
			findOrganizationById: vi.fn().mockResolvedValue({ id: 1 }),
			findUserInOrganization: vi.fn().mockResolvedValue({ id: 1, role: 'owner' }),
			findUserByEmail: vi.fn().mockResolvedValue({ id: 2, organizationId: 1, role: 'member' })
		});

		const result = await addOrganizationAdmin(repo, {
			organizationId: 1,
			requestingUserId: 1,
			targetUserEmail: 'newadmin@example.com'
		});

		expect(result.success).toBe(true);
		expect(repo.updateUserRole).toHaveBeenCalledWith(2, 'admin', 1);
	});

	it('should succeed when admin adds another admin', async () => {
		const repo = createMockRepo({
			findOrganizationById: vi.fn().mockResolvedValue({ id: 1 }),
			findUserInOrganization: vi.fn().mockResolvedValue({ id: 1, role: 'admin' }),
			findUserByEmail: vi.fn().mockResolvedValue({ id: 3, organizationId: 1, role: 'member' })
		});

		const result = await addOrganizationAdmin(repo, {
			organizationId: 1,
			requestingUserId: 1,
			targetUserEmail: 'another-admin@example.com'
		});

		expect(result.success).toBe(true);
		expect(repo.updateUserRole).toHaveBeenCalledWith(3, 'admin', 1);
	});

	it('should fail when target user belongs to another organization', async () => {
		const repo = createMockRepo({
			findOrganizationById: vi.fn().mockResolvedValue({ id: 1 }),
			findUserInOrganization: vi.fn().mockResolvedValue({ id: 1, role: 'owner' }),
			findUserByEmail: vi.fn().mockResolvedValue({ id: 2, organizationId: 99 })
		});

		const result = await addOrganizationAdmin(repo, {
			organizationId: 1,
			requestingUserId: 1,
			targetUserEmail: 'other-org@example.com'
		});

		expect(result.success).toBe(false);
		expect(result.error).toBe('このユーザーは組織のメンバーではありません');
	});

	it('should fail when updateUserRole returns empty (TOCTOU: user moved to another org)', async () => {
		const repo = createMockRepo({
			findOrganizationById: vi.fn().mockResolvedValue({ id: 1 }),
			findUserInOrganization: vi.fn().mockResolvedValue({ id: 1, role: 'owner' }),
			findUserByEmail: vi.fn().mockResolvedValue({ id: 2, organizationId: 1, role: 'member' }),
			updateUserRole: vi.fn().mockResolvedValue([])
		});

		const result = await addOrganizationAdmin(repo, {
			organizationId: 1,
			requestingUserId: 1,
			targetUserEmail: 'raced@example.com'
		});

		expect(result.success).toBe(false);
		expect(result.error).toBe('ユーザーの更新に失敗しました');
	});

	it('should fail when requesting user tries to update their own role (self-update)', async () => {
		const repo = createMockRepo({
			findOrganizationById: vi.fn().mockResolvedValue({ id: 1 }),
			findUserInOrganization: vi.fn().mockResolvedValue({ id: 1, role: 'owner' }),
			findUserByEmail: vi.fn().mockResolvedValue({ id: 1, organizationId: 1 })
		});

		const result = await addOrganizationAdmin(repo, {
			organizationId: 1,
			requestingUserId: 1,
			targetUserEmail: 'owner@example.com'
		});

		expect(result.success).toBe(false);
		expect(result.error).toBe('自分自身のロールは変更できません');
		expect(repo.updateUserRole).not.toHaveBeenCalled();
	});

	it('should succeed when target user already belongs to the same organization', async () => {
		const repo = createMockRepo({
			findOrganizationById: vi.fn().mockResolvedValue({ id: 1 }),
			findUserInOrganization: vi.fn().mockResolvedValue({ id: 1, role: 'owner' }),
			findUserByEmail: vi.fn().mockResolvedValue({ id: 2, organizationId: 1, role: 'member' })
		});

		const result = await addOrganizationAdmin(repo, {
			organizationId: 1,
			requestingUserId: 1,
			targetUserEmail: 'same-org@example.com'
		});

		expect(result.success).toBe(true);
		expect(repo.updateUserRole).toHaveBeenCalledWith(2, 'admin', 1);
	});

	it('should fail when target user has no organization (no consent to be moved)', async () => {
		const repo = createMockRepo({
			findOrganizationById: vi.fn().mockResolvedValue({ id: 1 }),
			findUserInOrganization: vi.fn().mockResolvedValue({ id: 1, role: 'owner' }),
			findUserByEmail: vi.fn().mockResolvedValue({ id: 2, organizationId: null, role: 'member' })
		});

		const result = await addOrganizationAdmin(repo, {
			organizationId: 1,
			requestingUserId: 1,
			targetUserEmail: 'unaffiliated@example.com'
		});

		expect(result.success).toBe(false);
		expect(repo.updateUserRole).not.toHaveBeenCalled();
	});

	it('should fail when admin targets an owner (no demotion)', async () => {
		const repo = createMockRepo({
			findOrganizationById: vi.fn().mockResolvedValue({ id: 1 }),
			findUserInOrganization: vi.fn().mockResolvedValue({ id: 1, role: 'admin' }),
			findUserByEmail: vi.fn().mockResolvedValue({ id: 2, organizationId: 1, role: 'owner' })
		});

		const result = await addOrganizationAdmin(repo, {
			organizationId: 1,
			requestingUserId: 1,
			targetUserEmail: 'owner@example.com'
		});

		expect(result.success).toBe(false);
		expect(repo.updateUserRole).not.toHaveBeenCalled();
	});

	it('should fail when admin targets another admin', async () => {
		const repo = createMockRepo({
			findOrganizationById: vi.fn().mockResolvedValue({ id: 1 }),
			findUserInOrganization: vi.fn().mockResolvedValue({ id: 1, role: 'admin' }),
			findUserByEmail: vi.fn().mockResolvedValue({ id: 2, organizationId: 1, role: 'admin' })
		});

		const result = await addOrganizationAdmin(repo, {
			organizationId: 1,
			requestingUserId: 1,
			targetUserEmail: 'admin2@example.com'
		});

		expect(result.success).toBe(false);
		expect(repo.updateUserRole).not.toHaveBeenCalled();
	});

	it('should fail when owner targets another owner', async () => {
		const repo = createMockRepo({
			findOrganizationById: vi.fn().mockResolvedValue({ id: 1 }),
			findUserInOrganization: vi.fn().mockResolvedValue({ id: 1, role: 'owner' }),
			findUserByEmail: vi.fn().mockResolvedValue({ id: 2, organizationId: 1, role: 'owner' })
		});

		const result = await addOrganizationAdmin(repo, {
			organizationId: 1,
			requestingUserId: 1,
			targetUserEmail: 'owner2@example.com'
		});

		expect(result.success).toBe(false);
		expect(repo.updateUserRole).not.toHaveBeenCalled();
	});
});

describe('deleteOrganization', () => {
	it('should fail when organization does not exist', async () => {
		const repo = createMockRepo();

		const result = await deleteOrganization(repo, {
			organizationId: 1,
			requestingUserId: 1
		});

		expect(result.success).toBe(false);
		expect(result.error).toBe('組織が見つかりません');
	});

	it('should fail when requesting user is not in the organization', async () => {
		const repo = createMockRepo({
			findOrganizationById: vi.fn().mockResolvedValue({ id: 1 })
		});

		const result = await deleteOrganization(repo, {
			organizationId: 1,
			requestingUserId: 1
		});

		expect(result.success).toBe(false);
		expect(result.error).toBe('権限がありません');
	});

	it('should fail when admin tries to delete organization', async () => {
		const repo = createMockRepo({
			findOrganizationById: vi.fn().mockResolvedValue({ id: 1 }),
			findUserInOrganization: vi.fn().mockResolvedValue({ id: 1, role: 'admin' })
		});

		const result = await deleteOrganization(repo, {
			organizationId: 1,
			requestingUserId: 1
		});

		expect(result.success).toBe(false);
		expect(result.error).toBe('組織を削除する権限がありません');
	});

	it('should fail when member tries to delete organization', async () => {
		const repo = createMockRepo({
			findOrganizationById: vi.fn().mockResolvedValue({ id: 1 }),
			findUserInOrganization: vi.fn().mockResolvedValue({ id: 3, role: 'member' })
		});

		const result = await deleteOrganization(repo, {
			organizationId: 1,
			requestingUserId: 3
		});

		expect(result.success).toBe(false);
		expect(result.error).toBe('組織を削除する権限がありません');
	});

	it('should succeed when owner deletes organization and soft-delete projects', async () => {
		const repo = createMockRepo({
			findOrganizationById: vi.fn().mockResolvedValue({ id: 1 }),
			findUserInOrganization: vi.fn().mockResolvedValue({ id: 1, role: 'owner' }),
			findUserIdsByOrganization: vi.fn().mockResolvedValue([{ id: 1 }, { id: 2 }])
		});

		const result = await deleteOrganization(repo, {
			organizationId: 1,
			requestingUserId: 1
		});

		expect(result.success).toBe(true);
		// Should soft delete projects for each user in the organization
		expect(repo.softDeleteProjectsByUserId).toHaveBeenCalledTimes(2);
		// Should soft delete the organization
		expect(repo.softDeleteOrganization).toHaveBeenCalledWith(1, expect.any(Date));
	});

	it('should soft-delete organization even with no users', async () => {
		const repo = createMockRepo({
			findOrganizationById: vi.fn().mockResolvedValue({ id: 1 }),
			findUserInOrganization: vi.fn().mockResolvedValue({ id: 1, role: 'owner' }),
			findUserIdsByOrganization: vi.fn().mockResolvedValue([])
		});

		const result = await deleteOrganization(repo, {
			organizationId: 1,
			requestingUserId: 1
		});

		expect(result.success).toBe(true);
		expect(repo.softDeleteProjectsByUserId).not.toHaveBeenCalled();
		expect(repo.softDeleteOrganization).toHaveBeenCalledWith(1, expect.any(Date));
	});
});

describe('createOrganization', () => {
	const params = { userId: 1, name: 'Acme', slug: 'acme' };

	it('creates an organization for a user without one', async () => {
		const repo = {
			findUserOrganizationId: vi.fn().mockResolvedValue({ organizationId: null }),
			createOrganizationWithOwner: vi.fn().mockResolvedValue(undefined)
		};
		const result = await createOrganization(repo, params);
		expect(result.success).toBe(true);
		expect(repo.createOrganizationWithOwner).toHaveBeenCalledWith(params);
	});

	it('rejects a user who already belongs to an organization', async () => {
		const repo = {
			findUserOrganizationId: vi.fn().mockResolvedValue({ organizationId: 5 }),
			createOrganizationWithOwner: vi.fn()
		};
		const result = await createOrganization(repo, params);
		expect(result).toEqual({ success: false, error: '既に組織に所属しています' });
		expect(repo.createOrganizationWithOwner).not.toHaveBeenCalled();
	});

	it('fails when the user does not exist', async () => {
		const repo = {
			findUserOrganizationId: vi.fn().mockResolvedValue(undefined),
			createOrganizationWithOwner: vi.fn()
		};
		const result = await createOrganization(repo, params);
		expect(result.success).toBe(false);
		expect(repo.createOrganizationWithOwner).not.toHaveBeenCalled();
	});

	it('fails when the atomic update rolls back (race) or the repository throws', async () => {
		const repo = {
			findUserOrganizationId: vi.fn().mockResolvedValue({ organizationId: null }),
			createOrganizationWithOwner: vi.fn().mockRejectedValue(new Error('db'))
		};
		const result = await createOrganization(repo, params);
		expect(result.success).toBe(false);
	});
});
