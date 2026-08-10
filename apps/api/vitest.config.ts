import { fileURLToPath } from 'node:url'

import { defineConfig } from 'vitest/config'

const resolve = (path: string) => fileURLToPath(new URL(path, import.meta.url))

export default defineConfig({
  resolve: {
    alias: {
      '@fpp/db': resolve('../../packages/db/src/index.ts'),
      '@fpp/types': resolve('../../packages/types/src/index.ts'),
    },
  },
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts'],
    coverage: {
      provider: 'v8',
      thresholds: { lines: 80, functions: 80 },
      include: ['src/services/**'],
    },
  },
})
