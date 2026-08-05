import { randomUUID } from 'node:crypto';
import { extname } from 'node:path';
import type { Readable } from 'node:stream';

import type { File as DbFile } from '@fpp/db';
import type { IFileRepository, ListOptions } from '@fpp/db';
import type { Client as MinioClient } from 'minio';

import { config } from '../config.js';
import { conflict, notFound } from '../utils/errors.js';

export interface UploadInput {
  filename: string;
  mimetype: string;
  file: Readable;
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

  async upload(userId: string, input: UploadInput): Promise<DbFile> {
    const ext = extname(input.filename);
    const objectKey = `${userId}/${randomUUID()}${ext}`;

    await this.storage.putObject(config.minio.bucket, objectKey, input.file);
    const { size } = await this.storage.statObject(config.minio.bucket, objectKey);

    return this.repo.create({
      userId,
      originalName: input.filename,
      mimeType: input.mimetype,
      size,
      storagePath: objectKey,
      status: 'ready',
    });
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
