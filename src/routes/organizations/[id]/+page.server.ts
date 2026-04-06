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

export const load: PageServerLoad = async ({ params, url }) => {
	const userId = url.searchParams.get('userId');
	if (!userId) {
		throw redirect(303, '/signup');
	}

	const [org] = await db
		.select()
		.from(organization)
		.where(and(eq(organization.id, Number(params.id)), isNull(organization.deletedAt)));

	if (!org) {
		throw redirect(303, '/organizations');
	}

	const members = await db
		.select({ id: user.id, name: user.name, email: user.email, role: user.role })
		.from(user)
		.where(eq(user.organizationId, org.id));

	const [currentUser] = await db
		.select({ id: user.id, role: user.role })
		.from(user)
		.where(eq(user.id, Number(userId)));

	return { organization: org, members, currentUser, userId };
};

export const actions: Actions = {
	addAdmin: async ({ request, params }) => {
		const data = await request.formData();
		const userId = data.get('userId');
		const email = data.get('email');

		if (!userId || typeof userId !== 'string') {
			return fail(400, { error: '無効なユーザーです' });
		}

		if (!email || typeof email !== 'string' || email.trim() === '') {
			return fail(400, { error: 'メールアドレスを入力してください' });
		}

		const repo = createOrganizationRepository(db);
		const result = await addOrganizationAdmin(repo, {
			organizationId: Number(params.id),
			requestingUserId: Number(userId),
			targetUserEmail: email.trim()
		});

		if (!result.success) {
			return fail(400, { error: result.error });
		}

		return { success: true };
	},

	delete: async ({ request, params }) => {
		const data = await request.formData();
		const userId = data.get('userId');

		if (!userId || typeof userId !== 'string') {
			return fail(400, { error: '無効なユーザーです' });
		}

		const repo = createOrganizationRepository(db);
		const result = await deleteOrganization(repo, {
			organizationId: Number(params.id),
			requestingUserId: Number(userId)
		});

		if (!result.success) {
			return fail(400, { error: result.error });
		}

		throw redirect(303, `/organizations?userId=${userId}`);
	}
};
