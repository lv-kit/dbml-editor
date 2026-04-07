import { redirect } from '@sveltejs/kit';
import { getFirebaseConfig, getProviderAvailability } from '../../auth';
import type { PageServerLoad } from './$types';

function getSafeReturnTo(returnTo: string | null, origin: string, fallback: string): string {
	if (!returnTo || !returnTo.startsWith('/') || returnTo.startsWith('//')) {
		return fallback;
	}
	try {
		const resolved = new URL(returnTo, origin);
		if (resolved.origin !== origin) {
			return fallback;
		}
		return `${resolved.pathname}${resolved.search}${resolved.hash}`;
	} catch {
		return fallback;
	}
}

export const load: PageServerLoad = async (event) => {
	const session = event.locals.session;

	// If already authenticated, redirect to appropriate page
	if (session?.email) {
		const returnTo = getSafeReturnTo(
			event.url.searchParams.get('returnTo'),
			event.url.origin,
			'/signup'
		);
		throw redirect(303, returnTo);
	}

	const providers = getProviderAvailability(event);
	const firebaseConfig = getFirebaseConfig(event);

	return {
		providers,
		firebaseConfig
	};
};
