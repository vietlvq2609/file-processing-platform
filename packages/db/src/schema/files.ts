import { bigint, pgEnum, pgTable, text, timestamp, uuid, varchar } from 'drizzle-orm/pg-core';

export const fileStatusEnum = pgEnum('file_status', ['pending', 'ready', 'deleted']);

export const files = pgTable('files', {
  id: uuid('id').primaryKey().defaultRandom(),
  // No FK to users.id: guest sessions are stateless JWTs with no persisted user row.
  userId: uuid('user_id').notNull(),
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
