import Fastify from 'fastify';
import multipart from '@fastify/multipart';
import { createDb } from '@fpp/db';
import { FileRepository } from './repositories/FileRepository.js';
import { FileService } from './services/FileService.js';
import { fileRoutes } from './routes/files/index.js';
import { registerErrorHandler } from './middleware/errorHandler.js';
import './types/index.js';

const DATABASE_URL =
  process.env.DATABASE_URL ??
  'postgresql://postgres:postgres@localhost:5432/file-processing-platform-db';

export function buildApp() {
  const app = Fastify({
    logger: {
      transport:
        process.env.NODE_ENV !== 'production'
          ? { target: 'pino-pretty' }
          : undefined,
    },
  });

  // ── Plugins ────────────────────────────────────────────────────────────────
  app.register(multipart, {
    limits: {
      fileSize: 50 * 1024 * 1024, // 50 MB per file
      files: 1,                   // one file per request
    },
  });

  // ── Dependency composition ─────────────────────────────────────────────────
  // The db client is created once and shared across all repositories.
  const db = createDb(DATABASE_URL);
  const fileRepository = new FileRepository(db);
  const fileService = new FileService(fileRepository);

  // ── Routes ─────────────────────────────────────────────────────────────────
  app.register(fileRoutes(fileService), { prefix: '/files' });

  // ── Error handler ──────────────────────────────────────────────────────────
  registerErrorHandler(app);

  return app;
}
