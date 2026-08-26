# File Processing Platform

A production-grade, full-stack file processing platform demonstrating modern engineering patterns across a React frontend, Fastify API, background worker, and multi-container Docker infrastructure.

> **Portfolio project** — Built to showcase async architecture, real-time communication, and clean separation of concerns rather than business complexity.

---

## Overview

Users upload files, submit them for background processing (convert, compress, or transform), and receive live progress updates via WebSocket. The architecture mirrors real-world systems like Cloudinary, Google Drive, and document-conversion services.

```
Browser (React SPA)
    │  HTTP / WebSocket
    ▼
Nginx (Reverse Proxy)
    │
    ├──▶ API Server (Fastify)  ──▶ PostgreSQL
    │         │                ──▶ MinIO (File Storage)
    │         │
    │         └──▶ Redis (BullMQ Queue + Pub/Sub)
    │                   │
    └──▶ Worker Service ──▶ PostgreSQL / MinIO
```

---

## Features

- **Authentication** — JWT access + refresh tokens, automatic silent refresh via Axios interceptor
- **File Management** — Upload, list, search, download, and soft-delete files
- **Background Processing** — Async job queue (BullMQ/Redis) with retry support
- **Real-Time Progress** — WebSocket push from Worker → Redis Pub/Sub → API → Browser
- **Three Processing Pillars** — Converter, Compressor, and Tools
- **User-scoped data** — Every query is filtered by `user_id`; no cross-user data leaks

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, TypeScript, TanStack Query v5, Zustand v5, React Router v6, Axios |
| API Server | Node.js, Fastify v5, TypeScript, Drizzle ORM, BullMQ, `ws` |
| Worker | Node.js, TypeScript, BullMQ, Drizzle ORM, ioredis |
| Database | PostgreSQL 16 |
| Queue / Pub/Sub | Redis 7 |
| File Storage | MinIO (S3-compatible) |
| Infrastructure | Docker, Docker Compose, Nginx |
| Monorepo | pnpm workspaces |

---

## Repository Structure

```
file-processing-platform/
├── apps/
│   ├── api/          Fastify API server
│   ├── web/          React SPA (Vite)
│   └── worker/       BullMQ worker service
├── packages/
│   ├── db/           Drizzle schema, migrations, repositories, db client
│   └── types/        Shared TypeScript domain types and API contracts
├── infra/
│   ├── docker/       Dockerfiles and entrypoint scripts
│   ├── nginx/        Nginx reverse-proxy config
│   └── postgres/     DB init scripts and dev seed data
├── docs/             Architecture, API reference, and deployment guides
├── .env.example      Required environment variables (copy to .env)
├── docker-compose.yml         Local development (hot reload, volume mounts)
└── docker-compose.build.yml   Production-like build
```

---

## Quick Start

### Prerequisites

- [Docker](https://docs.docker.com/get-docker/) and Docker Compose v2
- [Node.js](https://nodejs.org/) ≥ 20 and [pnpm](https://pnpm.io/) ≥ 9 (for local dev without Docker)

### 1. Clone and configure

```bash
git clone https://github.com/vietlvq2609/file-processing-platform.git
cd file-processing-platform
cp .env.example .env
```

Edit `.env` and set secure values for `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET`, and `MINIO_SECRET_KEY` before running.

### 2. Start all services

```bash
docker compose up
```

This starts PostgreSQL, Redis, MinIO, the API Server (with auto-migration), the Worker, and Nginx. On first run, Docker builds the development images.

### 3. Seed the database

```bash
pnpm db:seed
```

Creates a test user: **`test@example.com` / `password123`**

### 4. Open the app

| URL | Description |
|---|---|
| `http://localhost:3000` | React SPA (via Nginx) |
| `http://localhost:3001` | API Server (direct) |
| `http://localhost:9001` | MinIO Console |

---

## Local Development (without Docker)

For faster iteration, run services natively with hot reload:

```bash
# Install dependencies
pnpm install

# Start PostgreSQL, Redis, and MinIO via Docker (infra only)
docker compose up postgres redis minio -d

# Run migrations
pnpm db:migrate

# Start all apps concurrently
pnpm dev
```

Individual apps:

```bash
pnpm dev:api      # API server on :3001
pnpm dev:web      # Vite dev server on :5173
pnpm dev:worker   # Worker (BullMQ consumer)
```

---

## Available Scripts

| Script | Description |
|---|---|
| `pnpm dev` | Start all apps concurrently with hot reload |
| `pnpm build` | Build all packages and apps for production |
| `pnpm test` | Run all test suites |
| `pnpm test:coverage` | Run tests with coverage reports |
| `pnpm lint` | Lint all source files |
| `pnpm lint:fix` | Auto-fix lint errors |
| `pnpm format` | Format all source files with Prettier |
| `pnpm db:generate` | Generate a new Drizzle migration |
| `pnpm db:migrate` | Apply pending migrations |
| `pnpm db:seed` | Seed the database with dev data |

---

## Documentation

| Document | Description |
|---|---|
| [docs/architecture.md](docs/architecture.md) | System topology, service boundaries, and key design decisions |
| [docs/api.md](docs/api.md) | REST and WebSocket API reference |
| [docs/development.md](docs/development.md) | Local dev setup, debugging, and testing guide |
| [docs/deployment.md](docs/deployment.md) | Docker deployment and environment configuration |

---

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for development workflow, coding conventions, and pull request guidelines.

---

## License

MIT
