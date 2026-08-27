import { useMutation } from '@tanstack/react-query';
import { useEffect } from 'react';

import { createGuestSession } from '../../../api/guest';
import { useGuestStore } from '../../../stores/guestStore';

/** Returns true if the JWT is missing or within 60 s of expiry. */
function isTokenExpiredOrMissing(token: string | null): boolean {
  if (!token) return true;
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return (payload.exp as number) * 1000 < Date.now() + 60_000;
  } catch {
    return true;
  }
}

export function useGuestJob() {
  const { guestToken, setGuestToken, clearGuest } = useGuestStore();

  const mutation = useMutation({
    mutationFn: createGuestSession,
    onSuccess: ({ accessToken }) => {
      setGuestToken(accessToken);
    },
  });

  useEffect(() => {
    if (isTokenExpiredOrMissing(guestToken)) {
      clearGuest();
      mutation.mutate();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {
    isSupported: true as const,
    isReady: guestToken !== null,
  };
}
