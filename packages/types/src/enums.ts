/**
 * FileStatus represents the lifecycle of an uploaded file.
 *
 * State machine:
 *   pending → ready
 *           → deleted
 */
export type FileStatus = 'pending' | 'ready' | 'deleted';

/**
 * JobStatus represents the lifecycle of a processing job.
 *
 * State machine:
 *   pending → active → completed
 *                    → failed → (retry) → active
 */
export type JobStatus = 'pending' | 'active' | 'completed' | 'failed';

/**
 * JobType identifies the kind of processing to apply to a file.
 * Typed as a string so new job types can be added without breaking the package.
 */
export type JobType = string;

/** Runtime-safe constant bag for FileStatus values. */
export const FILE_STATUS = {
  PENDING: 'pending',
  READY: 'ready',
  DELETED: 'deleted',
} as const satisfies Record<string, FileStatus>;

/** Runtime-safe constant bag for JobStatus values. */
export const JOB_STATUS = {
  PENDING: 'pending',
  ACTIVE: 'active',
  COMPLETED: 'completed',
  FAILED: 'failed',
} as const satisfies Record<string, JobStatus>;
