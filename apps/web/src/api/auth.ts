import type { PublicUser } from '../stores/authStore';
import { apiClient } from './client';

interface AuthResponse {
  data: PublicUser;
  accessToken: string;
}

export async function login(email: string, password: string): Promise<AuthResponse> {
  const { data } = await apiClient.post<AuthResponse>('/auth/login', { email, password });
  return data;
}

export async function register(email: string, password: string): Promise<AuthResponse> {
  const { data } = await apiClient.post<AuthResponse>('/auth/register', { email, password });
  return data;
}

export async function logout(): Promise<void> {
  await apiClient.post('/auth/logout');
}

export async function refreshAccessToken(): Promise<string> {
  const { data } = await apiClient.post<{ accessToken: string }>('/auth/refresh');
  return data.accessToken;
}

export async function getMe(): Promise<PublicUser> {
  const { data } = await apiClient.get<{ data: PublicUser }>('/auth/me');
  return data.data;
}
