import { useMutation } from '@tanstack/react-query';
import { useEffect } from 'react';

import { createGuestSession } from '../../../api/guest';
import { useGuestStore } from '../../../stores/guestStore';

export function useGuestJob() {
  const { guestToken, setGuestToken } = useGuestStore();

  const mutation = useMutation({
    mutationFn: createGuestSession,
    onSuccess: ({ accessToken }) => {
      setGuestToken(accessToken);
    },
  });

  useEffect(() => {
    if (!guestToken && !mutation.isPending) {
      mutation.mutate();
    }
    // Only run on mount — token persists for the page lifecycle.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {
    isSupported: true as const,
    isReady: guestToken !== null,
  };
}
