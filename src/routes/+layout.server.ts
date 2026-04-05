import type { LayoutServerLoad } from './$types';
import { getProviderAvailability } from '../auth';

export const load: LayoutServerLoad = async (event) => {
	const session = await event.locals.auth();

	return {
		session,
		providers: getProviderAvailability(event)
	};
};
