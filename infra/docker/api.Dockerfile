# ─────────────────────────────────────────────────────────────────────────────
# Stage 1 – builder
# Installs all workspace deps, builds shared packages, then builds the API.
# ─────────────────────────────────────────────────────────────────────────────
FROM node:22-alpine AS builder

# Enable corepack so the exact pnpm version from package.json is used.
RUN corepack enable

WORKDIR /app

# Copy manifests first for better layer caching.
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./
COPY apps/api/package.json          ./apps/api/
COPY packages/db/package.json       ./packages/db/
COPY packages/types/package.json    ./packages/types/

# Install all dependencies (dev included — needed for tsc).
RUN pnpm install --frozen-lockfile

# Copy the rest of the source.
COPY apps/api/        ./apps/api/
COPY packages/db/     ./packages/db/
COPY packages/types/  ./packages/types/

# Build shared packages first (API depends on their dist/).
RUN pnpm --filter @fpp/types build
RUN pnpm --filter @fpp/db    build
RUN pnpm --filter @fpp/api   build

# ─────────────────────────────────────────────────────────────────────────────
# Stage 2 – runner
# Lean production image: only compiled JS + production node_modules.
# ─────────────────────────────────────────────────────────────────────────────
FROM node:22-alpine AS runner

RUN corepack enable

WORKDIR /app

# Copy manifests for a clean production install.
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./
COPY apps/api/package.json          ./apps/api/
COPY packages/db/package.json       ./packages/db/
COPY packages/types/package.json    ./packages/types/

# Production-only install (no devDependencies).
RUN pnpm install --frozen-lockfile --prod

# Copy compiled output from the builder stage.
COPY --from=builder /app/apps/api/dist        ./apps/api/dist
COPY --from=builder /app/packages/db/dist     ./packages/db/dist
COPY --from=builder /app/packages/types/dist  ./packages/types/dist

# Migration files are needed at runtime by the entrypoint script.
COPY packages/db/drizzle ./packages/db/drizzle

# Entrypoint runs migrations then hands off to the server.
COPY infra/docker/api-entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

WORKDIR /app/apps/api

ENV NODE_ENV=production

EXPOSE 3000

ENTRYPOINT ["/entrypoint.sh"]
