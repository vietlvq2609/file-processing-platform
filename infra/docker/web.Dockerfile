# ─────────────────────────────────────────────────────────────────────────────
# Stage 1 – builder
# Builds the Vite React SPA into static assets.
# VITE_API_BASE_URL is intentionally left as /api so nginx can proxy it to
# the api service — no absolute hostname is baked into the bundle.
# ─────────────────────────────────────────────────────────────────────────────
FROM node:22-alpine AS builder

RUN corepack enable

WORKDIR /app

# Copy manifests for layer caching.
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./
COPY apps/web/package.json        ./apps/web/
COPY packages/types/package.json  ./packages/types/

RUN pnpm install --frozen-lockfile

COPY apps/web/        ./apps/web/
COPY packages/types/  ./packages/types/

# Build shared types (web imports from @fpp/types at build time).
RUN pnpm --filter @fpp/types build

# Build the SPA. VITE_API_BASE_URL is set to /api so the nginx proxy handles
# routing — no hard-coded hostname ends up inside the JS bundle.
RUN VITE_API_BASE_URL=/api pnpm --filter @fpp/web build

# ─────────────────────────────────────────────────────────────────────────────
# Stage 2 – runner
# Serve the compiled static assets with nginx.
# ─────────────────────────────────────────────────────────────────────────────
FROM nginx:1.27-alpine AS runner

# Remove the default nginx config and replace with our own.
RUN rm /etc/nginx/conf.d/default.conf
COPY infra/docker/nginx.conf /etc/nginx/conf.d/app.conf

# Copy built assets from the builder stage.
COPY --from=builder /app/apps/web/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
