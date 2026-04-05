import { db } from '$lib/server/db';
import { project } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';
import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params, url }) => {
	const userId = url.searchParams.get('userId');
	if (!userId) {
		throw redirect(303, '/signup');
	}

	const [proj] = await db
		.select()
		.from(project)
		.where(eq(project.id, Number(params.id)));
	if (!proj) {
		throw redirect(303, `/projects?userId=${userId}`);
	}

	return { project: proj, userId };
};

export const actions: Actions = {
	save: async ({ request, params }) => {
		const data = await request.formData();
		const dbmlContent = data.get('dbmlContent');
		const userId = data.get('userId');

		if (typeof dbmlContent !== 'string') {
			return fail(400, { error: '無効なデータです' });
		}

		await db
			.update(project)
			.set({
				dbmlContent,
				updatedAt: new Date()
			})
			.where(eq(project.id, Number(params.id)));

		return { success: true, userId };
	}
};
