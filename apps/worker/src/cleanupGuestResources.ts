import type { IFileRepository } from '@fpp/db';
import type { Client as MinioClient } from 'minio';
import type { Logger } from 'pino';

/**
 * Removes "ready" files owned by a guest session (stateless JWT, no persisted user row)
 * once they've sat past the TTL, bounding the storage/DB growth that stateless guest
 * sessions would otherwise cause. Skips any file still referenced by a pending/active
 * job so in-flight processing is never interrupted; jobs referencing a swept file are
 * removed automatically by the `jobs.file_id` cascade.
 */
export async function cleanupGuestResources(
  fileRepo: IFileRepository,
  storage: MinioClient,
  bucket: string,
  ttlSeconds: number,
  logger: Logger
): Promise<number> {
  const cutoff = new Date(Date.now() - ttlSeconds * 1000);
  const expired = await fileRepo.findExpiredGuestFiles(cutoff);

  for (const file of expired) {
    try {
      await storage.removeObject(bucket, file.storagePath);
    } catch (err) {
      // Object may never have existed (e.g. an output file whose bytes were already
      // removed) — not a failure condition.
      logger.warn({ fileId: file.id, err }, 'No storage object to remove for expired guest file');
    }

    await fileRepo.hardDelete(file.userId, file.id);
    logger.info({ fileId: file.id, userId: file.userId }, 'Cleaned up expired guest file');
  }

  return expired.length;
}

export function startGuestResourceCleanup(
  fileRepo: IFileRepository,
  storage: MinioClient,
  bucket: string,
  ttlSeconds: number,
  intervalSeconds: number,
  logger: Logger
): NodeJS.Timeout {
  const run = (): void => {
    cleanupGuestResources(fileRepo, storage, bucket, ttlSeconds, logger).catch((err: unknown) => {
      logger.error({ err }, 'Guest resource cleanup sweep failed');
    });
  };

  run();
  return setInterval(run, intervalSeconds * 1000);
}
