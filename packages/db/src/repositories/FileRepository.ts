import { and, count, desc, eq, ilike, inArray, isNull, lt, ne, notExists } from 'drizzle-orm';

import type { DrizzleClient } from '../client.js';
import type { File as DbFile, NewFile } from '../schema/index.js';
import { files, jobs, users } from '../schema/index.js';

export interface ListOptions {
  page: number;
  limit: number;
  search?: string;
}

export interface IFileRepository {
  create(data: NewFile): Promise<DbFile>;
  findAllByUser(userId: string, opts: ListOptions): Promise<{ data: DbFile[]; total: number }>;
  findById(userId: string, fileId: string): Promise<DbFile | null>;
  softDelete(userId: string, fileId: string): Promise<DbFile | null>;
  /** Transitions a file from "pending" to "ready". Returns null if the file isn't pending. */
  markReady(userId: string, fileId: string): Promise<DbFile | null>;
  /** Finds "pending" files reserved before the given cutoff — candidates for cleanup. */
  findExpiredPending(before: Date): Promise<DbFile[]>;
  /**
   * Finds "ready" files owned by a guest (no matching row in `users`, since guest
   * sessions are stateless JWTs) that finished before the given cutoff. Excludes any
   * file still referenced by a pending/active job so in-flight processing is never swept.
   */
  findExpiredGuestFiles(before: Date): Promise<DbFile[]>;
  /** Permanently removes a file row — used by the guest resource cleanup sweep. */
  hardDelete(userId: string, fileId: string): Promise<void>;
}

export class FileRepository implements IFileRepository {
  constructor(private readonly db: DrizzleClient) {}

  async create(data: NewFile): Promise<DbFile> {
    const [file] = await this.db.insert(files).values(data).returning();
    return file;
  }

  async findAllByUser(
    userId: string,
    opts: ListOptions
  ): Promise<{ data: DbFile[]; total: number }> {
    const offset = (opts.page - 1) * opts.limit;

    // Always exclude soft-deleted files
    const conditions: ReturnType<typeof eq>[] = [
      eq(files.userId, userId),
      ne(files.status, 'deleted'),
    ];
    if (opts.search) {
      conditions.push(ilike(files.originalName, `%${opts.search}%`));
    }

    const where = and(...conditions);

    const [rows, [countRow]] = await Promise.all([
      this.db
        .select()
        .from(files)
        .where(where)
        .orderBy(desc(files.createdAt))
        .limit(opts.limit)
        .offset(offset),
      this.db.select({ value: count() }).from(files).where(where),
    ]);

    return { data: rows, total: Number(countRow.value) };
  }

  async findById(userId: string, fileId: string): Promise<DbFile | null> {
    const [file] = await this.db
      .select()
      .from(files)
      .where(and(eq(files.id, fileId), eq(files.userId, userId)))
      .limit(1);
    return file ?? null;
  }

  async softDelete(userId: string, fileId: string): Promise<DbFile | null> {
    const [file] = await this.db
      .update(files)
      .set({ status: 'deleted', updatedAt: new Date() })
      .where(and(eq(files.id, fileId), eq(files.userId, userId)))
      .returning();
    return file ?? null;
  }

  async markReady(userId: string, fileId: string): Promise<DbFile | null> {
    const [file] = await this.db
      .update(files)
      .set({ status: 'ready', updatedAt: new Date() })
      .where(and(eq(files.id, fileId), eq(files.userId, userId), eq(files.status, 'pending')))
      .returning();
    return file ?? null;
  }

  async findExpiredPending(before: Date): Promise<DbFile[]> {
    return this.db
      .select()
      .from(files)
      .where(and(eq(files.status, 'pending'), lt(files.createdAt, before)));
  }

  async findExpiredGuestFiles(before: Date): Promise<DbFile[]> {
    const rows = await this.db
      .select({ file: files })
      .from(files)
      .leftJoin(users, eq(files.userId, users.id))
      .where(
        and(
          isNull(users.id),
          eq(files.status, 'ready'),
          lt(files.updatedAt, before),
          notExists(
            this.db
              .select()
              .from(jobs)
              .where(and(eq(jobs.fileId, files.id), inArray(jobs.status, ['pending', 'active'])))
          )
        )
      );
    return rows.map((row) => row.file);
  }

  async hardDelete(userId: string, fileId: string): Promise<void> {
    await this.db.delete(files).where(and(eq(files.id, fileId), eq(files.userId, userId)));
  }
}
