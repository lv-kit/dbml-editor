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
	createdAt: timestamp('created_at').notNull().defaultNow()
});
