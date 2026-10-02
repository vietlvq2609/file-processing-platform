import './types/index.js';

import cookie from '@fastify/cookie';
import cors from '@fastify/cors';
import rateLimit from '@fastify/rate-limit';
import swagger from '@fastify/swagger';
import swaggerUi from '@fastify/swagger-ui';
import websocket from '@fastify/websocket';
import { ApiKeyRepository, createDb, FileRepository, JobRepository, UserRepository } from '@fpp/db';
import Fastify from 'fastify';
import { Redis } from 'ioredis';

import { config } from './config.js';
import { registerErrorHandler } from './middleware/errorHandler.js';
import { createJobQueue } from './queue/jobQueue.js';
import { apiKeyRoutes } from './routes/apiKeys/index.js';
import { authRoutes } from './routes/auth/index.js';
import { fileRoutes } from './routes/files/index.js';
import { jobRoutes } from './routes/jobs/index.js';
import { wsRoutes } from './routes/ws/index.js';
import { ApiKeyService } from './services/ApiKeyService.js';
import { AuthService } from './services/AuthService.js';
import { FileService } from './services/FileService.js';
import { JobService } from './services/JobService.js';
import { minioClient } from './storage.js';
import { tooManyRequests } from './utils/errors.js';
import { startRedisSubscriber } from './ws/redisSubscriber.js';
import { WsManager } from './ws/WsManager.js';

export async function buildApp() {
  const app = Fastify({
    logger: {
      transport: !config.isProduction ? { target: 'pino-pretty' } : undefined,
    },
    // Trust exactly one hop (nginx, which is the sole ingress in production) so
    // rate-limiting keys on the real client IP from X-Forwarded-For rather than nginx's.
    trustProxy: 1,
  });

  // ── Plugins ────────────────────────────────────────────────────────────────
  await app.register(cors, {
    origin: config.cors.origin,
    credentials: true,
    methods: ['GET', 'HEAD', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  });

  // @fastify/cookie must be registered before any route that reads/sets cookies.
  await app.register(cookie);
  await app.register(websocket);
  await app.register(swagger, {
    openapi: {
      info: {
        title: 'File Processing Platform API',
        version: '1.0.0',
        description:
          'API for file uploads, job processing, and authentication for the File Processing Platform.',
      },
      servers: [{ url: '/', description: 'Current host' }],
      tags: [
        { name: 'Auth', description: 'Authentication and token refresh' },
        { name: 'Files', description: 'File metadata and upload APIs' },
        { name: 'Jobs', description: 'Job status and processing APIs' },
        { name: 'API Keys', description: 'API key management' },
      ],
    },
  });
  await app.register(swaggerUi, {
    routePrefix: '/api/docs',
    uiConfig: {
      docExpansion: 'list',
      deepLinking: false,
    },
    staticCSP: true,
  });

  // global: false — only routes that opt in via `config: { rateLimit: {...} }` are limited.
  // Redis-backed so limits survive restarts and are shared if the API ever scales out.
  await app.register(rateLimit, {
    global: false,
    redis: new Redis(config.redis.url, { maxRetriesPerRequest: null }),
    errorResponseBuilder: (_request, context) => {
      const err = tooManyRequests(
        'TOO_MANY_REQUESTS',
        `Rate limit exceeded, retry in ${context.after}`
      );
      return { error: { code: err.code, message: err.message } };
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

  const apiKeyRepository = new ApiKeyRepository(db);
  const apiKeyService = new ApiKeyService(apiKeyRepository);

  const fileRepository = new FileRepository(db);
  const fileService = new FileService(fileRepository, minioClient);

  const jobRepository = new JobRepository(db);
  const jobService = new JobService(jobRepository, fileRepository, jobQueue);

  // ── Routes ─────────────────────────────────────────────────────────────────
  app.get('/healthz', () => ({ status: 'ok' }));

  app.register(authRoutes(authService), { prefix: '/api/auth' });
  app.register(apiKeyRoutes(apiKeyService), { prefix: '/api/api-keys' });
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
