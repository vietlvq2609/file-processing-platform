import type { File } from '../domain.js';
import type { ApiListResponse, ApiResponse } from './common.js';

// ─── POST /files/upload-url ──────────────────────────────────────────────────
// Reserves a file record in "pending" status and returns a presigned MinIO
// POST policy the browser uploads directly to, bypassing the API server.

export interface CreateUploadUrlRequest {
  filename: string;
  mimeType: string;
  /** Declared size in bytes. Validated against MAX_FILE_SIZE_BYTES and re-verified on confirm. */
  size: number;
}

export type PresignedUploadFormFields = Record<string, string>;

export interface CreateUploadUrlData {
  fileId: string;
  uploadUrl: string;
  formFields: PresignedUploadFormFields;
  expiresAt: string;
}

export type CreateUploadUrlResponse = ApiResponse<CreateUploadUrlData>;

// ─── POST /files/:id/confirm-upload ──────────────────────────────────────────
// Request: no body — file id comes from the route param.
// Verifies the uploaded object exists in storage before marking the file "ready".

export type ConfirmUploadResponse = ApiResponse<File>;

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
