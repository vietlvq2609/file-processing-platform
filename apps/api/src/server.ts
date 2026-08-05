import './types/index.js';

import cookie from '@fastify/cookie';
import cors from '@fastify/cors';
import multipart from '@fastify/multipart';
import websocket from '@fastify/websocket';
import { createDb, FileRepository, JobRepository, UserRepository } from '@fpp/db';
import Fastify from 'fastify';

import { config } from './config.js';
import { registerErrorHandler } from './middleware/errorHandler.js';
import { createJobQueue } from './queue/jobQueue.js';
import { authRoutes } from './routes/auth/index.js';
import { fileRoutes } from './routes/files/index.js';
import { jobRoutes } from './routes/jobs/index.js';
import { wsRoutes } from './routes/ws/index.js';
import { AuthService } from './services/AuthService.js';
import { FileService } from './services/FileService.js';
import { JobService } from './services/JobService.js';
import { minioClient } from './storage.js';
import { startRedisSubscriber } from './ws/redisSubscriber.js';
import { WsManager } from './ws/WsManager.js';

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
    methods: ['GET', 'HEAD', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  });

  // @fastify/cookie must be registered before any route that reads/sets cookies.
  app.register(cookie);
  app.register(websocket);

  app.register(multipart, {
    limits: {
      fileSize: config.upload.maxFileSizeBytes,
      files: 1,
    },
  });

  // ── Dependency composition ─────────────────────────────────────────────────
  const db = createDb(config.database.url);
  const jobQueue = createJobQueue(config.redis.url);
  const wsManager = new WsManager();

  const userRepository = new UserRepository(db);
  const authService = new AuthService(userRepository, {
    accessSecret: config.jwt.accessSecret,
    refreshSecret: config.jwt.refreshSecret,
    accessTtlSeconds: config.jwt.accessTtlSeconds,
    refreshTtlSeconds: config.jwt.refreshTtlSeconds,
    bcryptRounds: config.auth.bcryptRounds,
  });

  const fileRepository = new FileRepository(db);
  const fileService = new FileService(fileRepository, minioClient);

  const jobRepository = new JobRepository(db);
  const jobService = new JobService(jobRepository, fileRepository, jobQueue);

  // ── Routes ─────────────────────────────────────────────────────────────────
  app.register(authRoutes(authService), { prefix: '/api/auth' });
  app.register(fileRoutes(fileService), { prefix: '/api/files' });
  app.register(jobRoutes(jobService), { prefix: '/api/jobs' });
  app.register(wsRoutes(wsManager, config.jwt.accessSecret), { prefix: '/ws' });

  // Start Redis Pub/Sub listener for job progress events
  startRedisSubscriber(config.redis.url, wsManager).catch((err) =>
    app.log.error({ err }, 'Redis subscriber failed to start')
  );

  // ── Error handler ──────────────────────────────────────────────────────────
  registerErrorHandler(app);

  return app;
}
