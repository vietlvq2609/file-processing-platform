import { config as dotenv } from 'dotenv';
import { resolve } from 'path';
import type { Config } from 'drizzle-kit';

// Load from the API's .env so DATABASE_URL only needs to be defined in one place.
dotenv({ path: resolve(import.meta.dirname, '../../apps/api/.env') });

export default {
  schema: './src/schema/index.ts',
  out: './drizzle',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
} satisfies Config;
