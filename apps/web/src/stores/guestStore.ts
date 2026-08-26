import { create } from 'zustand';

interface GuestState {
  guestToken: string | null;
  setGuestToken: (token: string) => void;
  clearGuest: () => void;
}

export const useGuestStore = create<GuestState>((set) => ({
  guestToken: null,
  setGuestToken: (token) => set({ guestToken: token }),
  clearGuest: () => set({ guestToken: null }),
}));
