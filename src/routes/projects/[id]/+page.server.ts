import { db } from '$lib/server/db';
import { project, user } from '$lib/server/db/schema';
import { and, eq, isNull } from 'drizzle-orm';
import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params, locals }) => {
	const session = locals.session;
	if (!session?.email) {
		throw redirect(303, '/login');
	}

	const [currentUser] = await db
		.select({ id: user.id })
		.from(user)
		.where(and(eq(user.email, session.email), isNull(user.deletedAt)));
	if (!currentUser) {
		throw redirect(303, '/signup');
	}

	const [proj] = await db
		.select()
		.from(project)
		.where(and(eq(project.id, Number(params.id)), isNull(project.deletedAt)));
	if (!proj) {
		throw redirect(303, '/projects');
	}

	// Ensure the project belongs to the current user
	if (proj.userId !== currentUser.id) {
		throw redirect(303, '/projects');
	}

	return { project: proj };
};

export const actions: Actions = {
	save: async ({ request, params, locals }) => {
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
		const dbmlContent = data.get('dbmlContent');

		if (typeof dbmlContent !== 'string') {
			return fail(400, { error: '無効なデータです' });
		}

		// Verify ownership before saving
		const [proj] = await db
			.select({ userId: project.userId })
			.from(project)
			.where(and(eq(project.id, Number(params.id)), isNull(project.deletedAt)));
		if (!proj || proj.userId !== currentUser.id) {
			return fail(403, { error: 'このプロジェクトを編集する権限がありません' });
		}

		await db
			.update(project)
			.set({
				dbmlContent,
				updatedAt: new Date()
			})
			.where(eq(project.id, Number(params.id)));

		return { success: true };
	}
};
