import { create } from 'zustand';

export interface PublicUser {
  id: string;
  email: string;
  createdAt: string;
  updatedAt: string;
}

interface AuthState {
  accessToken: string | null;
  user: PublicUser | null;
  setAuth: (token: string, user: PublicUser) => void;
  setAccessToken: (token: string | null) => void;
  clearAuth: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  accessToken: null,
  user: null,
  setAuth: (token, user) => set({ accessToken: token, user }),
  setAccessToken: (token) => set({ accessToken: token }),
  clearAuth: () => set({ accessToken: null, user: null }),
}));
