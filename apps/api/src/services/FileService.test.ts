import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('../config.js', () => ({
  config: {
    minio: { bucket: 'test-bucket', publicUrl: 'http://localhost:3004' },
    upload: { maxFileSizeBytes: 50 * 1024 * 1024, presignedUrlTtlSeconds: 900 },
  },
}));

// storage.ts eagerly constructs a real MinIO Client from config at import time —
// stub it out so the unit test doesn't need a fully-valid MinIO configuration.
vi.mock('../storage.js', () => ({
  toPublicStorageUrl: (url: string) => url.replace('http://minio:9000', 'http://localhost:3004'),
}));

import { InMemoryFileRepository } from '../test/stubs/InMemoryFileRepository.js';
import { FileService } from './FileService.js';

const mockPolicy = {
  setBucket: vi.fn(),
  setKey: vi.fn(),
  setExpires: vi.fn(),
  setContentLengthRange: vi.fn(),
  setContentType: vi.fn(),
};

const mockStorage = {
  newPostPolicy: vi.fn().mockReturnValue(mockPolicy),
  presignedPostPolicy: vi.fn().mockResolvedValue({
    postURL: 'http://minio:9000/test-bucket',
    formData: { key: 'some-key', policy: 'signed-policy' },
  }),
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
    mockStorage.presignedPostPolicy.mockResolvedValue({
      postURL: 'http://minio:9000/test-bucket',
      formData: { key: 'some-key', policy: 'signed-policy' },
    });
    mockStorage.newPostPolicy.mockReturnValue(mockPolicy);
    mockStorage.statObject.mockResolvedValue({ size: 2048 });
  });

  describe('createUploadUrl()', () => {
    it('creates a pending file record and returns a rewritten public upload URL', async () => {
      const result = await service.createUploadUrl('user-1', {
        filename: 'photo.jpg',
        mimeType: 'image/jpeg',
        size: 2048,
      });

      const file = await repo.findById('user-1', result.fileId);
      expect(file).toMatchObject({
        userId: 'user-1',
        originalName: 'photo.jpg',
        mimeType: 'image/jpeg',
        size: 2048,
        status: 'pending',
      });
      expect(file?.storagePath).toContain('user-1');
      expect(result.uploadUrl).toBe('http://localhost:3004/test-bucket');
      expect(result.formFields).toEqual({ key: 'some-key', policy: 'signed-policy' });
    });

    it('rejects a size of zero or less', async () => {
      await expect(
        service.createUploadUrl('user-1', { filename: 'a.txt', mimeType: 'text/plain', size: 0 })
      ).rejects.toMatchObject({ statusCode: 400, code: 'INVALID_FILE_SIZE' });
    });

    it('rejects a file larger than the configured maximum', async () => {
      await expect(
        service.createUploadUrl('user-1', {
          filename: 'a.txt',
          mimeType: 'text/plain',
          size: 100 * 1024 * 1024,
        })
      ).rejects.toMatchObject({ statusCode: 400, code: 'FILE_TOO_LARGE' });
    });
  });

  describe('confirmUpload()', () => {
    it('marks a pending file ready once the object exists with the expected size', async () => {
      const { fileId } = await service.createUploadUrl('user-1', {
        filename: 'photo.jpg',
        mimeType: 'image/jpeg',
        size: 2048,
      });

      const file = await service.confirmUpload('user-1', fileId);

      expect(file.status).toBe('ready');
    });

    it('is idempotent when the file is already ready', async () => {
      const { fileId } = await service.createUploadUrl('user-1', {
        filename: 'photo.jpg',
        mimeType: 'image/jpeg',
        size: 2048,
      });
      await service.confirmUpload('user-1', fileId);

      const file = await service.confirmUpload('user-1', fileId);

      expect(file.status).toBe('ready');
    });

    it('throws NotFoundError when the file does not exist', async () => {
      await expect(service.confirmUpload('user-1', 'non-existent-id')).rejects.toMatchObject({
        statusCode: 404,
        code: 'FILE_NOT_FOUND',
      });
    });

    it('throws when the uploaded object is missing from storage', async () => {
      mockStorage.statObject.mockRejectedValueOnce(new Error('NotFound'));

      const { fileId } = await service.createUploadUrl('user-1', {
        filename: 'photo.jpg',
        mimeType: 'image/jpeg',
        size: 2048,
      });

      await expect(service.confirmUpload('user-1', fileId)).rejects.toMatchObject({
        statusCode: 409,
        code: 'UPLOAD_NOT_FOUND',
      });
    });

    it('throws when the uploaded object size does not match the reservation', async () => {
      mockStorage.statObject.mockResolvedValueOnce({ size: 999 });

      const { fileId } = await service.createUploadUrl('user-1', {
        filename: 'photo.jpg',
        mimeType: 'image/jpeg',
        size: 2048,
      });

      await expect(service.confirmUpload('user-1', fileId)).rejects.toMatchObject({
        statusCode: 409,
        code: 'UPLOAD_SIZE_MISMATCH',
      });
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
      const { fileId } = await service.createUploadUrl('owner-user', {
        filename: 'file.pdf',
        mimeType: 'application/pdf',
        size: 2048,
      });

      await expect(service.findById('other-user', fileId)).rejects.toMatchObject({
        statusCode: 404,
        code: 'FILE_NOT_FOUND',
      });
    });
  });

  describe('delete()', () => {
    it('soft-deletes the file so findById no longer returns it', async () => {
      const { fileId } = await service.createUploadUrl('user-1', {
        filename: 'file.pdf',
        mimeType: 'application/pdf',
        size: 2048,
      });
      await service.confirmUpload('user-1', fileId);

      await service.delete('user-1', fileId);

      await expect(service.findById('user-1', fileId)).rejects.toMatchObject({
        statusCode: 404,
        code: 'FILE_NOT_FOUND',
      });
    });
  });
});
