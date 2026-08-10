import type { Readable } from 'node:stream';

import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('../config.js', () => ({
  config: { minio: { bucket: 'test-bucket' } },
}));

import { InMemoryFileRepository } from '../test/stubs/InMemoryFileRepository.js';
import { FileService } from './FileService.js';

const mockStorage = {
  putObject: vi.fn().mockResolvedValue(undefined),
  statObject: vi.fn().mockResolvedValue({ size: 2048 }),
  getObject: vi.fn(),
};

describe('FileService', () => {
  let repo: InMemoryFileRepository;
  let service: FileService;

  beforeEach(() => {
    repo = new InMemoryFileRepository();
    service = new FileService(repo, mockStorage as never);
    vi.clearAllMocks();
    mockStorage.putObject.mockResolvedValue(undefined);
    mockStorage.statObject.mockResolvedValue({ size: 2048 });
  });

  describe('upload()', () => {
    it('creates a file record with the correct userId and storagePath', async () => {
      const file = await service.upload('user-1', {
        filename: 'photo.jpg',
        mimetype: 'image/jpeg',
        file: {} as Readable,
      });

      expect(file.userId).toBe('user-1');
      expect(file.originalName).toBe('photo.jpg');
      expect(file.storagePath).toContain('user-1');
      expect(file.size).toBe(2048);
      expect(file.status).toBe('ready');
    });
  });

  describe('findById()', () => {
    it('throws NotFoundError when file does not exist', async () => {
      await expect(service.findById('user-1', 'non-existent-id')).rejects.toMatchObject({
        statusCode: 404,
        code: 'FILE_NOT_FOUND',
      });
    });

    it('throws NotFoundError when file belongs to a different user', async () => {
      const ownerFile = await service.upload('owner-user', {
        filename: 'file.pdf',
        mimetype: 'application/pdf',
        file: {} as Readable,
      });

      await expect(service.findById('other-user', ownerFile.id)).rejects.toMatchObject({
        statusCode: 404,
        code: 'FILE_NOT_FOUND',
      });
    });
  });

  describe('delete()', () => {
    it('soft-deletes the file so findById no longer returns it', async () => {
      const file = await service.upload('user-1', {
        filename: 'file.pdf',
        mimetype: 'application/pdf',
        file: {} as Readable,
      });

      await service.delete('user-1', file.id);

      await expect(service.findById('user-1', file.id)).rejects.toMatchObject({
        statusCode: 404,
        code: 'FILE_NOT_FOUND',
      });
    });
  });
});
