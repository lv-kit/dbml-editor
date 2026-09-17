import { fail, redirect } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { organization, user } from '$lib/server/db/schema';
import { eq, and, isNull } from 'drizzle-orm';
import {
	PENDING_ORGANIZATION_COOKIE_NAME,
	verifyPendingOrganizationCookie
} from '$lib/server/session';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ url, locals }) => {
	const session = locals.session;

	// If not authenticated, redirect to login
	if (!session?.email) {
		const returnTo = encodeURIComponent(url.pathname + url.search);
		throw redirect(303, `/login?returnTo=${returnTo}`);
	}

	const userType = url.searchParams.get('userType') ?? 'personal';
	const organizationId = url.searchParams.get('organizationId');

	return {
		userType,
		organizationId: organizationId ? Number(organizationId) : null,
		sessionEmail: session.email,
		sessionName: session.name || ''
	};
};

export const actions: Actions = {
	default: async ({ request, locals, cookies }) => {
		const session = locals.session;

		// Verify user is authenticated
		if (!session?.email) {
			return fail(401, {
				name: '',
				email: '',
				error: '認証が必要です。再度ログインしてください。'
			});
		}

		const data = await request.formData();
		const name = data.get('name');
		const userType = data.get('userType');
		const organizationId = data.get('organizationId');

		// Use normalized email from session, not from form
		const email = session.email.trim().toLowerCase();

		if (!name || typeof name !== 'string' || name.trim() === '') {
			return fail(400, {
				name: name ?? '',
				email: email,
				error: '名前を入力してください'
			});
		}

		const orgId = organizationId ? Number(organizationId) : null;
		if (userType !== 'personal' && userType !== 'corporate') {
			return fail(400, {
				name: name,
				email: email,
				error: '無効な利用形態です'
			});
		}
		if (userType === 'personal' && orgId !== null) {
			return fail(400, {
				name: name,
				email: email,
				error: '個人利用では組織を指定できません'
			});
		}
		if (userType === 'corporate' && orgId === null) {
			return fail(400, {
				name: name,
				email: email,
				error: '組織情報がありません。最初からやり直してください'
			});
		}
		if (orgId !== null && (!Number.isInteger(orgId) || orgId <= 0)) {
			return fail(400, {
				name: name,
				email: email,
				error: '無効な組織IDです'
			});
		}

		if (orgId !== null) {
			const pendingOrganizationCookie = cookies.get(PENDING_ORGANIZATION_COOKIE_NAME);
			const isAuthorized = pendingOrganizationCookie
				? await verifyPendingOrganizationCookie(pendingOrganizationCookie, session.uid, orgId)
				: false;
			if (!isAuthorized) {
				return fail(403, {
					name,
					email,
					error: '組織登録の手続きが無効です。最初からやり直してください'
				});
			}
		}

		try {
			// Check if user already exists
			const [existingUser] = await db
				.select()
				.from(user)
				.where(and(eq(user.email, email), isNull(user.deletedAt)));

			if (existingUser) {
				// User already registered, redirect to projects
				throw redirect(303, '/projects');
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

			// Auth provider from session
			const authProvider = session.provider ?? 'unknown';
			const authProviderId = session.uid ?? null;

			await db.insert(user).values({
				name: name.trim(),
				email: email,
				userType,
				role,
				organizationId: orgId,
				authProvider,
				authProviderId
			});
			cookies.delete(PENDING_ORGANIZATION_COOKIE_NAME, { path: '/' });
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

		throw redirect(303, '/projects');
	}
};
