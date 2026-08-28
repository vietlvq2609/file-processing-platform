import { Readable } from 'node:stream';

import type { IFileRepository, IJobRepository } from '@fpp/db';
import type { JobPayload } from '@fpp/types';
import type { Job as BullJob } from 'bullmq';
import type { Redis } from 'ioredis';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { CompressProcessor } from './CompressProcessor.js';

const { mockGetObject, mockPutObject, mockSharp, mockJpeg, mockPng, mockWebp } = vi.hoisted(() => {
  const mockToBuffer = vi.fn().mockResolvedValue(Buffer.from('compressed-output'));
  return {
    mockGetObject: vi.fn(),
    mockPutObject: vi.fn(),
    mockJpeg: vi.fn().mockReturnValue({ toBuffer: mockToBuffer }),
    mockPng: vi.fn().mockReturnValue({ toBuffer: mockToBuffer }),
    mockWebp: vi.fn().mockReturnValue({ toBuffer: mockToBuffer }),
    mockSharp: vi.fn(),
  };
});

vi.mock('../storage.js', () => ({
  minioClient: { getObject: mockGetObject, putObject: mockPutObject },
}));

vi.mock('../config.js', () => ({
  config: { minio: { bucket: 'test-bucket' } },
}));

vi.mock('sharp', () => ({ default: mockSharp }));

const mockInputFile = {
  id: 'file-1',
  userId: 'user-1',
  originalName: 'photo.jpg',
  mimeType: 'image/jpeg',
  size: 1000,
  storagePath: 'uploads/user-1/photo.jpg',
  status: 'ready' as const,
  createdAt: new Date(),
  updatedAt: new Date(),
};

const mockOutputFile = {
  ...mockInputFile,
  id: 'output-file-1',
  storagePath: 'processed/user-1/job-1/photo.jpg',
  size: 500,
};

function makeDeps(overrides?: { findById?: unknown }) {
  const updateStatus = vi.fn().mockResolvedValue(null);
  const updateProgress = vi.fn().mockResolvedValue(undefined);
  const jobRepo = { updateStatus, updateProgress } as unknown as IJobRepository;

  const findById = vi
    .fn()
    .mockResolvedValue(
      overrides !== undefined && 'findById' in overrides ? overrides.findById : mockInputFile
    );
  const create = vi.fn().mockResolvedValue(mockOutputFile);
  const fileRepo = { findById, create } as unknown as IFileRepository;

  const publish = vi.fn().mockResolvedValue(0);
  const redis = { publish } as unknown as Redis;

  const updateBullProgress = vi.fn().mockResolvedValue(undefined);
  const bullJob = {
    data: {
      jobId: 'job-1',
      fileId: 'file-1',
      type: 'compress',
      userId: 'user-1',
      options: { quality: 60 },
    } satisfies JobPayload,
    updateProgress: updateBullProgress,
  } as unknown as BullJob<JobPayload>;

  return { jobRepo, fileRepo, redis, bullJob, findById, create, updateStatus, publish };
}

describe('CompressProcessor', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSharp.mockReturnValue({ jpeg: mockJpeg, png: mockPng, webp: mockWebp });
    mockGetObject.mockResolvedValue(Readable.from([Buffer.from('raw-image-data')]));
    mockPutObject.mockResolvedValue(undefined);
  });

  it('downloads input, compresses with sharp, uploads output, creates file record, completes job', async () => {
    const { jobRepo, fileRepo, redis, bullJob, findById, create, updateStatus, publish } =
      makeDeps();
    await new CompressProcessor().process(bullJob, jobRepo, fileRepo, redis);

    expect(findById).toHaveBeenCalledWith('user-1', 'file-1');
    expect(mockGetObject).toHaveBeenCalledWith('test-bucket', 'uploads/user-1/photo.jpg');
    // JPEG path used for image/jpeg
    expect(mockJpeg).toHaveBeenCalledWith({ quality: 60 });
    expect(mockPutObject).toHaveBeenCalledWith(
      'test-bucket',
      'processed/user-1/job-1/photo.jpg',
      expect.any(Buffer),
      expect.any(Number),
      { 'Content-Type': 'image/jpeg' }
    );
    expect(create).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: 'user-1',
        originalName: 'photo.jpg',
        mimeType: 'image/jpeg',
        storagePath: 'processed/user-1/job-1/photo.jpg',
        status: 'ready',
      })
    );
    expect(updateStatus).toHaveBeenLastCalledWith('job-1', 'completed', {
      progress: 100,
      outputFileId: 'output-file-1',
    });
    expect(publish).toHaveBeenCalledWith(
      'job:completed:job-1',
      JSON.stringify({ outputFileId: 'output-file-1' })
    );
  });

  it('uses png() for image/png mime type', async () => {
    const { jobRepo, fileRepo, redis, bullJob } = makeDeps({
      findById: { ...mockInputFile, mimeType: 'image/png' },
    });
    await new CompressProcessor().process(bullJob, jobRepo, fileRepo, redis);
    expect(mockPng).toHaveBeenCalledWith({ quality: 60 });
  });

  it('uses webp() for image/webp mime type', async () => {
    const { jobRepo, fileRepo, redis, bullJob } = makeDeps({
      findById: { ...mockInputFile, mimeType: 'image/webp' },
    });
    await new CompressProcessor().process(bullJob, jobRepo, fileRepo, redis);
    expect(mockWebp).toHaveBeenCalledWith({ quality: 60 });
  });

  it('throws if input file is not found', async () => {
    const { jobRepo, fileRepo, redis, bullJob } = makeDeps({ findById: null });
    await expect(
      new CompressProcessor().process(bullJob, jobRepo, fileRepo, redis)
    ).rejects.toThrow('Input file not found: file-1');
  });

  it('publishes progress events at 0%, 33%, and 66% then job:completed', async () => {
    const { jobRepo, fileRepo, redis, bullJob, publish } = makeDeps();
    await new CompressProcessor().process(bullJob, jobRepo, fileRepo, redis);

    const channels = publish.mock.calls.map((c) => c[0] as string);
    expect(channels.filter((ch) => ch === 'job:progress:job-1')).toHaveLength(3);
    expect(channels).toContain('job:completed:job-1');
  });
});
