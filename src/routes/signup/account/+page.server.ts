import { fail, redirect } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { organization, user } from '$lib/server/db/schema';
import { eq, and, isNull } from 'drizzle-orm';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ url, locals }) => {
	const session = await locals.auth();

	// If not authenticated, redirect to login
	if (!session?.user?.email) {
		throw redirect(303, '/login?returnTo=/signup/account');
	}

	const userType = url.searchParams.get('userType') ?? 'personal';
	const organizationId = url.searchParams.get('organizationId');

	return {
		userType,
		organizationId: organizationId ? Number(organizationId) : null,
		sessionEmail: session.user.email,
		sessionName: session.user.name || ''
	};
};

export const actions: Actions = {
	default: async ({ request, locals }) => {
		const session = await locals.auth();

		// Verify user is authenticated
		if (!session?.user?.email) {
			return fail(401, {
				error: '認証が必要です。再度ログインしてください。'
			});
		}

		const data = await request.formData();
		const name = data.get('name');
		const userType = data.get('userType');
		const organizationId = data.get('organizationId');

		// Use email from session, not from form
		const email = session.user.email;

		if (!name || typeof name !== 'string' || name.trim() === '') {
			return fail(400, {
				name: name ?? '',
				email: email,
				error: '名前を入力してください'
			});
		}

		let userId: number;
		const orgId = organizationId ? Number(organizationId) : null;
		if (orgId !== null && (!Number.isInteger(orgId) || orgId <= 0)) {
			return fail(400, {
				name: name,
				email: email,
				error: '無効な組織IDです'
			});
		}

		try {
			// Check if user already exists
			const [existingUser] = await db
				.select()
				.from(user)
				.where(and(eq(user.email, email), isNull(user.deletedAt)));

			if (existingUser) {
				// User already registered, redirect to projects
				throw redirect(303, `/projects?userId=${existingUser.id}`);
			}

			// Determine role: only assign 'owner' if org exists and has no existing owner
			let role = 'member';
			if (orgId) {
				const [org] = await db.select().from(organization).where(eq(organization.id, orgId));
				if (!org) {
					return fail(400, {
						name: name,
						email: email,
						error: '指定された組織が見つかりません'
					});
				}
				const [existingOwner] = await db
					.select({ id: user.id })
					.from(user)
					.where(
						and(eq(user.organizationId, orgId), eq(user.role, 'owner'), isNull(user.deletedAt))
					);
				role = existingOwner ? 'member' : 'owner';
			}

			// Get auth provider from session
			const authProvider = session.user.provider || 'unknown';
			const authProviderId = session.user.id || null;

			const [inserted] = await db
				.insert(user)
				.values({
					name: name.trim(),
					email: email,
					userType: typeof userType === 'string' ? userType : 'personal',
					role,
					organizationId: orgId,
					authProvider,
					authProviderId
				})
				.returning({ id: user.id });
			userId = inserted.id;
		} catch (error) {
			// If it's a redirect, re-throw it
			if (error && typeof error === 'object' && 'status' in error && error.status === 303) {
				throw error;
			}

			return fail(500, {
				name: name,
				email: email,
				error: 'アカウントの作成に失敗しました'
			});
		}

		throw redirect(303, `/projects?userId=${userId}`);
	}
};
