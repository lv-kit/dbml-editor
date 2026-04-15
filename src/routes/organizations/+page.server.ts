import { redirect } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { organization, user } from '$lib/server/db/schema';
import { and, asc, eq, isNull } from 'drizzle-orm';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals, url }) => {
	const session = locals.session;
	if (!session?.email) {
		const returnTo = encodeURIComponent(url.pathname + url.search);
		throw redirect(303, `/login?returnTo=${returnTo}`);
	}

	const [currentUser] = await db
		.select({ id: user.id, organizationId: user.organizationId })
		.from(user)
		.where(and(eq(user.email, session.email), isNull(user.deletedAt)));

	if (!currentUser) {
		throw redirect(303, '/signup');
	}

	const organizations = currentUser.organizationId
		? await db
				.select()
				.from(organization)
				.where(and(eq(organization.id, currentUser.organizationId), isNull(organization.deletedAt)))
				.orderBy(asc(organization.createdAt))
		: [];
	return { organizations };
};
