# Deployment

This guide covers building production images and running the platform with Docker Compose.

---

## Overview

The platform ships with two Docker Compose files:

| File | Purpose |
|---|---|
| `docker-compose.yml` | Local development — hot reload, source volume mounts |
| `docker-compose.build.yml` | Production-like build — multi-stage optimised images |

---

## Building for Production

```bash
# Build all service images
docker compose -f docker-compose.build.yml build

# Start all services
docker compose -f docker-compose.build.yml up -d
```

This runs the full multi-stage builds for the API, Worker, and frontend. The React app is compiled and served as static files from the Nginx container.

---

## Environment Configuration

Copy and configure environment variables before starting:

```bash
cp .env.example .env
```

**Required changes before any deployment:**

| Variable | Action |
|---|---|
| `JWT_ACCESS_SECRET` | Generate with `openssl rand -hex 32` |
| `JWT_REFRESH_SECRET` | Generate a second, different secret |
| `POSTGRES_PASSWORD` | Set a strong database password |
| `MINIO_SECRET_KEY` | Set a strong MinIO password |
| `NODE_ENV` | Set to `production` |

**Docker Compose automatically overrides** the following to use Docker service hostnames — you do not need separate `.env` files for Docker vs. local:

- `DATABASE_URL` → `postgresql://postgres:<pw>@postgres:5432/<db>`
- `REDIS_URL` → `redis://redis:6379`
- `MINIO_ENDPOINT` → `minio`

---

## Services

| Service | Container | Port (host) | Notes |
|---|---|---|---|
| `nginx` | `fpp-nginx` | `80` | Only public-facing port |
| `api` | `fpp-api` | `3001` (internal) | Not exposed in prod build |
| `worker` | `fpp-worker` | — | No HTTP port |
| `postgres` | `fpp-postgres` | `5432` (internal) | |
| `redis` | `fpp-redis` | `6379` (internal) | |
| `minio` | `fpp-minio` | `9000`, `9001` | Console on `9001` |

In the production build, only Nginx is bound to the host network. All other services communicate on the internal `app_network` Docker network.

---

## Nginx

Nginx acts as the single entry point:

```
GET /           → Serve React build from /usr/share/nginx/html
GET /api/*      → Proxy to http://api:3001
GET /ws         → Proxy to http://api:3001/ws  (WebSocket upgrade)
```

The configuration is in `infra/docker/nginx.conf`. Key settings:

- `client_max_body_size` must match `MAX_FILE_SIZE_BYTES`
- WebSocket proxying requires `proxy_http_version 1.1` and the `Upgrade`/`Connection` headers
- Gzip compression is enabled for static assets

---

## Database Migrations

Migrations run automatically on API Server startup via the entrypoint script (`infra/docker/api-entrypoint.sh`). In production workflows, run migrations as a separate step before deploying:

```bash
docker compose -f docker-compose.build.yml run --rm api pnpm db:migrate
```

---

## Persistent Volumes

| Volume | Purpose |
|---|---|
| `postgres_data` | PostgreSQL data directory |
| `minio_data` | MinIO object storage data |

These volumes persist across container restarts. Back them up before upgrades.

---

## Health Checks

All stateful services define Docker health checks:

| Service | Check |
|---|---|
| `postgres` | `pg_isready` |
| `redis` | `redis-cli ping` |
| `minio` | `mc ready local` |

The API and Worker containers wait for all three to be healthy before starting (`depends_on: condition: service_healthy`).

---

## Stopping and Cleaning Up

```bash
# Stop all containers
docker compose -f docker-compose.build.yml down

# Stop and remove volumes (destructive — deletes all data)
docker compose -f docker-compose.build.yml down -v
```

---

## Multi-Stage Dockerfiles

Each service uses a multi-stage build:

**Stage 1 — build:**
- Full Node.js image
- Install all dependencies (including devDependencies)
- Compile TypeScript

**Stage 2 — runtime:**
- Slim Node.js image (`node:20-alpine`)
- Copy compiled output + production `node_modules` only
- `NODE_ENV=production`
- Non-root user (`node`) for security

The frontend adds an Nginx stage to serve the built React app.
