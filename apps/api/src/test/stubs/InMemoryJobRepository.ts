import type { IJobRepository, Job as DbJob, ListJobOptions, NewJob } from '@fpp/db';
import type { JobStatus } from '@fpp/types';

export class InMemoryJobRepository implements IJobRepository {
  private readonly jobs = new Map<string, DbJob>();

  create(data: NewJob): Promise<DbJob> {
    const job: DbJob = {
      id: data.id ?? crypto.randomUUID(),
      fileId: data.fileId,
      userId: data.userId,
      type: data.type ?? 'default',
      status: data.status ?? 'pending',
      progress: data.progress ?? 0,
      outputPath: data.outputPath ?? null,
      errorMessage: data.errorMessage ?? null,
      createdAt: data.createdAt ?? new Date(),
      updatedAt: data.updatedAt ?? new Date(),
    };
    this.jobs.set(job.id, job);
    return Promise.resolve(job);
  }

  findAllByUser(userId: string, opts: ListJobOptions): Promise<{ data: DbJob[]; total: number }> {
    let all = Array.from(this.jobs.values()).filter((j) => j.userId === userId);
    if (opts.status) all = all.filter((j) => j.status === opts.status);
    if (opts.fileId) all = all.filter((j) => j.fileId === opts.fileId);
    const total = all.length;
    const offset = (opts.page - 1) * opts.limit;
    return Promise.resolve({ data: all.slice(offset, offset + opts.limit), total });
  }

  findById(userId: string, jobId: string): Promise<DbJob | null> {
    const job = this.jobs.get(jobId);
    return Promise.resolve(job?.userId === userId ? job : null);
  }

  updateStatus(
    jobId: string,
    status: JobStatus,
    extra?: { errorMessage?: string; outputPath?: string; progress?: number }
  ): Promise<DbJob | null> {
    const job = this.jobs.get(jobId);
    if (!job) return Promise.resolve(null);
    const updated = { ...job, status, updatedAt: new Date(), ...extra };
    this.jobs.set(jobId, updated);
    return Promise.resolve(updated);
  }

  cancel(userId: string, jobId: string): Promise<DbJob | null> {
    const job = this.jobs.get(jobId);
    if (!job || job.userId !== userId) return Promise.resolve(null);
    const updated: DbJob = {
      ...job,
      status: 'failed',
      errorMessage: 'Cancelled by user',
      updatedAt: new Date(),
    };
    this.jobs.set(jobId, updated);
    return Promise.resolve(updated);
  }

  updateProgress(jobId: string, progress: number): Promise<void> {
    const job = this.jobs.get(jobId);
    if (job) {
      this.jobs.set(jobId, { ...job, progress, updatedAt: new Date() });
    }
    return Promise.resolve();
  }
}
