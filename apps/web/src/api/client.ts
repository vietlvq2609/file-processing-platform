import axios, { type AxiosRequestConfig, type InternalAxiosRequestConfig } from 'axios';

import { useAuthStore } from '../stores/authStore';

export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ?? '/api',
  withCredentials: true,
});

// Inject access token on every request.
apiClient.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = useAuthStore.getState().accessToken;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Attempt a silent token refresh when the server responds with 401.
let refreshPromise: Promise<string> | null = null;

apiClient.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config as AxiosRequestConfig & { _retry?: boolean };
    const isRefreshEndpoint = (original.url ?? '').includes('/auth/refresh');
    if (error.response?.status === 401 && !original._retry && !isRefreshEndpoint) {
      original._retry = true;
      try {
        if (!refreshPromise) {
          refreshPromise = apiClient
            .post<{ accessToken: string }>('/auth/refresh')
            .then((r) => r.data.accessToken)
            .finally(() => {
              refreshPromise = null;
            });
        }
        const newToken = await refreshPromise;
        useAuthStore.getState().setAccessToken(newToken);
        (original.headers as Record<string, string>).Authorization = `Bearer ${newToken}`;
        return apiClient(original);
      } catch {
        // clearAuth sets accessToken to null; ProtectedRoute reactively redirects to /login.
        useAuthStore.getState().clearAuth();
      }
    }
    return Promise.reject(error);
  }
);
