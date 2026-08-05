import type { FileStatus, JobStatus } from './enums.js';

/**
 * Payload enqueued to the BullMQ jobs queue by the API and consumed by the worker.
 */
export interface JobPayload {
  jobId: string;
  fileId: string;
  type: string;
  userId: string;
}

/**
 * Public representation of a user account.
 * The password hash is never included in API responses.
 */
export interface User {
  id: string;
  email: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Public representation of an uploaded file.
 * The internal storagePath is intentionally excluded from this type —
 * it is an implementation detail that must never be sent to clients.
 */
export interface File {
  id: string;
  userId: string;
  originalName: string;
  mimeType: string;
  /** File size in bytes. */
  size: number;
  status: FileStatus;
  createdAt: string;
  updatedAt: string;
}

/**
 * Public representation of a processing job.
 * Progress is an integer from 0 to 100.
 * outputPath and errorMessage are null until the job reaches a terminal state.
 */
export interface Job {
  id: string;
  fileId: string;
  userId: string;
  /** The processing type applied to the file (e.g. "default", "resize", "compress"). */
  type: string;
  status: JobStatus;
  /** Processing progress 0–100. Updated at intervals while status is "active". */
  progress: number;
  /** Storage key for the processed output file. Non-null when status is "completed". */
  outputPath: string | null;
  /** Human-readable error description. Non-null when status is "failed". */
  errorMessage: string | null;
  createdAt: string;
  updatedAt: string;
}
