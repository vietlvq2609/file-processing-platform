import type { ApiListResponse, ApiSingleResponse } from '../types/api';
import type { File as AppFile } from '../types/domain';
import { apiClient } from './client';

export interface ListFilesParams {
  page?: number;
  limit?: number;
  search?: string;
}

export async function listFiles(params?: ListFilesParams): Promise<ApiListResponse<AppFile>> {
  const { data } = await apiClient.get<ApiListResponse<AppFile>>('/files', { params });
  return data;
}

export async function getFile(id: string): Promise<AppFile> {
  const { data } = await apiClient.get<ApiSingleResponse<AppFile>>(`/files/${id}`);
  return data.data;
}

export async function uploadFile(
  file: globalThis.File,
  onProgress?: (pct: number) => void
): Promise<AppFile> {
  const form = new FormData();
  form.append('file', file);
  const { data } = await apiClient.post<ApiSingleResponse<AppFile>>('/files', form, {
    headers: { 'Content-Type': 'multipart/form-data' },
    onUploadProgress: (e) => {
      if (onProgress && e.total) onProgress(Math.round((e.loaded / e.total) * 100));
    },
  });
  return data.data;
}

export async function deleteFile(id: string): Promise<void> {
  await apiClient.delete(`/files/${id}`);
}

export function getDownloadUrl(id: string): string {
  return `/api/files/${id}/download`;
}
