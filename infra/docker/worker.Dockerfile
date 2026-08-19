# ─────────────────────────────────────────────────────────────────────────────
# Stage 1 – builder
# ─────────────────────────────────────────────────────────────────────────────
FROM node:22-alpine AS builder

RUN corepack enable

WORKDIR /app

COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./
COPY apps/worker/package.json    ./apps/worker/
COPY packages/db/package.json    ./packages/db/
COPY packages/types/package.json ./packages/types/

RUN pnpm install --frozen-lockfile

COPY apps/worker/    ./apps/worker/
COPY packages/db/    ./packages/db/
COPY packages/types/ ./packages/types/

RUN pnpm --filter @fpp/types build
RUN pnpm --filter @fpp/db    build
RUN pnpm --filter @fpp/worker build

# ─────────────────────────────────────────────────────────────────────────────
# Stage 2 – runner
# ─────────────────────────────────────────────────────────────────────────────
FROM node:22-alpine AS runner

RUN corepack enable

WORKDIR /app

COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./
COPY apps/worker/package.json    ./apps/worker/
COPY packages/db/package.json    ./packages/db/
COPY packages/types/package.json ./packages/types/

RUN pnpm install --frozen-lockfile --prod

COPY --from=builder /app/apps/worker/dist   ./apps/worker/dist
COPY --from=builder /app/packages/db/dist   ./packages/db/dist
COPY --from=builder /app/packages/types/dist ./packages/types/dist

WORKDIR /app/apps/worker

ENV NODE_ENV=production

CMD ["node", "dist/index.js"]
