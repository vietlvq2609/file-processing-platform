import { createWriteStream, createReadStream } from 'node:fs';
import { mkdir, stat } from 'node:fs/promises';
import { join, extname } from 'node:path';
import { randomUUID } from 'node:crypto';
import { pipeline } from 'node:stream/promises';
import type { ReadStream } from 'node:fs';
import type { MultipartFile } from '@fastify/multipart';
import type { File as DbFile } from '@fpp/db';
import type { FileRepository, ListOptions } from '../repositories/FileRepository.js';
import { notFound, conflict } from '../utils/errors.js';

const STORAGE_PATH = process.env.STORAGE_PATH ?? './uploads';

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
  constructor(private readonly repo: FileRepository) {}

  async upload(userId: string, multipart: MultipartFile): Promise<DbFile> {
    const userDir = join(STORAGE_PATH, userId);
    await mkdir(userDir, { recursive: true });

    const ext = extname(multipart.filename);
    const storageName = `${randomUUID()}${ext}`;
    const storagePath = join(userDir, storageName);

    // Stream directly to disk — no buffering in memory
    await pipeline(multipart.file, createWriteStream(storagePath));

    // Read actual size after the write (more reliable than stream.bytesRead)
    const { size } = await stat(storagePath);

    return this.repo.create({
      userId,
      originalName: multipart.filename,
      mimeType: multipart.mimetype,
      size,
      storagePath,
      status: 'ready', // No processing yet — mark ready immediately
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
    fileId: string,
  ): Promise<{ stream: ReadStream; file: DbFile }> {
    const file = await this.findById(userId, fileId);
    const stream = createReadStream(file.storagePath);
    return { stream, file };
  }
}
