import type { File as DbFile, IFileRepository, ListOptions, NewFile } from '@fpp/db';

export class InMemoryFileRepository implements IFileRepository {
  private readonly files = new Map<string, DbFile>();

  create(data: NewFile): Promise<DbFile> {
    const file: DbFile = {
      id: data.id ?? crypto.randomUUID(),
      userId: data.userId,
      originalName: data.originalName,
      mimeType: data.mimeType,
      size: data.size,
      storagePath: data.storagePath,
      status: data.status ?? 'pending',
      createdAt: data.createdAt ?? new Date(),
      updatedAt: data.updatedAt ?? new Date(),
    };
    this.files.set(file.id, file);
    return Promise.resolve(file);
  }

  findAllByUser(userId: string, opts: ListOptions): Promise<{ data: DbFile[]; total: number }> {
    const all = Array.from(this.files.values()).filter(
      (f) => f.userId === userId && f.status !== 'deleted'
    );
    const total = all.length;
    const offset = (opts.page - 1) * opts.limit;
    return Promise.resolve({ data: all.slice(offset, offset + opts.limit), total });
  }

  findById(userId: string, fileId: string): Promise<DbFile | null> {
    const file = this.files.get(fileId);
    return Promise.resolve(file?.userId === userId ? file : null);
  }

  softDelete(userId: string, fileId: string): Promise<DbFile | null> {
    const file = this.files.get(fileId);
    if (!file || file.userId !== userId) return Promise.resolve(null);
    const updated: DbFile = { ...file, status: 'deleted', updatedAt: new Date() };
    this.files.set(fileId, updated);
    return Promise.resolve(updated);
  }

  markReady(userId: string, fileId: string): Promise<DbFile | null> {
    const file = this.files.get(fileId);
    if (!file || file.userId !== userId || file.status !== 'pending') return Promise.resolve(null);
    const updated: DbFile = { ...file, status: 'ready', updatedAt: new Date() };
    this.files.set(fileId, updated);
    return Promise.resolve(updated);
  }

  findExpiredPending(before: Date): Promise<DbFile[]> {
    const expired = Array.from(this.files.values()).filter(
      (f) => f.status === 'pending' && f.createdAt < before
    );
    return Promise.resolve(expired);
  }
}
