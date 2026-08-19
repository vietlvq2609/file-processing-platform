import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { drizzle } from 'drizzle-orm/postgres-js';
import { migrate } from 'drizzle-orm/postgres-js/migrator';
import postgres from 'postgres';

if (!process.env.DATABASE_URL) {
  process.stderr.write('DATABASE_URL environment variable is required\n');
  process.exit(1);
}

const __dirname = dirname(fileURLToPath(import.meta.url));
// In the compiled output, __dirname is packages/db/dist/ so ../drizzle resolves correctly.
const migrationsFolder = resolve(__dirname, '../drizzle');

const sql = postgres(process.env.DATABASE_URL, { max: 1 });
const db = drizzle(sql);

await migrate(db, { migrationsFolder });
process.stdout.write('Migrations applied successfully\n');
await sql.end();
