import { eq, and, ilike, count, desc, ne } from 'drizzle-orm';
import { files } from '@fpp/db';
import type { DrizzleClient, File as DbFile, NewFile } from '@fpp/db';

export interface ListOptions {
  page: number;
  limit: number;
  search?: string;
}

export class FileRepository {
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
}
