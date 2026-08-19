# Development image — source code is bind-mounted at runtime, not baked in.
# Rebuild only when package.json files change (new dependencies added).
FROM node:22-alpine

RUN corepack enable

WORKDIR /app

# Copy manifests for dependency layer caching.
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./
COPY apps/api/package.json       ./apps/api/
COPY apps/web/package.json       ./apps/web/
COPY apps/worker/package.json    ./apps/worker/
COPY packages/db/package.json    ./packages/db/
COPY packages/types/package.json ./packages/types/

# Install all deps including devDependencies (tsx, vite, drizzle-kit, etc.)
RUN pnpm install --frozen-lockfile
