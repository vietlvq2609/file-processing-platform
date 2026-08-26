import type { IFileRepository, IJobRepository, Job as DbJob, ListJobOptions } from '@fpp/db';
import type { Queue } from 'bullmq';

import { badRequest, forbidden, notFound } from '../utils/errors.js';

export interface PaginatedJobs {
  data: DbJob[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export class JobService {
  constructor(
    private readonly jobRepo: IJobRepository,
    private readonly fileRepo: IFileRepository,
    private readonly queue: Queue
  ) {}

  async create(
    userId: string,
    fileId: string,
    type = 'default',
    options?: { quality?: number }
  ): Promise<DbJob> {
    // Ensure the file belongs to this user and is not deleted
    const file = await this.fileRepo.findById(userId, fileId);
    if (!file || file.status === 'deleted') {
      throw notFound('FILE_NOT_FOUND', 'File not found');
    }

    const job = await this.jobRepo.create({ userId, fileId, type, status: 'pending', progress: 0 });

    // Enqueue to BullMQ — the Worker will pick this up asynchronously.
    await this.queue.add('process', { jobId: job.id, fileId, type, userId, options });

    return job;
  }

  async list(userId: string, opts: ListJobOptions): Promise<PaginatedJobs> {
    const { data, total } = await this.jobRepo.findAllByUser(userId, opts);
    return {
      data,
      meta: {
        total,
        page: opts.page,
        limit: opts.limit,
        totalPages: Math.ceil(total / opts.limit),
      },
    };
  }

  async findById(userId: string, jobId: string): Promise<DbJob> {
    const job = await this.jobRepo.findById(userId, jobId);
    if (!job) {
      throw notFound('JOB_NOT_FOUND', 'Job not found');
    }
    return job;
  }

  async cancel(userId: string, jobId: string): Promise<void> {
    const job = await this.jobRepo.findById(userId, jobId);
    if (!job) {
      throw notFound('JOB_NOT_FOUND', 'Job not found');
    }
    if (job.userId !== userId) {
      throw forbidden('FORBIDDEN', 'You do not have access to this job');
    }
    if (job.status !== 'pending') {
      throw badRequest('JOB_NOT_CANCELLABLE', 'Only pending jobs can be cancelled');
    }
    await this.jobRepo.cancel(userId, jobId);
  }
}
