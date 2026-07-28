import { eq, and, count, desc, inArray } from 'drizzle-orm';
import { jobs } from '@fpp/db';
import type { DrizzleClient, Job as DbJob, NewJob } from '@fpp/db';
import type { JobStatus } from '@fpp/types';

export interface ListJobOptions {
  page: number;
  limit: number;
  status?: JobStatus;
  fileId?: string;
}

export class JobRepository {
  constructor(private readonly db: DrizzleClient) {}

  async create(data: NewJob): Promise<DbJob> {
    const [job] = await this.db.insert(jobs).values(data).returning();
    return job;
  }

  async findAllByUser(
    userId: string,
    opts: ListJobOptions
  ): Promise<{ data: DbJob[]; total: number }> {
    const offset = (opts.page - 1) * opts.limit;

    const conditions: ReturnType<typeof eq>[] = [eq(jobs.userId, userId)];
    if (opts.status) {
      conditions.push(eq(jobs.status, opts.status));
    }
    if (opts.fileId) {
      conditions.push(eq(jobs.fileId, opts.fileId));
    }

    const where = and(...conditions);

    const [rows, [countRow]] = await Promise.all([
      this.db
        .select()
        .from(jobs)
        .where(where)
        .orderBy(desc(jobs.createdAt))
        .limit(opts.limit)
        .offset(offset),
      this.db.select({ value: count() }).from(jobs).where(where),
    ]);

    return { data: rows, total: Number(countRow.value) };
  }

  async findById(userId: string, jobId: string): Promise<DbJob | null> {
    const [job] = await this.db
      .select()
      .from(jobs)
      .where(and(eq(jobs.id, jobId), eq(jobs.userId, userId)))
      .limit(1);
    return job ?? null;
  }

  async updateStatus(
    jobId: string,
    status: JobStatus,
    extra?: { errorMessage?: string; outputPath?: string; progress?: number }
  ): Promise<DbJob | null> {
    const [job] = await this.db
      .update(jobs)
      .set({ status, updatedAt: new Date(), ...extra })
      .where(eq(jobs.id, jobId))
      .returning();
    return job ?? null;
  }

  async cancel(userId: string, jobId: string): Promise<DbJob | null> {
    const [job] = await this.db
      .update(jobs)
      .set({ status: 'failed', updatedAt: new Date(), errorMessage: 'Cancelled by user' })
      .where(
        and(
          eq(jobs.id, jobId),
          eq(jobs.userId, userId),
          // Only pending jobs can be cancelled — enforce at the DB layer too
          inArray(jobs.status, ['pending'])
        )
      )
      .returning();
    return job ?? null;
  }
}
