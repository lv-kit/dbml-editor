import { redirect } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { user } from '$lib/server/db/schema';
import { eq, and, isNull } from 'drizzle-orm';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ url }) => {
	const userId = url.searchParams.get('userId');
	if (!userId) {
		throw redirect(303, '/signup');
	}

	const [currentUser] = await db
		.select()
		.from(user)
		.where(and(eq(user.id, Number(userId)), isNull(user.deletedAt)));
	if (!currentUser) {
		throw redirect(303, '/signup');
	}

	throw redirect(303, `/projects?userId=${currentUser.id}`);
};
