import { Worker } from 'bullmq';
import { Redis } from 'ioredis';
import { createDb } from '@fpp/db';
import { config } from './config.js';
import { JobRepository } from './repositories/JobRepository.js';
import { defaultProcessor } from './processors/defaultProcessor.js';
import type { JobPayload } from './processors/defaultProcessor.js';

const JOBS_QUEUE_NAME = 'jobs';

const redis = new Redis(config.redis.url, { maxRetriesPerRequest: null });
const db = createDb(config.database.url);
const jobRepo = new JobRepository(db);

const worker = new Worker<JobPayload>(
  JOBS_QUEUE_NAME,
  async (job) => {
    const { type } = job.data;

    // Dispatch to the correct processor by job type.
    // Add more cases here as new job types are introduced.
    switch (type) {
      case 'default':
      default:
        await defaultProcessor(job, jobRepo, redis);
    }
  },
  {
    connection: redis,
    concurrency: 5,
  }
);

worker.on('completed', (job) => {
  console.log(`[worker] Job ${job.id} (${job.data.jobId}) completed`);
});

worker.on('failed', async (job, err) => {
  if (!job) return;
  console.error(`[worker] Job ${job.id} (${job.data.jobId}) failed:`, err.message);
  await jobRepo.updateStatus(job.data.jobId, 'failed', { errorMessage: err.message });
  await redis.publish(`job:failed:${job.data.jobId}`, JSON.stringify({ error: err.message }));
});

export { worker };
