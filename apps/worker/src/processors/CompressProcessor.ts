import type { IJobRepository } from '@fpp/db';
import type { JobPayload } from '@fpp/types';
import type { Job as BullJob } from 'bullmq';
import type { Redis } from 'ioredis';

import type { IProcessor } from './IProcessor.js';

async function publish(redis: Redis, channel: string, data: object): Promise<void> {
  await redis.publish(channel, JSON.stringify(data));
}

export class CompressProcessor implements IProcessor {
  async process(
    bullJob: BullJob<JobPayload>,
    jobRepo: IJobRepository,
    redis: Redis
  ): Promise<void> {
    const { jobId, fileId } = bullJob.data;

    await jobRepo.updateStatus(jobId, 'active', { progress: 0 });

    const stages = 5;
    for (let i = 1; i <= stages; i++) {
      await new Promise<void>((resolve) => setTimeout(resolve, 500));

      const progress = Math.round((i / stages) * 100);

      await Promise.all([
        bullJob.updateProgress(progress),
        jobRepo.updateProgress(jobId, progress),
        publish(redis, `job:progress:${jobId}`, { progress, status: 'active' }),
      ]);
    }

    const outputPath = `processed/${fileId}/compressed.bin`;

    await jobRepo.updateStatus(jobId, 'completed', { progress: 100, outputPath });
    await publish(redis, `job:completed:${jobId}`, { outputFileId: fileId });
  }
}

export const compressProcessor = new CompressProcessor();
