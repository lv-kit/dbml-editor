import { error, fail, redirect } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { organization, user } from '$lib/server/db/schema';
import { eq, and, isNull, sql } from 'drizzle-orm';
import {
	canManageMembers,
	canChangeRole,
	canRemoveMember,
	canAssignRole,
	validateMemberRole,
	validateEmail,
	type MemberRole
} from '$lib/members';
import type { Actions, PageServerLoad } from './$types';

async function resolveCurrentUser(locals: App.Locals, orgId: number) {
	const session = locals.session;
	if (!session?.email) return null;

	const normalizedEmail = session.email.trim().toLowerCase();
	const [currentUser] = await db
		.select()
		.from(user)
		.where(
			and(
				sql`lower(${user.email}) = ${normalizedEmail}`,
				eq(user.organizationId, orgId),
				isNull(user.deletedAt)
			)
		);

	return currentUser ?? null;
}

export const load: PageServerLoad = async ({ params, locals, url }) => {
	const session = locals.session;
	if (!session?.email) {
		const returnTo = encodeURIComponent(url.pathname + url.search);
		throw redirect(303, `/login?returnTo=${returnTo}`);
	}

	const [org] = await db
		.select()
		.from(organization)
		.where(and(eq(organization.slug, params.slug), isNull(organization.deletedAt)));

	if (!org) {
		return { error: '組織が見つかりません', org: null, members: [], currentUser: null };
	}

	const currentUser = await resolveCurrentUser(locals, org.id);

	if (!currentUser) {
		throw error(403, 'この組織へのアクセス権がありません');
	}

	const members = await db
		.select()
		.from(user)
		.where(and(eq(user.organizationId, org.id), isNull(user.deletedAt)));

	return { org, members, currentUser };
};

export const actions: Actions = {
	add: async ({ request, params, locals }) => {
		const session = locals.session;
		if (!session?.email) {
			return fail(401, { error: '認証が必要です' });
		}

		const data = await request.formData();
		const name = data.get('name');
		const email = data.get('email');
		const role = data.get('role');

		const [org] = await db
			.select()
			.from(organization)
			.where(and(eq(organization.slug, params.slug), isNull(organization.deletedAt)));

		if (!org) {
			return fail(404, { error: '組織が見つかりません' });
		}

		const currentUser = await resolveCurrentUser(locals, org.id);

		if (
			!currentUser ||
			!validateMemberRole(currentUser.role) ||
			!canManageMembers(currentUser.role as MemberRole)
		) {
			return fail(403, { error: 'メンバーを管理する権限がありません' });
		}

		if (!name || typeof name !== 'string' || name.trim() === '') {
			return fail(400, { error: '名前を入力してください' });
		}

		if (!email || typeof email !== 'string' || !validateEmail(email)) {
			return fail(400, { error: '有効なメールアドレスを入力してください' });
		}

		const memberRole = typeof role === 'string' && validateMemberRole(role) ? role : 'member';

		if (!canAssignRole(currentUser.role as MemberRole, memberRole as MemberRole)) {
			return fail(403, { error: 'この権限を付与する権限がありません' });
		}

		try {
			const normalizedInsertEmail = email.trim().toLowerCase();

			const [existingUser] = await db
				.select({ id: user.id })
				.from(user)
				.where(sql`lower(${user.email}) = ${normalizedInsertEmail}`);

			if (existingUser) {
				return fail(409, { error: 'このメールアドレスは既に登録されています' });
			}

			await db.insert(user).values({
				name: name.trim(),
				email: normalizedInsertEmail,
				userType: 'corporate',
				role: memberRole,
				organizationId: org.id
			});
		} catch (err) {
			const pgCode = (err as { code?: string })?.code;
			if (pgCode === '23505') {
				return fail(409, { error: 'このメールアドレスは既に登録されています' });
			}
			return fail(500, { error: 'メンバーの追加に失敗しました' });
		}

		return { success: true };
	},

	updateRole: async ({ request, params, locals }) => {
		const session = locals.session;
		if (!session?.email) {
			return fail(401, { error: '認証が必要です' });
		}

		const data = await request.formData();
		const targetUserId = data.get('targetUserId');
		const newRole = data.get('role');

		const [org] = await db
			.select()
			.from(organization)
			.where(and(eq(organization.slug, params.slug), isNull(organization.deletedAt)));

		if (!org) {
			return fail(404, { error: '組織が見つかりません' });
		}

		const currentUser = await resolveCurrentUser(locals, org.id);

		if (!currentUser) {
			return fail(403, { error: '権限がありません' });
		}

		if (!targetUserId) {
			return fail(400, { error: 'パラメータが不足しています' });
		}

		const targetUserIdNum = Number(targetUserId);
		if (!Number.isInteger(targetUserIdNum) || targetUserIdNum <= 0) {
			return fail(400, { error: '無効なユーザーIDです' });
		}

		if (!newRole || typeof newRole !== 'string' || !validateMemberRole(newRole)) {
			return fail(400, { error: '無効な権限です' });
		}

		const [targetUser] = await db
			.select()
			.from(user)
			.where(
				and(eq(user.id, targetUserIdNum), eq(user.organizationId, org.id), isNull(user.deletedAt))
			);

		if (!targetUser) {
			return fail(404, { error: 'ユーザーが見つかりません' });
		}

		if (
			!validateMemberRole(currentUser.role) ||
			!validateMemberRole(targetUser.role) ||
			!canChangeRole(
				currentUser.role as MemberRole,
				targetUser.role as MemberRole,
				newRole as MemberRole
			) ||
			!canAssignRole(currentUser.role as MemberRole, newRole as MemberRole)
		) {
			return fail(403, { error: '権限を変更する権限がありません' });
		}

		try {
			const updatedUsers = await db
				.update(user)
				.set({ role: newRole })
				.where(
					and(eq(user.id, targetUserIdNum), eq(user.organizationId, org.id), isNull(user.deletedAt))
				)
				.returning({ id: user.id });

			if (updatedUsers.length === 0) {
				return fail(404, { error: 'ユーザーが見つかりません' });
			}
		} catch {
			return fail(500, { error: '権限の変更に失敗しました' });
		}

		return { success: true };
	},

	remove: async ({ request, params, locals }) => {
		const session = locals.session;
		if (!session?.email) {
			return fail(401, { error: '認証が必要です' });
		}

		const data = await request.formData();
		const targetUserId = data.get('targetUserId');

		const [org] = await db
			.select()
			.from(organization)
			.where(and(eq(organization.slug, params.slug), isNull(organization.deletedAt)));

		if (!org) {
			return fail(404, { error: '組織が見つかりません' });
		}

		const currentUser = await resolveCurrentUser(locals, org.id);

		if (!currentUser) {
			return fail(403, { error: '権限がありません' });
		}

		if (!targetUserId) {
			return fail(400, { error: 'パラメータが不足しています' });
		}

		const targetUserIdNum = Number(targetUserId);
		if (!Number.isInteger(targetUserIdNum) || targetUserIdNum <= 0) {
			return fail(400, { error: '無効なユーザーIDです' });
		}

		const [targetUser] = await db
			.select()
			.from(user)
			.where(
				and(eq(user.id, targetUserIdNum), eq(user.organizationId, org.id), isNull(user.deletedAt))
			);

		if (!targetUser) {
			return fail(404, { error: 'ユーザーが見つかりません' });
		}

		if (
			!validateMemberRole(currentUser.role) ||
			!validateMemberRole(targetUser.role) ||
			!canRemoveMember(currentUser.role as MemberRole, targetUser.role as MemberRole)
		) {
			return fail(403, { error: 'メンバーを削除する権限がありません' });
		}

		try {
			const removed = await db
				.update(user)
				.set({ deletedAt: new Date() })
				.where(
					and(eq(user.id, targetUserIdNum), eq(user.organizationId, org.id), isNull(user.deletedAt))
				)
				.returning({ id: user.id });

			if (removed.length === 0) {
				return fail(404, { error: 'ユーザーが見つかりません' });
			}
		} catch {
			return fail(500, { error: 'メンバーの削除に失敗しました' });
		}

		return { success: true };
	}
};
