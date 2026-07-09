import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { verifyFirebaseIdToken } from '$lib/server/firebase-auth';
import { createSessionCookie, COOKIE_NAME, SESSION_DURATION_SECONDS } from '$lib/server/session';

export const POST: RequestHandler = async ({ request, cookies }) => {
	let idToken: string;
	try {
		const body = await request.json();
		idToken = body.idToken;
	} catch {
		throw error(400, 'Invalid request body');
	}

	if (!idToken || typeof idToken !== 'string') {
		throw error(400, 'idToken is required');
	}

	let tokenPayload;
	try {
		tokenPayload = await verifyFirebaseIdToken(idToken);
	} catch (e) {
		throw error(401, 'Invalid or expired token');
	}

	const sessionCookie = await createSessionCookie({
		uid: tokenPayload.uid,
		email: tokenPayload.email,
		name: tokenPayload.name,
		provider: tokenPayload.provider
	});

	cookies.set(COOKIE_NAME, sessionCookie, {
		path: '/',
		httpOnly: true,
		secure: true,
		sameSite: 'lax',
		maxAge: SESSION_DURATION_SECONDS
	});

	return json({ ok: true });
};

export const DELETE: RequestHandler = async ({ cookies }) => {
	cookies.delete(COOKIE_NAME, { path: '/' });
	return json({ ok: true });
};
