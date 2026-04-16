import { fail, redirect } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { organization, user } from '$lib/server/db/schema';
import { and, eq, isNull } from 'drizzle-orm';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals, url }) => {
	const session = locals.session;
	if (!session?.email) {
		const returnTo = encodeURIComponent(url.pathname + url.search);
		throw redirect(303, `/login?returnTo=${returnTo}`);
	}
};

export const actions: Actions = {
	default: async ({ request, locals }) => {
		const session = locals.session;
		if (!session?.email) {
			return fail(401, { name: '', slug: '', error: '認証が必要です' });
		}

		const [currentUser] = await db
			.select({ id: user.id })
			.from(user)
			.where(and(eq(user.email, session.email), isNull(user.deletedAt)));

		if (!currentUser) {
			return fail(401, { name: '', slug: '', error: 'ユーザーが見つかりません' });
		}

		const data = await request.formData();
		const name = data.get('name');
		const slug = data.get('slug');

		if (!name || typeof name !== 'string' || name.trim() === '') {
			return fail(400, { name: name ?? '', slug: slug ?? '', error: '組織名を入力してください' });
		}

		if (!slug || typeof slug !== 'string' || slug.trim() === '') {
			return fail(400, {
				name: name,
				slug: slug ?? '',
				error: 'スラッグを入力してください'
			});
		}

		if (!/^[a-z0-9-]+$/.test(slug.trim())) {
			return fail(400, {
				name: name,
				slug: slug,
				error: 'スラッグは半角英数字とハイフンのみ使用できます'
			});
		}

		let newOrg: { id: number };
		try {
			const [created] = await db
				.insert(organization)
				.values({
					name: name.trim(),
					slug: slug.trim()
				})
				.returning({ id: organization.id });
			newOrg = created;
		} catch {
			return fail(500, {
				name: name,
				slug: slug,
				error: '組織の作成に失敗しました'
			});
		}

		await db
			.update(user)
			.set({ organizationId: newOrg.id, role: 'owner' })
			.where(eq(user.id, currentUser.id));

		throw redirect(303, '/organizations');
	}
};
