import { pgTable, serial, integer, text, timestamp } from 'drizzle-orm/pg-core';

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

export const user = pgTable('user', {
	id: serial('id').primaryKey(),
	name: text('name').notNull(),
	email: text('email').notNull().unique(),
	userType: text('user_type').notNull(),
	role: text('role'),
	organizationId: integer('organization_id').references(() => organization.id),
	createdAt: timestamp('created_at').notNull().defaultNow()
});

export const project = pgTable('project', {
	id: serial('id').primaryKey(),
	name: text('name').notNull(),
	dbmlContent: text('dbml_content').notNull().default(''),
	userId: integer('user_id')
		.notNull()
		.references(() => user.id),
	createdAt: timestamp('created_at').notNull().defaultNow(),
	updatedAt: timestamp('updated_at').notNull().defaultNow(),
	deletedAt: timestamp('deleted_at')
});
