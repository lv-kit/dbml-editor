import { db } from '$lib/server/db';
import { organization } from '$lib/server/db/schema';
import { asc } from 'drizzle-orm';

export async function load() {
	const organizations = await db.select().from(organization).orderBy(asc(organization.createdAt));
	return { organizations };
}
