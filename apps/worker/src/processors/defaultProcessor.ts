import type { IFileRepository, IJobRepository } from '@fpp/db';
import type { JobPayload } from '@fpp/types';
import type { Job as BullJob } from 'bullmq';
import type { Redis } from 'ioredis';

import type { IProcessor } from './IProcessor.js';

export type { JobPayload };

/**
 * Publishes a structured event to the Redis Pub/Sub channel for a job.
 * The API's Redis subscriber picks this up and forwards it to WebSocket clients.
 */
async function publish(redis: Redis, channel: string, data: object): Promise<void> {
  await redis.publish(channel, JSON.stringify(data));
}

/**
 * Default processor — simulates file processing with staged progress updates.
 * Replace the setTimeout-based simulation with real work (e.g. ffmpeg, sharp).
 */
export class DefaultProcessor implements IProcessor {
  async process(
    bullJob: BullJob<JobPayload>,
    jobRepo: IJobRepository,
    _fileRepo: IFileRepository,
    redis: Redis
  ): Promise<void> {
    const { jobId, fileId } = bullJob.data;

    // Mark as active
    await jobRepo.updateStatus(jobId, 'active', { progress: 0 });

    // Simulate staged processing (5 stages × 20%)
    const stages = 5;
    for (let i = 1; i <= stages; i++) {
      // Simulate work for this stage
      await new Promise<void>((resolve) => setTimeout(resolve, 500));

      const progress = Math.round((i / stages) * 100);

      await Promise.all([
        bullJob.updateProgress(progress),
        jobRepo.updateProgress(jobId, progress),
        publish(redis, `job:progress:${jobId}`, { progress, status: 'active' }),
      ]);
    }

    // Simulate a stored output path (real implementation would write a file here)
    const outputPath = `processed/${fileId}/output.txt`;

    await jobRepo.updateStatus(jobId, 'completed', { progress: 100, outputPath });
    await publish(redis, `job:completed:${jobId}`, { outputFileId: fileId });
  }
}

/** Singleton instance for use in the worker dispatch. */
export const defaultProcessor = new DefaultProcessor();
