import type { File } from '../domain.js';
import type { ApiListResponse, ApiResponse } from './common.js';

// ─── POST /files (multipart/form-data) ───────────────────────────────────────
// Request: FormData with a "file" field — no TypeScript shape needed.

export type UploadFileResponse = ApiResponse<File>;

// ─── GET /files ──────────────────────────────────────────────────────────────

export interface ListFilesParams {
  page?: number;
  limit?: number;
  /** Case-insensitive substring match on the original filename. */
  search?: string;
}

export type ListFilesResponse = ApiListResponse<File>;

// ─── GET /files/:id ──────────────────────────────────────────────────────────

export type GetFileResponse = ApiResponse<File>;

// ─── DELETE /files/:id ───────────────────────────────────────────────────────
// Responds 204 No Content on success — no response body type needed.

// ─── GET /files/:id/download ─────────────────────────────────────────────────
// Responds with a raw file stream — no JSON response body type needed.
// Available only when the associated job status is "completed".
