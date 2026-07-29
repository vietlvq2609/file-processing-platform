import { config as dotenv } from 'dotenv';
import { resolve } from 'path';
import type { Config } from 'drizzle-kit';

// Load DATABASE_URL from the monorepo root .env.
dotenv({ path: resolve(import.meta.dirname, '../../.env') });

export default {
  schema: './src/schema/index.ts',
  out: './drizzle',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
} satisfies Config;
