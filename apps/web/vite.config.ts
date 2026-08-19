import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// In Docker dev the Vite server runs inside a container and proxies to the api
// service by name. Locally it falls back to localhost.
const API_TARGET = process.env.API_PROXY_TARGET ?? 'http://localhost:3000'

export default defineConfig({
  plugins: [react()],
  envDir: '../../',
  server: {
    port: 5173,
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
