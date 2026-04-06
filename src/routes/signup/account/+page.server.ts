import { fail, redirect } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { organization, user } from '$lib/server/db/schema';
import { eq, and } from 'drizzle-orm';
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
		try {
			const orgId = organizationId ? Number(organizationId) : null;

			// Determine role: only assign 'owner' if org exists and has no existing owner
			let role = 'member';
			if (orgId) {
				const [org] = await db
					.select()
					.from(organization)
					.where(eq(organization.id, orgId));
				if (!org) {
					return fail(400, {
						name: name,
						email: email,
						error: '指定された組織が見つかりません'
					});
				}
				const [existingOwner] = await db
					.select({ id: user.id })
					.from(user)
					.where(and(eq(user.organizationId, orgId), eq(user.role, 'owner')));
				role = existingOwner ? 'member' : 'owner';
			}

			const [inserted] = await db
				.insert(user)
				.values({
					name: name.trim(),
					email: email.trim(),
					userType: typeof userType === 'string' ? userType : 'personal',
					role,
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
