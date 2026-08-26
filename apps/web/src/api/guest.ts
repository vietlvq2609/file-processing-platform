import axios from 'axios';

// Separate axios instance — must not read from authStore or guestStore.
const unauthClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ?? '/api',
});

export async function createGuestSession(): Promise<{ accessToken: string }> {
  const res = await unauthClient.post<{ data: { accessToken: string } }>('/auth/guest');
  return res.data.data;
}
