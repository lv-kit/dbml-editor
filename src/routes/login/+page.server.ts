import { redirect } from '@sveltejs/kit';
import { getProviderAvailability } from '../../auth';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async (event) => {
	const session = await event.locals.auth();

	// If already authenticated, redirect to appropriate page
	if (session?.user?.email) {
		const returnTo = event.url.searchParams.get('returnTo') || '/signup';
		throw redirect(303, returnTo);
	}

	const providers = getProviderAvailability(event);

	return {
		providers
	};
};
