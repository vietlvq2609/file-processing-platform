import 'dotenv/config';
import { z } from 'zod';

const EnvSchema = z.object({
  // ── Runtime ────────────────────────────────────────────────────────────────
  NODE_ENV: z.enum(['local', 'development', 'staging', 'production']).default('local'),
  PORT: z.coerce.number().int().min(1).max(65535).default(3000),
  HOST: z.string().default('0.0.0.0'),

  // ── Database ───────────────────────────────────────────────────────────────
  // Required — no fallback. The app must not start without a real DB connection.
  DATABASE_URL: z.string().url(),

  // ── CORS ──────────────────────────────────────────────────────────────────
  CORS_ORIGIN: z.string().default('http://localhost:5173'),

  // ── JWT secrets — required, no fallback (security critical) ───────────────
  JWT_ACCESS_SECRET: z.string().min(32),
  JWT_REFRESH_SECRET: z.string().min(32),
  JWT_ACCESS_TTL_SECONDS: z.coerce.number().int().positive().default(900), // 15 min
  JWT_REFRESH_TTL_SECONDS: z.coerce.number().int().positive().default(604800), // 7 days

  // ── Auth ──────────────────────────────────────────────────────────────────
  BCRYPT_ROUNDS: z.coerce.number().int().min(10).max(14).default(12),

  // ── File storage ──────────────────────────────────────────────────────────
  STORAGE_PATH: z.string().min(1).default('./uploads'),
  MAX_FILE_SIZE_BYTES: z.coerce.number().int().positive().default(50 * 1024 * 1024), // 50 MB
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
  server: {
    port: env.PORT,
    host: env.HOST,
  },
  database: {
    url: env.DATABASE_URL,
  },
  cors: {
    origin: env.CORS_ORIGIN,
  },
  jwt: {
    accessSecret: env.JWT_ACCESS_SECRET,
    refreshSecret: env.JWT_REFRESH_SECRET,
    accessTtlSeconds: env.JWT_ACCESS_TTL_SECONDS,
    refreshTtlSeconds: env.JWT_REFRESH_TTL_SECONDS,
  },
  auth: {
    bcryptRounds: env.BCRYPT_ROUNDS,
  },
  upload: {
    storagePath: env.STORAGE_PATH,
    maxFileSizeBytes: env.MAX_FILE_SIZE_BYTES,
  },
} as const;
