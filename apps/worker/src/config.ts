import { config as loadEnv } from 'dotenv';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import { z } from 'zod';

// Resolve the monorepo root .env regardless of where the process is started.
loadEnv({ path: resolve(dirname(fileURLToPath(import.meta.url)), '../../../.env') });

const EnvSchema = z.object({
  NODE_ENV: z.enum(['local', 'development', 'staging', 'production']).default('local'),
  DATABASE_URL: z.string().url(),
  REDIS_URL: z.string().default('redis://localhost:6379'),
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
} as const;
