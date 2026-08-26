import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import tailwindcss from '@tailwindcss/vite';

// In Docker dev the Vite server runs inside a container and proxies to the api
// service by name. Locally it falls back to localhost.
const API_TARGET = process.env.API_PROXY_TARGET ?? 'http://localhost:3001'
const WEB_PORT = parseInt(process.env.WEB_CONTAINER_PORT ?? '5173', 10)

export default defineConfig({
  plugins: [
    react(),
    tailwindcss()
  ],
  envDir: '../../',
  server: {
    port: WEB_PORT,
    host: '0.0.0.0',
    proxy: {
      '/api': API_TARGET,
      '/ws': {
        target: API_TARGET,
        ws: true,
        changeOrigin: true,
      },
    },
  },
})
