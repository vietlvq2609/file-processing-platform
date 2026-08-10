import { fileURLToPath } from 'node:url'

import { defineConfig } from 'vitest/config'

const resolve = (path: string) => fileURLToPath(new URL(path, import.meta.url))

export default defineConfig({
  resolve: {
    alias: {
      '@fpp/types': resolve('../types/src/index.ts'),
    },
  },
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts'],
    passWithNoTests: true,
    coverage: {
      provider: 'v8',
      thresholds: { lines: 80, functions: 80 },
      include: ['src/repositories/**'],
    },
  },
})
