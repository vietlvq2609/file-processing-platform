import { Queue } from 'bullmq';
import { Redis } from 'ioredis';

import { config } from '../config.js';

export const JOBS_QUEUE_NAME = 'jobs';

// Shared Redis connection for BullMQ (maxRetriesPerRequest must be null for BullMQ)
export const redisConnection = new Redis(config.redis.url, {
  maxRetriesPerRequest: null,
});

export const jobQueue = new Queue(JOBS_QUEUE_NAME, {
  connection: redisConnection,
  defaultJobOptions: {
    attempts: 3,
    backoff: { type: 'exponential', delay: 2000 },
    removeOnComplete: { count: 500 },
    removeOnFail: { count: 200 },
  },
});
