import { db } from '$lib/server/db';
import { project, user } from '$lib/server/db/schema';
import { and, asc, eq, isNull } from 'drizzle-orm';
import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	const session = locals.session;
	if (!session?.email) {
		throw redirect(303, '/login');
	}

	const [currentUser] = await db
		.select({ id: user.id, name: user.name })
		.from(user)
		.where(and(eq(user.email, session.email), isNull(user.deletedAt)));
	if (!currentUser) {
		throw redirect(303, '/signup');
	}

	const projects = await db
		.select()
		.from(project)
		.where(and(eq(project.userId, currentUser.id), isNull(project.deletedAt)))
		.orderBy(asc(project.createdAt));

	return { user: currentUser, projects };
};

export const actions: Actions = {
	create: async ({ request, locals }) => {
		const session = locals.session;
		if (!session?.email) {
			return fail(401, { error: '認証が必要です' });
		}

		const [currentUser] = await db
			.select({ id: user.id })
			.from(user)
			.where(and(eq(user.email, session.email), isNull(user.deletedAt)));
		if (!currentUser) {
			return fail(401, { error: 'ユーザーが見つかりません' });
		}

		const data = await request.formData();
		const name = data.get('name');

		if (!name || typeof name !== 'string' || name.trim() === '') {
			return fail(400, { error: 'プロジェクト名を入力してください' });
		}

		const [inserted] = await db
			.insert(project)
			.values({
				name: name.trim(),
				userId: currentUser.id
			})
			.returning({ id: project.id });

		throw redirect(303, `/projects/${inserted.id}`);
	}
};
