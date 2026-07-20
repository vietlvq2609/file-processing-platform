import axios from 'axios';

// Temporary dev header — replace with real auth token injection when auth is added
const DEV_USER_ID = '00000000-0000-0000-0000-000000000001';

export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ?? '/api',
  withCredentials: true,
  headers: {
    'X-User-Id': DEV_USER_ID,
  },
});
