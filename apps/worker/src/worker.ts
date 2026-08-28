import { createDb, FileRepository, JobRepository } from '@fpp/db';
import { Worker } from 'bullmq';
import { Redis } from 'ioredis';

import { config } from './config.js';
import { logger } from './logger.js';
import { compressProcessor } from './processors/CompressProcessor.js';
import { convertProcessor } from './processors/ConvertProcessor.js';
import type { JobPayload } from './processors/defaultProcessor.js';
import { defaultProcessor } from './processors/defaultProcessor.js';

const JOBS_QUEUE_NAME = 'jobs';

const redis = new Redis(config.redis.url, { maxRetriesPerRequest: null });
const db = createDb(config.database.url);
const jobRepo = new JobRepository(db);
const fileRepo = new FileRepository(db);

const worker = new Worker<JobPayload>(
  JOBS_QUEUE_NAME,
  async (job) => {
    const { type } = job.data;

    // Dispatch to the correct processor by job type.
    // Add more cases here as new job types are introduced.
    switch (type) {
      case 'compress':
        await compressProcessor.process(job, jobRepo, fileRepo, redis);
        break;
      case 'jpeg':
      case 'png':
      case 'webp':
        await convertProcessor.process(job, jobRepo, fileRepo, redis);
        break;
      case 'default':
      default:
        await defaultProcessor.process(job, jobRepo, fileRepo, redis);
    }
  },
  {
    connection: redis,
    concurrency: 5,
  }
);

worker.on('completed', (job) => {
  logger.info({ jobId: job.data.jobId, bullId: job.id }, 'Job completed');
});

worker.on('failed', (job, err) => {
  if (!job) return;
  logger.error({ jobId: job.data.jobId, bullId: job.id, err: err.message }, 'Job failed');
  void jobRepo
    .updateStatus(job.data.jobId, 'failed', { errorMessage: err.message })
    .then(() =>
      redis.publish(`job:failed:${job.data.jobId}`, JSON.stringify({ error: err.message }))
    )
    .catch((updateErr: unknown) => {
      logger.error({ err: updateErr }, 'Failed to update job status after failure');
    });
});

export { worker };
