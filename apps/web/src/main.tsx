import React from 'react';
import ReactDOM from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import App from './App';
import { refreshAccessToken, getMe } from './api/auth';
import { useAuthStore } from './stores/authStore';

const queryClient = new QueryClient();

async function bootstrap() {
  try {
    const token = await refreshAccessToken();
    useAuthStore.getState().setAccessToken(token);
    const user = await getMe();
    useAuthStore.getState().setAuth(token, user);
  } catch {
    // No valid session — user will be prompted to log in.
  }
}

bootstrap().then(() => {
  ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
      <QueryClientProvider client={queryClient}>
        <App />
      </QueryClientProvider>
    </React.StrictMode>
  );
});
