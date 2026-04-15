import { fail, redirect } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { organization, user } from '$lib/server/db/schema';
import { and, eq, isNull } from 'drizzle-orm';
import {
	createOrganizationRepository,
	addOrganizationAdmin,
	deleteOrganization
} from '$lib/server/services/organization';
import type { Actions, PageServerLoad } from './$types';

async function getCurrentUser(event: { locals: App.Locals }) {
	const session = event.locals.session;
	if (!session?.email) {
		return undefined;
	}
	const [currentUser] = await db
		.select({ id: user.id, role: user.role, organizationId: user.organizationId })
		.from(user)
		.where(and(eq(user.email, session.email), isNull(user.deletedAt)));
	return currentUser;
}

export const load: PageServerLoad = async ({ params, locals }) => {
	const orgId = Number(params.id);
	if (!Number.isInteger(orgId) || orgId <= 0) {
		throw redirect(303, '/organizations');
	}

	const currentUser = await getCurrentUser({ locals });
	if (!currentUser) {
		throw redirect(303, '/signup');
	}

	const [org] = await db
		.select()
		.from(organization)
		.where(and(eq(organization.id, orgId), isNull(organization.deletedAt)));

	if (!org) {
		throw redirect(303, '/organizations');
	}

	// Enforce org membership — only members of this org can view details
	if (!currentUser.organizationId || currentUser.organizationId !== org.id) {
		throw redirect(303, '/organizations');
	}

	const members = await db
		.select({ id: user.id, name: user.name, email: user.email, role: user.role })
		.from(user)
		.where(and(eq(user.organizationId, org.id), isNull(user.deletedAt)));

	return { organization: org, members, currentUser };
};

export const actions: Actions = {
	addAdmin: async ({ request, params, locals }) => {
		const orgId = Number(params.id);
		if (!Number.isInteger(orgId) || orgId <= 0) {
			return fail(400, { error: '無効な組織IDです' });
		}

		const currentUser = await getCurrentUser({ locals });
		if (!currentUser) {
			return fail(401, { error: '認証が必要です' });
		}

		const data = await request.formData();
		const email = data.get('email');

		if (!email || typeof email !== 'string' || email.trim() === '') {
			return fail(400, { error: 'メールアドレスを入力してください' });
		}

		const repo = createOrganizationRepository(db);
		const result = await addOrganizationAdmin(repo, {
			organizationId: orgId,
			requestingUserId: currentUser.id,
			targetUserEmail: email.trim()
		});

		if (!result.success) {
			return fail(400, { error: result.error });
		}

		return { success: true };
	},

	delete: async ({ params, locals }) => {
		const orgId = Number(params.id);
		if (!Number.isInteger(orgId) || orgId <= 0) {
			return fail(400, { error: '無効な組織IDです' });
		}

		const currentUser = await getCurrentUser({ locals });
		if (!currentUser) {
			return fail(401, { error: '認証が必要です' });
		}

		const repo = createOrganizationRepository(db);
		const result = await deleteOrganization(repo, {
			organizationId: orgId,
			requestingUserId: currentUser.id
		});

		if (!result.success) {
			return fail(400, { error: result.error });
		}

		throw redirect(303, '/organizations');
	}
};
