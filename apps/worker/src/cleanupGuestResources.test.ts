import type { IFileRepository } from '@fpp/db';
import type { Client as MinioClient } from 'minio';
import type { Logger } from 'pino';
import { describe, expect, it, vi } from 'vitest';

import { cleanupGuestResources } from './cleanupGuestResources.js';

const silentLogger = { info: vi.fn(), warn: vi.fn(), error: vi.fn() } as unknown as Logger;

describe('cleanupGuestResources', () => {
  it('removes the storage object and hard-deletes each expired guest file', async () => {
    const expired = [
      {
        id: 'file-1',
        userId: 'guest-1',
        storagePath: 'guest-1/file-1.jpg',
        status: 'ready',
      },
    ];
    const findExpiredGuestFiles = vi.fn().mockResolvedValue(expired);
    const hardDelete = vi.fn().mockResolvedValue(undefined);
    const fileRepo = { findExpiredGuestFiles, hardDelete } as unknown as IFileRepository;

    const removeObject = vi.fn().mockResolvedValue(undefined);
    const storage = { removeObject } as unknown as MinioClient;

    const count = await cleanupGuestResources(fileRepo, storage, 'bucket', 3600, silentLogger);

    expect(count).toBe(1);
    expect(removeObject).toHaveBeenCalledWith('bucket', 'guest-1/file-1.jpg');
    expect(hardDelete).toHaveBeenCalledWith('guest-1', 'file-1');
  });

  it('still hard-deletes the file when the storage object is already gone', async () => {
    const expired = [
      { id: 'file-2', userId: 'guest-2', storagePath: 'guest-2/file-2.jpg', status: 'ready' },
    ];
    const findExpiredGuestFiles = vi.fn().mockResolvedValue(expired);
    const hardDelete = vi.fn().mockResolvedValue(undefined);
    const fileRepo = { findExpiredGuestFiles, hardDelete } as unknown as IFileRepository;

    const removeObject = vi.fn().mockRejectedValue(new Error('NoSuchKey'));
    const storage = { removeObject } as unknown as MinioClient;

    const count = await cleanupGuestResources(fileRepo, storage, 'bucket', 3600, silentLogger);

    expect(count).toBe(1);
    expect(hardDelete).toHaveBeenCalledWith('guest-2', 'file-2');
  });

  it('does nothing when there are no expired guest files', async () => {
    const findExpiredGuestFiles = vi.fn().mockResolvedValue([]);
    const hardDelete = vi.fn();
    const fileRepo = { findExpiredGuestFiles, hardDelete } as unknown as IFileRepository;
    const removeObject = vi.fn();
    const storage = { removeObject } as unknown as MinioClient;

    const count = await cleanupGuestResources(fileRepo, storage, 'bucket', 3600, silentLogger);

    expect(count).toBe(0);
    expect(removeObject).not.toHaveBeenCalled();
    expect(hardDelete).not.toHaveBeenCalled();
  });
});
