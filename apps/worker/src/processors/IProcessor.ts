import type { IFileRepository, IJobRepository } from '@fpp/db';
import type { JobPayload } from '@fpp/types';
import type { Job as BullJob } from 'bullmq';
import type { Redis } from 'ioredis';

export interface IProcessor {
  process(
    job: BullJob<JobPayload>,
    jobRepo: IJobRepository,
    fileRepo: IFileRepository,
    redis: Redis
  ): Promise<void>;
}
