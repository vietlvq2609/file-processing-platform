import axios from 'axios';

import type { ApiListResponse, ApiSingleResponse } from '../types/api';
import type { File as AppFile } from '../types/domain';
import { apiClient } from './client';

export interface ListFilesParams {
  page?: number;
  limit?: number;
  search?: string;
}

export interface CreateUploadUrlParams {
  filename: string;
  mimeType: string;
  size: number;
}

export interface CreateUploadUrlResult {
  fileId: string;
  uploadUrl: string;
  formFields: Record<string, string>;
  expiresAt: string;
}

// Dedicated client for direct-to-storage uploads: no auth interceptor and no
// credentials, since the presigned URL itself authorizes the request and the
// target origin is MinIO, not the API server.
const storageUploadClient = axios.create();

export async function listFiles(params?: ListFilesParams): Promise<ApiListResponse<AppFile>> {
  const { data } = await apiClient.get<ApiListResponse<AppFile>>('/files', { params });
  return data;
}

export async function getFile(id: string): Promise<AppFile> {
  const { data } = await apiClient.get<ApiSingleResponse<AppFile>>(`/files/${id}`);
  return data.data;
}

export async function requestUploadUrl(
  params: CreateUploadUrlParams
): Promise<CreateUploadUrlResult> {
  const { data } = await apiClient.post<ApiSingleResponse<CreateUploadUrlResult>>(
    '/files/upload-url',
    params
  );
  return data.data;
}

export async function confirmUpload(fileId: string): Promise<AppFile> {
  const { data } = await apiClient.post<ApiSingleResponse<AppFile>>(
    `/files/${fileId}/confirm-upload`
  );
  return data.data;
}

export async function uploadFile(
  file: globalThis.File,
  onProgress?: (pct: number) => void
): Promise<AppFile> {
  const { fileId, uploadUrl, formFields } = await requestUploadUrl({
    filename: file.name,
    mimeType: file.type || 'application/octet-stream',
    size: file.size,
  });

  const form = new FormData();
  Object.entries(formFields).forEach(([key, value]) => form.append(key, value));
  // The "file" field must be appended last — required by MinIO's POST policy.
  form.append('file', file);

  await storageUploadClient.post(uploadUrl, form, {
    onUploadProgress: (e) => {
      if (onProgress && e.total) onProgress(Math.round((e.loaded / e.total) * 100));
    },
  });

  return confirmUpload(fileId);
}

export async function deleteFile(id: string): Promise<void> {
  await apiClient.delete(`/files/${id}`);
}

export async function downloadFile(id: string): Promise<Blob> {
  const response = await apiClient.get(`/files/${id}/download`, {
    responseType: 'blob',
  });
  return response.data;
}
