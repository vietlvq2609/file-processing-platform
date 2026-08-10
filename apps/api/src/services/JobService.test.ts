import { beforeEach, describe, expect, it, vi } from 'vitest';

import { buildFile } from '../test/factories.js';
import { InMemoryFileRepository } from '../test/stubs/InMemoryFileRepository.js';
import { InMemoryJobRepository } from '../test/stubs/InMemoryJobRepository.js';
import { JobService } from './JobService.js';

describe('JobService', () => {
  let jobRepo: InMemoryJobRepository;
  let fileRepo: InMemoryFileRepository;
  let mockQueue: { add: ReturnType<typeof vi.fn> };
  let service: JobService;

  beforeEach(() => {
    jobRepo = new InMemoryJobRepository();
    fileRepo = new InMemoryFileRepository();
    mockQueue = { add: vi.fn().mockResolvedValue(undefined) };
    service = new JobService(jobRepo, fileRepo, mockQueue as never);
  });

  describe('create()', () => {
    it('creates a job record and enqueues it to BullMQ', async () => {
      const file = buildFile({ userId: 'user-1', status: 'ready' });
      await fileRepo.create(file);

      const job = await service.create('user-1', file.id);

      expect(job.userId).toBe('user-1');
      expect(job.fileId).toBe(file.id);
      expect(job.status).toBe('pending');
      expect(mockQueue.add).toHaveBeenCalledWith(
        'process',
        expect.objectContaining({ jobId: job.id, fileId: file.id, userId: 'user-1' })
      );
    });

    it('throws NotFoundError when file does not exist', async () => {
      await expect(service.create('user-1', 'non-existent-file-id')).rejects.toMatchObject({
        statusCode: 404,
        code: 'FILE_NOT_FOUND',
      });
    });
  });

  describe('cancel()', () => {
    it('cancels a pending job', async () => {
      const file = buildFile({ userId: 'user-1', status: 'ready' });
      await fileRepo.create(file);
      const job = await service.create('user-1', file.id);

      await service.cancel('user-1', job.id);

      const updated = await jobRepo.findById('user-1', job.id);
      expect(updated?.status).toBe('failed');
    });

    it('throws BadRequestError when job is not in pending state', async () => {
      const file = buildFile({ userId: 'user-1', status: 'ready' });
      await fileRepo.create(file);
      const job = await service.create('user-1', file.id);
      await jobRepo.updateStatus(job.id, 'active');

      await expect(service.cancel('user-1', job.id)).rejects.toMatchObject({
        statusCode: 400,
        code: 'JOB_NOT_CANCELLABLE',
      });
    });
  });
});
