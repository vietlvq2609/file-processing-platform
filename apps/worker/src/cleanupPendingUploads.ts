import type { IFileRepository } from '@fpp/db';
import type { Client as MinioClient } from 'minio';
import type { Logger } from 'pino';

/**
 * Removes files stuck in "pending" status past the TTL — abandoned or failed
 * presigned uploads that never reached POST /files/:id/confirm-upload.
 * Best-effort deletes the underlying MinIO object (if it exists) before
 * soft-deleting the DB record, so retries can't leave the record behind.
 */
export async function cleanupPendingUploads(
  fileRepo: IFileRepository,
  storage: MinioClient,
  bucket: string,
  ttlSeconds: number,
  logger: Logger
): Promise<number> {
  const cutoff = new Date(Date.now() - ttlSeconds * 1000);
  const expired = await fileRepo.findExpiredPending(cutoff);

  for (const file of expired) {
    try {
      await storage.removeObject(bucket, file.storagePath);
    } catch (err) {
      // Object may never have been uploaded — not a failure condition.
      logger.warn({ fileId: file.id, err }, 'No storage object to remove for expired pending file');
    }

    await fileRepo.softDelete(file.userId, file.id);
    logger.info({ fileId: file.id, userId: file.userId }, 'Cleaned up abandoned pending upload');
  }

  return expired.length;
}

export function startPendingUploadCleanup(
  fileRepo: IFileRepository,
  storage: MinioClient,
  bucket: string,
  ttlSeconds: number,
  intervalSeconds: number,
  logger: Logger
): NodeJS.Timeout {
  const run = (): void => {
    cleanupPendingUploads(fileRepo, storage, bucket, ttlSeconds, logger).catch((err: unknown) => {
      logger.error({ err }, 'Pending upload cleanup sweep failed');
    });
  };

  run();
  return setInterval(run, intervalSeconds * 1000);
}
