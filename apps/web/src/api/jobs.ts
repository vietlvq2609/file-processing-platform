import type { ApiListResponse, ApiSingleResponse } from '../types/api';
import type { Job } from '../types/domain';
import { apiClient } from './client';

export interface ListJobsParams {
  page?: number;
  limit?: number;
  status?: string;
  fileId?: string;
}

export async function createJob(
  fileId: string,
  type = 'default',
  options?: { quality?: number }
): Promise<Job> {
  const { data } = await apiClient.post<ApiSingleResponse<Job>>('/jobs', { fileId, type, options });
  return data.data;
}

export async function listJobs(params?: ListJobsParams): Promise<ApiListResponse<Job>> {
  const { data } = await apiClient.get<ApiListResponse<Job>>('/jobs', { params });
  return data;
}

export async function getJob(id: string): Promise<Job> {
  const { data } = await apiClient.get<ApiSingleResponse<Job>>(`/jobs/${id}`);
  return data.data;
}

export async function cancelJob(id: string): Promise<void> {
  await apiClient.delete(`/jobs/${id}`);
}
