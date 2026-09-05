import type { IFileRepository } from '@fpp/db';
import type { Client as MinioClient } from 'minio';
import type { Logger } from 'pino';
import { describe, expect, it, vi } from 'vitest';

import { cleanupPendingUploads } from './cleanupPendingUploads.js';

const silentLogger = { info: vi.fn(), warn: vi.fn(), error: vi.fn() } as unknown as Logger;

describe('cleanupPendingUploads', () => {
  it('removes the storage object and soft-deletes each expired pending file', async () => {
    const expired = [
      {
        id: 'file-1',
        userId: 'user-1',
        storagePath: 'user-1/file-1.jpg',
        status: 'pending',
      },
    ];
    const findExpiredPending = vi.fn().mockResolvedValue(expired);
    const softDelete = vi.fn().mockResolvedValue(null);
    const fileRepo = { findExpiredPending, softDelete } as unknown as IFileRepository;

    const removeObject = vi.fn().mockResolvedValue(undefined);
    const storage = { removeObject } as unknown as MinioClient;

    const count = await cleanupPendingUploads(fileRepo, storage, 'bucket', 3600, silentLogger);

    expect(count).toBe(1);
    expect(removeObject).toHaveBeenCalledWith('bucket', 'user-1/file-1.jpg');
    expect(softDelete).toHaveBeenCalledWith('user-1', 'file-1');
  });

  it('still soft-deletes the file when the storage object is already gone', async () => {
    const expired = [
      { id: 'file-2', userId: 'user-2', storagePath: 'user-2/file-2.jpg', status: 'pending' },
    ];
    const findExpiredPending = vi.fn().mockResolvedValue(expired);
    const softDelete = vi.fn().mockResolvedValue(null);
    const fileRepo = { findExpiredPending, softDelete } as unknown as IFileRepository;

    const removeObject = vi.fn().mockRejectedValue(new Error('NoSuchKey'));
    const storage = { removeObject } as unknown as MinioClient;

    const count = await cleanupPendingUploads(fileRepo, storage, 'bucket', 3600, silentLogger);

    expect(count).toBe(1);
    expect(softDelete).toHaveBeenCalledWith('user-2', 'file-2');
  });

  it('does nothing when there are no expired pending files', async () => {
    const findExpiredPending = vi.fn().mockResolvedValue([]);
    const softDelete = vi.fn();
    const fileRepo = { findExpiredPending, softDelete } as unknown as IFileRepository;
    const removeObject = vi.fn();
    const storage = { removeObject } as unknown as MinioClient;

    const count = await cleanupPendingUploads(fileRepo, storage, 'bucket', 3600, silentLogger);

    expect(count).toBe(0);
    expect(removeObject).not.toHaveBeenCalled();
    expect(softDelete).not.toHaveBeenCalled();
  });
});
