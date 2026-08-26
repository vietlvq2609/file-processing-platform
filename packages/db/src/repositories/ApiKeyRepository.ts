import { and, eq } from 'drizzle-orm';

import type { DrizzleClient } from '../client.js';
import type { ApiKeyRow } from '../schema/index.js';
import { apiKeys } from '../schema/index.js';

export interface IApiKeyRepository {
  findByUserId(userId: string): Promise<ApiKeyRow[]>;
  countByUserId(userId: string): Promise<number>;
  create(data: {
    userId: string;
    keyHash: string;
    keyPrefix: string;
    lastFour: string;
  }): Promise<ApiKeyRow>;
  deleteById(id: string, userId: string): Promise<boolean>;
}

export class ApiKeyRepository implements IApiKeyRepository {
  constructor(private readonly db: DrizzleClient) {}

  async findByUserId(userId: string): Promise<ApiKeyRow[]> {
    return this.db.select().from(apiKeys).where(eq(apiKeys.userId, userId));
  }

  async countByUserId(userId: string): Promise<number> {
    const rows = await this.db
      .select({ id: apiKeys.id })
      .from(apiKeys)
      .where(eq(apiKeys.userId, userId));
    return rows.length;
  }

  async create(data: {
    userId: string;
    keyHash: string;
    keyPrefix: string;
    lastFour: string;
  }): Promise<ApiKeyRow> {
    const [row] = await this.db.insert(apiKeys).values(data).returning();
    return row;
  }

  async deleteById(id: string, userId: string): Promise<boolean> {
    const deleted = await this.db
      .delete(apiKeys)
      .where(and(eq(apiKeys.id, id), eq(apiKeys.userId, userId)))
      .returning({ id: apiKeys.id });
    return deleted.length > 0;
  }
}
