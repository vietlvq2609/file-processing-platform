import { pgTable, uuid, varchar, text, bigint, timestamp, pgEnum } from 'drizzle-orm/pg-core';
import { users } from './users.js';

export const fileStatusEnum = pgEnum('file_status', ['pending', 'ready', 'deleted']);

export const files = pgTable('files', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  originalName: varchar('original_name', { length: 255 }).notNull(),
  mimeType: varchar('mime_type', { length: 127 }).notNull(),
  size: bigint('size', { mode: 'number' }).notNull(),
  storagePath: text('storage_path').notNull(),
  status: fileStatusEnum('status').notNull().default('pending'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

export type File = typeof files.$inferSelect;
export type NewFile = typeof files.$inferInsert;
