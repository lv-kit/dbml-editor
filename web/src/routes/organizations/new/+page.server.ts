import { fail, redirect } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { user } from '$lib/server/db/schema';
import {
	createOrganization,
	createOrganizationCreationRepository
} from '$lib/server/services/organization';
import { and, eq, isNull, sql } from 'drizzle-orm';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals, url }) => {
	const session = locals.session;
	if (!session?.email) {
		const returnTo = encodeURIComponent(url.pathname + url.search);
		throw redirect(303, `/login?returnTo=${returnTo}`);
	}

	return {};
};

export const actions: Actions = {
	default: async ({ request, locals }) => {
		const session = locals.session;
		if (!session?.email) {
			return fail(401, { name: '', slug: '', error: '認証が必要です' });
		}

		const normalizedEmail = session.email.trim().toLowerCase();
		const [currentUser] = await db
			.select({ id: user.id })
			.from(user)
			.where(and(sql`lower(${user.email}) = ${normalizedEmail}`, isNull(user.deletedAt)));

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

		const result = await createOrganization(createOrganizationCreationRepository(db), {
			userId: currentUser.id,
			name: name.trim(),
			slug: slug.trim()
		});
		if (!result.success) {
			return fail(result.error === '既に組織に所属しています' ? 409 : 500, {
				name: name,
				slug: slug,
				error: result.error
			});
		}

		throw redirect(303, '/organizations');
	}
};
