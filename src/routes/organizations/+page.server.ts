import { db } from '$lib/server/db';
import { organization } from '$lib/server/db/schema';
import { asc, isNull } from 'drizzle-orm';

export async function load() {
	const organizations = await db
		.select()
		.from(organization)
		.where(isNull(organization.deletedAt))
		.orderBy(asc(organization.createdAt));
	return { organizations };
}
