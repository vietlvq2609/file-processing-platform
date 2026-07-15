import { drizzle } from 'drizzle-orm/postgres-js';
import { sql } from 'drizzle-orm';
import postgres from 'postgres';
import * as schema from './schema/index.js';

export type DrizzleClient = ReturnType<typeof createDb>;

export function createDb(connectionString: string) {
  const pg = postgres(connectionString, { max: 10 });
  return drizzle(pg, { schema });
}

export async function ping(db: DrizzleClient): Promise<void> {
  await db.execute(sql`SELECT 1`);
}
