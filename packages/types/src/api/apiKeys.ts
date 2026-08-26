import type { ApiKey } from '../domain.js';

// ─── GET /api-keys ────────────────────────────────────────────────────────────

export interface ListApiKeysResponse {
  data: ApiKey[];
}

// ─── POST /api-keys ───────────────────────────────────────────────────────────

export interface CreateApiKeyResponse {
  data: ApiKey;
  /** Full plaintext key — returned only once on creation. */
  fullKey: string;
}

// ─── DELETE /api-keys/:id ─────────────────────────────────────────────────────
// No request body. No meaningful response body — server responds 204.
