import { char, pgTable, text, timestamp, uuid, varchar } from 'drizzle-orm/pg-core';

import { users } from './users.js';

export const apiKeys = pgTable('api_keys', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  keyHash: text('key_hash').notNull(),
  keyPrefix: varchar('key_prefix', { length: 10 }).notNull(),
  lastFour: char('last_four', { length: 4 }).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

export type ApiKeyRow = typeof apiKeys.$inferSelect;
export type NewApiKey = typeof apiKeys.$inferInsert;
