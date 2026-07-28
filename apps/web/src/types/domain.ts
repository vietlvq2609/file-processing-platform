export type FileStatus = 'pending' | 'ready' | 'deleted';
export type JobStatus = 'pending' | 'active' | 'completed' | 'failed';

export interface File {
  id: string;
  userId: string;
  originalName: string;
  mimeType: string;
  size: number;
  storagePath: string;
  status: FileStatus;
  createdAt: string;
  updatedAt: string;
}

export interface Job {
  id: string;
  fileId: string;
  userId: string;
  type: string;
  status: JobStatus;
  progress: number;
  outputPath: string | null;
  errorMessage: string | null;
  createdAt: string;
  updatedAt: string;
}
