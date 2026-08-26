import type { ApiKey } from '../types/domain';
import { apiClient } from './client';

interface ApiKeyListResponse {
  data: ApiKey[];
}

interface ApiKeyCreateResponse {
  data: ApiKey;
  fullKey: string;
}

export async function listApiKeys(): Promise<ApiKey[]> {
  const { data } = await apiClient.get<ApiKeyListResponse>('/api-keys');
  return data.data;
}

export async function createApiKey(): Promise<{ key: ApiKey; fullKey: string }> {
  const { data } = await apiClient.post<ApiKeyCreateResponse>('/api-keys');
  return { key: data.data, fullKey: data.fullKey };
}

export async function revokeApiKey(id: string): Promise<void> {
  await apiClient.delete(`/api-keys/${id}`);
}
