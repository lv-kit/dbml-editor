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
	const session = await event.locals.auth();
	if (!session?.user?.email) {
		return undefined;
	}
	const [currentUser] = await db
		.select({ id: user.id, role: user.role, organizationId: user.organizationId })
		.from(user)
		.where(eq(user.email, session.user.email));
	return currentUser;
}

export const load: PageServerLoad = async ({ params, locals }) => {
	const currentUser = await getCurrentUser({ locals });
	if (!currentUser) {
		throw redirect(303, '/signup');
	}

	const [org] = await db
		.select()
		.from(organization)
		.where(and(eq(organization.id, Number(params.id)), isNull(organization.deletedAt)));

	if (!org) {
		throw redirect(303, '/organizations');
	}

	// Enforce org membership — only members of this org can view details
	if (currentUser.organizationId !== org.id) {
		throw redirect(303, '/organizations');
	}

	const members = await db
		.select({ id: user.id, name: user.name, email: user.email, role: user.role })
		.from(user)
		.where(eq(user.organizationId, org.id));

	return { organization: org, members, currentUser };
};

export const actions: Actions = {
	addAdmin: async ({ request, params, locals }) => {
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
			organizationId: Number(params.id),
			requestingUserId: currentUser.id,
			targetUserEmail: email.trim()
		});

		if (!result.success) {
			return fail(400, { error: result.error });
		}

		return { success: true };
	},

	delete: async ({ params, locals }) => {
		const currentUser = await getCurrentUser({ locals });
		if (!currentUser) {
			return fail(401, { error: '認証が必要です' });
		}

		const repo = createOrganizationRepository(db);
		const result = await deleteOrganization(repo, {
			organizationId: Number(params.id),
			requestingUserId: currentUser.id
		});

		if (!result.success) {
			return fail(400, { error: result.error });
		}

		throw redirect(303, '/organizations');
	}
};
