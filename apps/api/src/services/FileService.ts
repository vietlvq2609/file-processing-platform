import { extname } from 'node:path';
import { randomUUID } from 'node:crypto';
import type { Readable } from 'node:stream';
import type { Client as MinioClient } from 'minio';
import type { MultipartFile } from '@fastify/multipart';
import type { File as DbFile } from '@fpp/db';
import type { FileRepository, ListOptions } from '../repositories/FileRepository.js';
import { notFound, conflict } from '../utils/errors.js';
import { config } from '../config.js';

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
    private readonly repo: FileRepository,
    private readonly storage: MinioClient,
  ) {}

  async upload(userId: string, multipart: MultipartFile): Promise<DbFile> {
    const ext = extname(multipart.filename);
    const objectKey = `${userId}/${randomUUID()}${ext}`;

    await this.storage.putObject(config.minio.bucket, objectKey, multipart.file);
    const { size } = await this.storage.statObject(config.minio.bucket, objectKey);

    return this.repo.create({
      userId,
      originalName: multipart.filename,
      mimeType: multipart.mimetype,
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
