import { redirect } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { user } from '$lib/server/db/schema';
import { eq, and, isNull } from 'drizzle-orm';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async (event) => {
	const session = event.locals.session;

	// If not authenticated, redirect to login
	if (!session?.email) {
		throw redirect(303, '/login');
	}

	// Check if user exists in database
	const [currentUser] = await db
		.select()
		.from(user)
		.where(and(eq(user.email, session.email), isNull(user.deletedAt)));

	if (!currentUser) {
		// User authenticated but not registered, go to signup
		throw redirect(303, '/signup');
	}

	// User exists, redirect to projects
	throw redirect(303, '/projects');
};
