import { fail } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { organization, user } from '$lib/server/db/schema';
import { eq, and } from 'drizzle-orm';
import {
	canManageMembers,
	canChangeRole,
	canRemoveMember,
	validateMemberRole,
	validateEmail,
	type MemberRole
} from '$lib/members';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params, url }) => {
	const currentUserId = url.searchParams.get('userId');

	const [org] = await db
		.select()
		.from(organization)
		.where(eq(organization.slug, params.slug));

	if (!org) {
		return { error: '組織が見つかりません', org: null, members: [], currentUser: null };
	}

	const members = await db
		.select()
		.from(user)
		.where(eq(user.organizationId, org.id));

	const currentUser = currentUserId
		? members.find((m) => m.id === Number(currentUserId)) ?? null
		: null;

	return { org, members, currentUser };
};

export const actions: Actions = {
	add: async ({ request, params }) => {
		const data = await request.formData();
		const name = data.get('name');
		const email = data.get('email');
		const role = data.get('role');
		const currentUserId = data.get('currentUserId');

		const [org] = await db
			.select()
			.from(organization)
			.where(eq(organization.slug, params.slug));

		if (!org) {
			return fail(404, { error: '組織が見つかりません' });
		}

		if (!currentUserId) {
			return fail(403, { error: '認証が必要です' });
		}

		const [currentUser] = await db
			.select()
			.from(user)
			.where(and(eq(user.id, Number(currentUserId)), eq(user.organizationId, org.id)));

		if (!currentUser || !canManageMembers(currentUser.role as MemberRole)) {
			return fail(403, { error: 'メンバーを管理する権限がありません' });
		}

		if (!name || typeof name !== 'string' || name.trim() === '') {
			return fail(400, { error: '名前を入力してください' });
		}

		if (!email || typeof email !== 'string' || !validateEmail(email)) {
			return fail(400, { error: '有効なメールアドレスを入力してください' });
		}

		const memberRole = typeof role === 'string' && validateMemberRole(role) ? role : 'member';

		try {
			await db.insert(user).values({
				name: name.trim(),
				email: email.trim(),
				userType: 'corporate',
				role: memberRole,
				organizationId: org.id
			});
		} catch {
			return fail(500, { error: 'メンバーの追加に失敗しました' });
		}

		return { success: true };
	},

	updateRole: async ({ request, params }) => {
		const data = await request.formData();
		const targetUserId = data.get('targetUserId');
		const newRole = data.get('role');
		const currentUserId = data.get('currentUserId');

		const [org] = await db
			.select()
			.from(organization)
			.where(eq(organization.slug, params.slug));

		if (!org) {
			return fail(404, { error: '組織が見つかりません' });
		}

		if (!currentUserId || !targetUserId) {
			return fail(400, { error: 'パラメータが不足しています' });
		}

		if (!newRole || typeof newRole !== 'string' || !validateMemberRole(newRole)) {
			return fail(400, { error: '無効な権限です' });
		}

		const [currentUser] = await db
			.select()
			.from(user)
			.where(and(eq(user.id, Number(currentUserId)), eq(user.organizationId, org.id)));

		const [targetUser] = await db
			.select()
			.from(user)
			.where(and(eq(user.id, Number(targetUserId)), eq(user.organizationId, org.id)));

		if (!currentUser || !targetUser) {
			return fail(404, { error: 'ユーザーが見つかりません' });
		}

		if (
			!canChangeRole(
				currentUser.role as MemberRole,
				targetUser.role as MemberRole,
				newRole as MemberRole
			)
		) {
			return fail(403, { error: '権限を変更する権限がありません' });
		}

		try {
			await db.update(user).set({ role: newRole }).where(eq(user.id, Number(targetUserId)));
		} catch {
			return fail(500, { error: '権限の変更に失敗しました' });
		}

		return { success: true };
	},

	remove: async ({ request, params }) => {
		const data = await request.formData();
		const targetUserId = data.get('targetUserId');
		const currentUserId = data.get('currentUserId');

		const [org] = await db
			.select()
			.from(organization)
			.where(eq(organization.slug, params.slug));

		if (!org) {
			return fail(404, { error: '組織が見つかりません' });
		}

		if (!currentUserId || !targetUserId) {
			return fail(400, { error: 'パラメータが不足しています' });
		}

		const [currentUser] = await db
			.select()
			.from(user)
			.where(and(eq(user.id, Number(currentUserId)), eq(user.organizationId, org.id)));

		const [targetUser] = await db
			.select()
			.from(user)
			.where(and(eq(user.id, Number(targetUserId)), eq(user.organizationId, org.id)));

		if (!currentUser || !targetUser) {
			return fail(404, { error: 'ユーザーが見つかりません' });
		}

		if (!canRemoveMember(currentUser.role as MemberRole, targetUser.role as MemberRole)) {
			return fail(403, { error: 'メンバーを削除する権限がありません' });
		}

		try {
			await db.delete(user).where(eq(user.id, Number(targetUserId)));
		} catch {
			return fail(500, { error: 'メンバーの削除に失敗しました' });
		}

		return { success: true };
	}
};
