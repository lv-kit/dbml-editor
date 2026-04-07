import type { Handle } from '@sveltejs/kit';
import { getTextDirection } from '$lib/paraglide/runtime';
import { paraglideMiddleware } from '$lib/paraglide/server';
import { sequence } from '@sveltejs/kit/hooks';
import { verifySessionCookie, COOKIE_NAME } from '$lib/server/session';

const handleParaglide: Handle = ({ event, resolve }) =>
	paraglideMiddleware(event.request, ({ request, locale }) => {
		event.request = request;

		return resolve(event, {
			transformPageChunk: ({ html }) =>
				html
					.replace('%paraglide.lang%', locale)
					.replace('%paraglide.dir%', getTextDirection(locale))
		});
	});

const handleSession: Handle = async ({ event, resolve }) => {
	const sessionCookie = event.cookies.get(COOKIE_NAME);
	if (sessionCookie) {
		const session = await verifySessionCookie(sessionCookie);
		event.locals.session = session;
	} else {
		event.locals.session = null;
	}
	return resolve(event);
};

export const handle: Handle = sequence(handleSession, handleParaglide);
