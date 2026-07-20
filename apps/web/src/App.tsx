import { useEffect, useState } from 'react';
import { RouterProvider } from 'react-router-dom';
import { router } from './router';
import { refreshAccessToken, getMe } from './api/auth';
import { useAuthStore } from './stores/authStore';

export default function App() {
  const [ready, setReady] = useState(false);
  const setAuth = useAuthStore((s) => s.setAuth);

  useEffect(() => {
    // Attempt to restore session using the httpOnly refresh token cookie.
    refreshAccessToken()
      .then(async (token) => {
        const user = await getMe();
        setAuth(token, user);
      })
      .catch(() => {
        // No valid session — user will be prompted to log in.
      })
      .finally(() => setReady(true));
  }, [setAuth]);

  if (!ready) return null;

  return <RouterProvider router={router} />;
}
