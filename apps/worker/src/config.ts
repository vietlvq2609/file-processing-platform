import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { config as loadEnv } from 'dotenv';
import { z } from 'zod';

// Resolve the monorepo root .env regardless of where the process is started.
loadEnv({ path: resolve(dirname(fileURLToPath(import.meta.url)), '../../../.env') });

const EnvSchema = z.object({
  NODE_ENV: z.enum(['local', 'development', 'staging', 'production']).default('local'),
  DATABASE_URL: z.string().url(),
  REDIS_URL: z.string().default('redis://localhost:6379'),
  MINIO_ENDPOINT: z.string().default('localhost'),
  MINIO_PORT: z.coerce.number().int().min(1).max(65535).default(9000),
  MINIO_USE_SSL: z
    .string()
    .default('false')
    .transform((v) => v === 'true'),
  MINIO_ACCESS_KEY: z.string().min(1).default('minioadmin'),
  MINIO_SECRET_KEY: z.string().min(1).default('minioadmin'),
  MINIO_BUCKET: z.string().min(1).default('uploads'),
  // How long a file may sit in "pending" (reserved but never uploaded/confirmed)
  // before the cleanup sweep removes it.
  PENDING_UPLOAD_TTL_SECONDS: z.coerce.number().int().positive().default(3600), // 1 hour
  PENDING_UPLOAD_CLEANUP_INTERVAL_SECONDS: z.coerce.number().int().positive().default(900), // 15 min
});

function parseConfig() {
  const result = EnvSchema.safeParse(process.env);
  if (!result.success) {
    const formatted = result.error.issues
      .map((issue) => `  • ${issue.path.join('.')}: ${issue.message}`)
      .join('\n');
    throw new Error(`Invalid environment configuration:\n${formatted}`);
  }
  return result.data;
}

const env = parseConfig();

export const config = {
  env: env.NODE_ENV,
  isProduction: env.NODE_ENV === 'production',
  database: {
    url: env.DATABASE_URL,
  },
  redis: {
    url: env.REDIS_URL,
  },
  minio: {
    endPoint: env.MINIO_ENDPOINT,
    port: env.MINIO_PORT,
    useSSL: env.MINIO_USE_SSL,
    accessKey: env.MINIO_ACCESS_KEY,
    secretKey: env.MINIO_SECRET_KEY,
    bucket: env.MINIO_BUCKET,
  },
  pendingUpload: {
    ttlSeconds: env.PENDING_UPLOAD_TTL_SECONDS,
    cleanupIntervalSeconds: env.PENDING_UPLOAD_CLEANUP_INTERVAL_SECONDS,
  },
} as const;
