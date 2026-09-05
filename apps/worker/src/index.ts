import { logger } from './logger.js';
import { pendingUploadCleanupHandle, worker } from './worker.js';

const shutdown = async (signal: string): Promise<void> => {
  logger.info(`${signal} received, shutting down gracefully...`);
  clearInterval(pendingUploadCleanupHandle);
  await worker.close();
  process.exit(0);
};

process.on('SIGTERM', () => {
  void shutdown('SIGTERM');
});
process.on('SIGINT', () => {
  void shutdown('SIGINT');
});

logger.info('Started and waiting for jobs...');
