import type { IJobRepository } from '@fpp/db';
import type { JobPayload } from '@fpp/types';
import type { Job as BullJob } from 'bullmq';
import type { Redis } from 'ioredis';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { DefaultProcessor } from './defaultProcessor.js';

describe('DefaultProcessor', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('transitions status active→completed, calls updateProgress and redis.publish', async () => {
    const updateStatus = vi.fn().mockResolvedValue(null);
    const updateProgress = vi.fn().mockResolvedValue(undefined);
    const jobRepo = { updateStatus, updateProgress } as unknown as IJobRepository;

    const publish = vi.fn().mockResolvedValue(0);
    const redis = { publish } as unknown as Redis;

    const updateBullProgress = vi.fn().mockResolvedValue(undefined);
    const bullJob = {
      data: {
        jobId: 'job-1',
        fileId: 'file-1',
        type: 'default',
        userId: 'user-1',
      } satisfies JobPayload,
      updateProgress: updateBullProgress,
    } as unknown as BullJob<JobPayload>;

    const processor = new DefaultProcessor();
    const processPromise = processor.process(bullJob, jobRepo, redis);

    await vi.runAllTimersAsync();
    await processPromise;

    expect(updateStatus).toHaveBeenCalledWith('job-1', 'active', { progress: 0 });
    expect(updateStatus).toHaveBeenCalledWith(
      'job-1',
      'completed',
      expect.objectContaining({ progress: 100 })
    );

    // 5 progress stages
    expect(updateProgress).toHaveBeenCalledTimes(5);
    expect(updateBullProgress).toHaveBeenCalledTimes(5);

    // 5 job:progress publishes + 1 job:completed publish
    expect(publish).toHaveBeenCalledTimes(6);
    expect(publish).toHaveBeenLastCalledWith(`job:completed:job-1`, expect.any(String));
  });
});
