import { sql } from 'drizzle-orm';
import { index, integer, pgTable, serial, text, timestamp, uniqueIndex } from 'drizzle-orm/pg-core';

export const task = pgTable('task', {
	id: serial('id').primaryKey(),
	title: text('title').notNull(),
	priority: integer('priority').notNull().default(1)
});

export const organization = pgTable('organization', {
	id: serial('id').primaryKey(),
	name: text('name').notNull(),
	slug: text('slug').notNull().unique(),
	createdAt: timestamp('created_at').notNull().defaultNow(),
	deletedAt: timestamp('deleted_at')
});

export const user = pgTable(
	'user',
	{
		id: serial('id').primaryKey(),
		name: text('name').notNull(),
		email: text('email').notNull(),
		userType: text('user_type').notNull(),
		role: text('role').notNull().default('member'),
		organizationId: integer('organization_id').references(() => organization.id),
		authProvider: text('auth_provider'),
		authProviderId: text('auth_provider_id'),
		createdAt: timestamp('created_at').notNull().defaultNow(),
		deletedAt: timestamp('deleted_at')
	},
	(table) => [
		uniqueIndex('user_email_active_unique')
			.on(sql`lower(${table.email})`)
			.where(sql`${table.deletedAt} is null`),
		index('user_organization_id_idx').on(table.organizationId)
	]
);

export const project = pgTable(
	'project',
	{
		id: serial('id').primaryKey(),
		name: text('name').notNull(),
		dbmlContent: text('dbml_content').notNull().default(''),
		userId: integer('user_id')
			.notNull()
			.references(() => user.id),
		createdAt: timestamp('created_at').notNull().defaultNow(),
		updatedAt: timestamp('updated_at').notNull().defaultNow(),
		deletedAt: timestamp('deleted_at')
	},
	(table) => [index('project_user_id_idx').on(table.userId)]
);
