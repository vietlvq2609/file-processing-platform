import { randomUUID } from 'node:crypto';
import { extname } from 'node:path';
import type { Readable } from 'node:stream';

import type { File as DbFile } from '@fpp/db';
import type { IFileRepository, ListOptions } from '@fpp/db';
import type { Client as MinioClient } from 'minio';

import { config } from '../config.js';
import { toPublicStorageUrl } from '../storage.js';
import { badRequest, conflict, notFound } from '../utils/errors.js';

export interface CreateUploadUrlInput {
  filename: string;
  mimeType: string;
  size: number;
}

export interface CreateUploadUrlResult {
  fileId: string;
  uploadUrl: string;
  formFields: Record<string, string>;
  expiresAt: string;
}

export interface PaginatedFiles {
  data: DbFile[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export class FileService {
  constructor(
    private readonly repo: IFileRepository,
    private readonly storage: MinioClient
  ) {}

  async createUploadUrl(
    userId: string,
    input: CreateUploadUrlInput
  ): Promise<CreateUploadUrlResult> {
    if (input.size <= 0) {
      throw badRequest('INVALID_FILE_SIZE', 'File size must be greater than 0');
    }
    if (input.size > config.upload.maxFileSizeBytes) {
      throw badRequest(
        'FILE_TOO_LARGE',
        `File exceeds the maximum allowed size of ${config.upload.maxFileSizeBytes} bytes`
      );
    }

    const ext = extname(input.filename);
    const objectKey = `${userId}/${randomUUID()}${ext}`;

    const file = await this.repo.create({
      userId,
      originalName: input.filename,
      mimeType: input.mimeType,
      size: input.size,
      storagePath: objectKey,
      status: 'pending',
    });

    const expiresAt = new Date(Date.now() + config.upload.presignedUrlTtlSeconds * 1000);

    const policy = this.storage.newPostPolicy();
    policy.setBucket(config.minio.bucket);
    policy.setKey(objectKey);
    policy.setExpires(expiresAt);
    policy.setContentLengthRange(input.size, input.size);
    policy.setContentType(input.mimeType);

    const { postURL, formData } = await this.storage.presignedPostPolicy(policy);

    return {
      fileId: file.id,
      uploadUrl: toPublicStorageUrl(postURL),
      formFields: formData,
      expiresAt: expiresAt.toISOString(),
    };
  }

  async confirmUpload(userId: string, fileId: string): Promise<DbFile> {
    const file = await this.repo.findById(userId, fileId);
    if (!file) {
      throw notFound('FILE_NOT_FOUND', 'File not found');
    }
    // Idempotent: a repeat confirmation of an already-ready file is a no-op success.
    if (file.status === 'ready') {
      return file;
    }
    if (file.status !== 'pending') {
      throw conflict('FILE_NOT_PENDING', 'File is not awaiting upload confirmation');
    }

    let stat: { size: number };
    try {
      stat = await this.storage.statObject(config.minio.bucket, file.storagePath);
    } catch {
      throw conflict('UPLOAD_NOT_FOUND', 'No uploaded object was found for this file');
    }

    if (stat.size !== file.size) {
      throw conflict(
        'UPLOAD_SIZE_MISMATCH',
        'Uploaded object size does not match the reserved file size'
      );
    }

    const updated = await this.repo.markReady(userId, fileId);
    if (!updated) {
      throw conflict('FILE_NOT_PENDING', 'File is not awaiting upload confirmation');
    }
    return updated;
  }

  async list(userId: string, opts: ListOptions): Promise<PaginatedFiles> {
    const { data, total } = await this.repo.findAllByUser(userId, opts);
    return {
      data,
      meta: {
        total,
        page: opts.page,
        limit: opts.limit,
        totalPages: Math.ceil(total / opts.limit),
      },
    };
  }

  async findById(userId: string, fileId: string): Promise<DbFile> {
    const file = await this.repo.findById(userId, fileId);
    if (!file || file.status === 'deleted') {
      throw notFound('FILE_NOT_FOUND', 'File not found');
    }
    return file;
  }

  async delete(userId: string, fileId: string): Promise<void> {
    const file = await this.repo.findById(userId, fileId);
    if (!file) {
      throw notFound('FILE_NOT_FOUND', 'File not found');
    }
    if (file.status === 'deleted') {
      throw conflict('FILE_ALREADY_DELETED', 'File is already deleted');
    }
    await this.repo.softDelete(userId, fileId);
  }

  async getDownloadStream(
    userId: string,
    fileId: string
  ): Promise<{ stream: Readable; file: DbFile }> {
    const file = await this.findById(userId, fileId);
    const stream = await this.storage.getObject(config.minio.bucket, file.storagePath);
    return { stream, file };
  }
}
