import { Queue } from 'bullmq';
import { Redis } from 'ioredis';

export const JOBS_QUEUE_NAME = 'jobs';

export function createJobQueue(redisUrl: string): Queue {
  const connection = new Redis(redisUrl, { maxRetriesPerRequest: null });
  return new Queue(JOBS_QUEUE_NAME, {
    connection,
    defaultJobOptions: {
      attempts: 3,
      backoff: { type: 'exponential', delay: 2000 },
      removeOnComplete: { count: 500 },
      removeOnFail: { count: 200 },
    },
  });
}
