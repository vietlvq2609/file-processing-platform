import { eq } from 'drizzle-orm';
import { jobs } from '@fpp/db';
import type { DrizzleClient, Job as DbJob } from '@fpp/db';
import type { JobStatus } from '@fpp/types';

export class JobRepository {
  constructor(private readonly db: DrizzleClient) {}

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

  async updateProgress(jobId: string, progress: number): Promise<void> {
    await this.db
      .update(jobs)
      .set({ progress, updatedAt: new Date() })
      .where(eq(jobs.id, jobId));
  }
}
