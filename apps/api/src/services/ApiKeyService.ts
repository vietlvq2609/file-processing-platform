import { createHash, randomBytes } from 'node:crypto';

import type { IApiKeyRepository } from '@fpp/db';
import type { ApiKey } from '@fpp/types';

import { conflict, notFound } from '../utils/errors.js';

const MAX_KEYS_PER_USER = 5;
const KEY_PREFIX = 'sk-';

function generateRawKey(): string {
  return KEY_PREFIX + randomBytes(24).toString('hex');
}

function hashKey(key: string): string {
  return createHash('sha256').update(key).digest('hex');
}

function toApiKey(row: {
  id: string;
  userId: string;
  keyPrefix: string;
  lastFour: string;
  createdAt: Date;
}): ApiKey {
  return {
    id: row.id,
    userId: row.userId,
    keyPrefix: row.keyPrefix,
    lastFour: row.lastFour,
    createdAt: row.createdAt.toISOString(),
  };
}

export class ApiKeyService {
  constructor(private readonly repo: IApiKeyRepository) {}

  async listKeys(userId: string): Promise<ApiKey[]> {
    const rows = await this.repo.findByUserId(userId);
    return rows.map(toApiKey);
  }

  async createKey(userId: string): Promise<{ key: ApiKey; fullKey: string }> {
    const count = await this.repo.countByUserId(userId);
    if (count >= MAX_KEYS_PER_USER) {
      throw conflict(
        'API_KEY_LIMIT_REACHED',
        `Maximum of ${MAX_KEYS_PER_USER} API keys allowed per user`
      );
    }

    const rawKey = generateRawKey();
    const row = await this.repo.create({
      userId,
      keyHash: hashKey(rawKey),
      keyPrefix: KEY_PREFIX,
      lastFour: rawKey.slice(-4),
    });

    return { key: toApiKey(row), fullKey: rawKey };
  }

  async revokeKey(userId: string, keyId: string): Promise<void> {
    const deleted = await this.repo.deleteById(keyId, userId);
    if (!deleted) {
      throw notFound('API_KEY_NOT_FOUND', 'API key not found');
    }
  }
}
