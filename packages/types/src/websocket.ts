import type { JobStatus } from './enums.js';

// ─── Client → Server messages ─────────────────────────────────────────────────

/** Subscribe to progress events for a specific job. */
export interface WsSubscribeMessage {
  type: 'subscribe';
  jobId: string;
}

/** Stop receiving progress events for a specific job. */
export interface WsUnsubscribeMessage {
  type: 'unsubscribe';
  jobId: string;
}

/** Union of all messages the client may send to the server. */
export type WsClientMessage = WsSubscribeMessage | WsUnsubscribeMessage;

// ─── Server → Client events ───────────────────────────────────────────────────

/**
 * Emitted by the server whenever the Worker publishes a progress update via Redis.
 * Received while job status is "active".
 */
export interface WsJobProgressEvent {
  type: 'job:progress';
  jobId: string;
  /** Processing progress 0–100. */
  progress: number;
  status: JobStatus;
}

/**
 * Emitted once when the Worker marks a job as completed.
 * The client should use outputFileId to construct a download URL.
 */
export interface WsJobCompletedEvent {
  type: 'job:completed';
  jobId: string;
  /** The ID of the processed output file. Use GET /files/:id/download to fetch it. */
  outputFileId: string;
}

/**
 * Emitted once when the Worker marks a job as failed after exhausting retries.
 */
export interface WsJobFailedEvent {
  type: 'job:failed';
  jobId: string;
  /** Human-readable description of the failure reason. */
  error: string;
}

/** Union of all events the server may push to the client. */
export type WsServerEvent = WsJobProgressEvent | WsJobCompletedEvent | WsJobFailedEvent;
