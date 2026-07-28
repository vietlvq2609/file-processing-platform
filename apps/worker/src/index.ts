import { worker } from './worker.js';

process.on('SIGTERM', async () => {
  console.log('[worker] SIGTERM received, shutting down gracefully...');
  await worker.close();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('[worker] SIGINT received, shutting down gracefully...');
  await worker.close();
  process.exit(0);
});

console.log('[worker] Started and waiting for jobs...');
