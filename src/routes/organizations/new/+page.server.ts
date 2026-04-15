import { fail, redirect } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { organization } from '$lib/server/db/schema';
import type { Actions } from './$types';

export const actions: Actions = {
	default: async ({ request, locals }) => {
		const session = locals.session;
		if (!session?.email) {
			return fail(401, { name: '', slug: '', error: '認証が必要です' });
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

		try {
			await db.insert(organization).values({
				name: name.trim(),
				slug: slug.trim()
			});
		} catch {
			return fail(500, {
				name: name,
				slug: slug,
				error: '組織の作成に失敗しました'
			});
		}

		throw redirect(303, '/organizations');
	}
};
