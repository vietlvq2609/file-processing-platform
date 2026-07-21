import Fastify from 'fastify';
import multipart from '@fastify/multipart';
import cors from '@fastify/cors';
import cookie from '@fastify/cookie';
import { createDb } from '@fpp/db';
import { config } from './config.js';
import { FileRepository } from './repositories/FileRepository.js';
import { FileService } from './services/FileService.js';
import { UserRepository } from './repositories/UserRepository.js';
import { AuthService } from './services/AuthService.js';
import { fileRoutes } from './routes/files/index.js';
import { authRoutes } from './routes/auth/index.js';
import { registerErrorHandler } from './middleware/errorHandler.js';
import './types/index.js';

export function buildApp() {
  const app = Fastify({
    logger: {
      transport: !config.isProduction ? { target: 'pino-pretty' } : undefined,
    },
  });

  // ── Plugins ────────────────────────────────────────────────────────────────
  app.register(cors, {
    origin: config.cors.origin,
    credentials: true,
  });

  // @fastify/cookie must be registered before any route that reads/sets cookies.
  app.register(cookie);

  app.register(multipart, {
    limits: {
      fileSize: config.upload.maxFileSizeBytes,
      files: 1,
    },
  });

  // ── Dependency composition ─────────────────────────────────────────────────
  // The db client is created once and shared across all repositories.
  const db = createDb(config.database.url);

  const userRepository = new UserRepository(db);
  const authService = new AuthService(userRepository);

  const fileRepository = new FileRepository(db);
  const fileService = new FileService(fileRepository);

  // ── Routes ─────────────────────────────────────────────────────────────────
  app.register(authRoutes(authService), { prefix: '/api/auth' });
  app.register(fileRoutes(fileService), { prefix: '/api/files' });

  // ── Error handler ──────────────────────────────────────────────────────────
  registerErrorHandler(app);

  return app;
}
