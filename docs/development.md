# Development Guide

This guide covers local development setup, project structure, debugging, and testing.

---

## Prerequisites

| Tool | Version | Notes |
|---|---|---|
| Node.js | ≥ 20 | Use [nvm](https://github.com/nvm-sh/nvm) or [fnm](https://github.com/Schniz/fnm) |
| pnpm | ≥ 9 | `npm install -g pnpm` |
| Docker | Latest stable | |
| Docker Compose | v2 | Included with Docker Desktop |

---

## Initial Setup

```bash
# Clone the repository
git clone https://github.com/vietlvq2609/file-processing-platform.git
cd file-processing-platform

# Install all workspace dependencies
pnpm install

# Copy and configure environment variables
cp .env.example .env
```

Open `.env` and set the following before starting:

| Variable | Action |
|---|---|
| `JWT_ACCESS_SECRET` | Generate with `openssl rand -hex 32` |
| `JWT_REFRESH_SECRET` | Generate a second unique secret |
| `MINIO_SECRET_KEY` | Set a secure password for MinIO |

The default values for everything else work out of the box for local development.

---

## Running the Full Stack

### Option A — Docker Compose (recommended for first run)

Starts all services, including infrastructure, with hot-reloaded source files mounted into the containers.

```bash
docker compose up
```

On first run this builds the dev image (≈1–2 minutes). Subsequent starts are fast.

The API automatically runs pending migrations on startup.

### Option B — Native processes (faster iteration)

Start only the infrastructure via Docker, then run the Node.js processes directly:

```bash
# Start infrastructure services
docker compose up postgres redis minio -d

# Apply pending migrations
pnpm db:migrate

# Start all apps concurrently
pnpm dev
```

Individual processes:

```bash
pnpm dev:api      # Fastify API server on :3001 (tsx watch)
pnpm dev:web      # Vite dev server on :5173
pnpm dev:worker   # BullMQ worker (tsx watch)
```

---

## Service URLs

| Service | URL | Notes |
|---|---|---|
| React SPA | `http://localhost:5173` | Vite dev server (native) or `http://localhost` (Docker) |
| API Server | `http://localhost:3001` | Direct access |
| MinIO Console | `http://localhost:9001` | Object storage UI |
| PostgreSQL | `localhost:5432` | User: `postgres`, pass: from `.env` |
| Redis | `localhost:6379` | |

---

## Project Structure

```
file-processing-platform/
├── apps/
│   ├── api/                   Fastify API server
│   │   └── src/
│   │       ├── server.ts      Fastify instance, plugin registration
│   │       ├── config.ts      Environment variable parsing (fail-fast)
│   │       ├── routes/        Route handlers grouped by domain
│   │       ├── services/      Business logic (AuthService, FileService, JobService)
│   │       ├── middleware/    Central error handler
│   │       ├── plugins/       Fastify plugins (auth, multipart)
│   │       ├── queue/         BullMQ job producer
│   │       ├── ws/            WebSocket manager + Redis subscriber
│   │       └── utils/         Typed domain errors
│   │
│   ├── web/                   React SPA (Vite)
│   │   └── src/
│   │       ├── api/           Typed Axios wrappers
│   │       ├── components/    Reusable UI components
│   │       ├── features/      Domain feature modules (files, jobs, auth, ...)
│   │       ├── hooks/         Cross-feature shared hooks
│   │       ├── pages/         Route-level page components
│   │       ├── router/        React Router configuration
│   │       ├── stores/        Zustand stores (auth, websocket)
│   │       └── utils/         Query key factory, formatters, etc.
│   │
│   └── worker/                BullMQ worker service
│       └── src/
│           ├── worker.ts      BullMQ consumer setup
│           ├── processors/    Job type processors
│           └── repositories/  Worker-side DB access
│
├── packages/
│   ├── db/                    Drizzle schema, migrations, client factory
│   │   ├── src/
│   │   │   ├── schema/        Table definitions
│   │   │   ├── repositories/  Shared repository implementations
│   │   │   └── client.ts      Database client factory
│   │   └── drizzle/           Migration SQL files
│   │
│   └── types/                 Shared TypeScript types
│       └── src/
│           ├── domain.ts      Core domain types
│           ├── enums.ts       Status enums
│           ├── api/           Request/response DTOs
│           └── websocket.ts   WebSocket message types
│
└── infra/
    ├── docker/                Dockerfiles and entrypoint scripts
    ├── nginx/                 Nginx configuration
    └── postgres/              Init scripts and dev seed data
```

---

## Database Migrations

Migrations are managed by Drizzle Kit.

```bash
# After modifying packages/db/src/schema/, generate a migration
pnpm db:generate

# Apply pending migrations
pnpm db:migrate

# Seed the database with dev data (creates a test user)
pnpm db:seed
```

Migration files are committed to `packages/db/drizzle/` and should not be edited manually after being applied.

**Test credentials after seeding:**
- Email: `test@example.com`
- Password: `password123`

---

## Environment Variables Reference

See `.env.example` for all variables with inline documentation.

Key variables:

| Variable | Required | Description |
|---|---|---|
| `DATABASE_URL` | yes | PostgreSQL connection string |
| `REDIS_URL` | yes | Redis connection URL |
| `JWT_ACCESS_SECRET` | yes | Secret for signing access tokens (≥32 chars) |
| `JWT_REFRESH_SECRET` | yes | Secret for signing refresh tokens (≥32 chars) |
| `MINIO_ACCESS_KEY` | yes | MinIO / S3 access key |
| `MINIO_SECRET_KEY` | yes | MinIO / S3 secret key |
| `MAX_FILE_SIZE_BYTES` | no | Default `52428800` (50 MB) |
| `JWT_ACCESS_TTL_SECONDS` | no | Default `900` (15 min) |
| `JWT_REFRESH_TTL_SECONDS` | no | Default `604800` (7 days) |

All required variables are validated at startup. The service exits immediately with a clear error if any are missing.

---

## Testing

```bash
# Run all tests
pnpm test

# Run tests in watch mode for a specific package
pnpm --filter @fpp/api test -- --watch

# Run with coverage
pnpm test:coverage
```

Test files are co-located with the source files they test:

```
apps/api/src/services/FileService.ts
apps/api/src/services/FileService.test.ts
```

Test factories and stubs:

```
apps/api/src/test/factories.ts    Domain object factories
apps/api/src/test/stubs/          Stubbed repositories and services
```

---

## Linting and Formatting

```bash
pnpm lint           # Check for lint errors
pnpm lint:fix       # Auto-fix lint errors
pnpm format         # Format all files with Prettier
pnpm format:check   # Verify formatting without writing
```

Both run automatically on commit via Husky + lint-staged.

---

## Debugging

### API Server

The API uses [Pino](https://getpino.io/) for structured logging. In development, logs are pretty-printed. Set `LOG_LEVEL=debug` in `.env` for verbose output.

When using Docker Compose, tail logs for a specific service:

```bash
docker compose logs -f api
docker compose logs -f worker
```

### Database

Connect to the dev database directly:

```bash
docker exec -it fpp-postgres psql -U postgres -d file-processing-platform-db
```

### Redis

Inspect the BullMQ queues:

```bash
docker exec -it fpp-redis redis-cli
> KEYS *
> LLEN bull:file-processing:wait
```

### MinIO

The MinIO Console at `http://localhost:9001` provides a web UI to browse uploaded files and buckets.
