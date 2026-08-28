import { integer, pgEnum, pgTable, text, timestamp, uuid, varchar } from 'drizzle-orm/pg-core';

import { files } from './files.js';
import { users } from './users.js';

export const jobStatusEnum = pgEnum('job_status', ['pending', 'active', 'completed', 'failed']);

export const jobs = pgTable('jobs', {
  id: uuid('id').primaryKey().defaultRandom(),
  fileId: uuid('file_id')
    .notNull()
    .references(() => files.id, { onDelete: 'cascade' }),
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  type: varchar('type', { length: 63 }).notNull().default('default'),
  status: jobStatusEnum('status').notNull().default('pending'),
  progress: integer('progress').notNull().default(0),
  outputPath: text('output_path'),
  outputFileId: uuid('output_file_id').references(() => files.id, { onDelete: 'set null' }),
  errorMessage: text('error_message'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

export type Job = typeof jobs.$inferSelect;
export type NewJob = typeof jobs.$inferInsert;
