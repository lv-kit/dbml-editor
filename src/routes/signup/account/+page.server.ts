import { fail, redirect } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { user } from '$lib/server/db/schema';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ url }) => {
	const userType = url.searchParams.get('userType') ?? 'personal';
	const organizationId = url.searchParams.get('organizationId');
	return {
		userType,
		organizationId: organizationId ? Number(organizationId) : null
	};
};

export const actions: Actions = {
	default: async ({ request }) => {
		const data = await request.formData();
		const name = data.get('name');
		const email = data.get('email');
		const userType = data.get('userType');
		const organizationId = data.get('organizationId');

		if (!name || typeof name !== 'string' || name.trim() === '') {
			return fail(400, {
				name: name ?? '',
				email: email ?? '',
				error: '名前を入力してください'
			});
		}

		if (!email || typeof email !== 'string' || email.trim() === '') {
			return fail(400, {
				name: name,
				email: email ?? '',
				error: 'メールアドレスを入力してください'
			});
		}

		if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
			return fail(400, {
				name: name,
				email: email,
				error: '有効なメールアドレスを入力してください'
			});
		}

		let userId: number;
		const orgId = organizationId ? Number(organizationId) : null;
		if (orgId !== null && (!Number.isInteger(orgId) || orgId <= 0)) {
			return fail(400, {
				name: name,
				email: email,
				error: '無効な組織IDです'
			});
		}
		try {
			const [inserted] = await db
				.insert(user)
				.values({
					name: name.trim(),
					email: email.trim(),
					userType: typeof userType === 'string' ? userType : 'personal',
					role: orgId ? 'owner' : null,
					organizationId: orgId
				})
				.returning({ id: user.id });
			userId = inserted.id;
		} catch {
			return fail(500, {
				name: name,
				email: email,
				error: 'アカウントの作成に失敗しました'
			});
		}

		throw redirect(303, `/projects?userId=${userId}`);
	}
};
