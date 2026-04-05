import { db } from '$lib/server/db';
import { project, user } from '$lib/server/db/schema';
import { asc, eq } from 'drizzle-orm';
import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ url }) => {
	const userId = url.searchParams.get('userId');
	if (!userId) {
		throw redirect(303, '/signup');
	}

	const [currentUser] = await db
		.select()
		.from(user)
		.where(eq(user.id, Number(userId)));
	if (!currentUser) {
		throw redirect(303, '/signup');
	}

	const projects = await db
		.select()
		.from(project)
		.where(eq(project.userId, currentUser.id))
		.orderBy(asc(project.createdAt));

	return { user: currentUser, projects };
};

export const actions: Actions = {
	create: async ({ request }) => {
		const data = await request.formData();
		const name = data.get('name');
		const userId = data.get('userId');

		if (!name || typeof name !== 'string' || name.trim() === '') {
			return fail(400, { error: 'プロジェクト名を入力してください' });
		}

		if (!userId || typeof userId !== 'string') {
			return fail(400, { error: '無効なユーザーです' });
		}

		const [inserted] = await db
			.insert(project)
			.values({
				name: name.trim(),
				userId: Number(userId)
			})
			.returning({ id: project.id });

		throw redirect(303, `/projects/${inserted.id}?userId=${userId}`);
	}
};
