import { fileURLToPath } from 'node:url';
import { dirname } from 'node:path';
import { config as dotenv } from 'dotenv';
import { resolve } from 'path';
import type { Config } from 'drizzle-kit';

// Fallback for import.meta.dirname support in drizzle-kit
const __dirname = import.meta.dirname ?? dirname(fileURLToPath(import.meta.url));

// Load DATABASE_URL from the monorepo root .env.
dotenv({ path: resolve(__dirname, '../../.env') });

export default {
  schema: './src/schema/index.ts',
  out: './drizzle',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
} satisfies Config;
