import type { Job } from '../domain.js';
import type { JobStatus } from '../enums.js';
import type { ApiListResponse, ApiResponse } from './common.js';

// ─── POST /jobs ──────────────────────────────────────────────────────────────

export interface CreateJobRequest {
  fileId: string;
  /**
   * The processing type to apply. Defaults to "default" on the server when omitted.
   * Future types: "resize", "compress", "convert", etc.
   */
  type?: string;
}

export type CreateJobResponse = ApiResponse<Job>;

// ─── GET /jobs ───────────────────────────────────────────────────────────────

export interface ListJobsParams {
  /** Filter by job status. */
  status?: JobStatus;
  /** Filter by the source file ID. */
  fileId?: string;
  page?: number;
  limit?: number;
}

export type ListJobsResponse = ApiListResponse<Job>;

// ─── GET /jobs/:id ───────────────────────────────────────────────────────────

export type GetJobResponse = ApiResponse<Job>;

// ─── DELETE /jobs/:id ────────────────────────────────────────────────────────
// Cancel a pending job. Only valid while job status is "pending".
// Responds 204 No Content on success — no response body type needed.
