import { redirect } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { user } from '$lib/server/db/schema';
import { eq, and, isNull } from 'drizzle-orm';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async (event) => {
	const session = event.locals.session;

	// If not authenticated, redirect to login
	if (!session?.email) {
		throw redirect(303, '/login?returnTo=/signup');
	}

	// Check if user already exists in database
	const [existingUser] = await db
		.select()
		.from(user)
		.where(and(eq(user.email, session.email), isNull(user.deletedAt)));

	if (existingUser) {
		// User already has an account, redirect to projects
		throw redirect(303, '/projects');
	}

	// Return user info from session to pre-fill form
	return {
		userEmail: session.email,
		userName: session.name || ''
	};
};
