import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

interface GuestState {
  guestToken: string | null;
  setGuestToken: (token: string) => void;
  clearGuest: () => void;
}

export const useGuestStore = create<GuestState>()(
  persist(
    (set) => ({
      guestToken: null,
      setGuestToken: (token) => set({ guestToken: token }),
      clearGuest: () => set({ guestToken: null }),
    }),
    {
      name: 'guest-session',
      storage: createJSONStorage(() => sessionStorage), // cleared on tab close
    }
  )
);
