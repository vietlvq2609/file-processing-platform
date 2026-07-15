# Backend Architecture

## Overview

The backend consists of two independent Node.js processes:

1. **API Server** — handles HTTP requests and WebSocket connections
2. **Worker Service** — consumes the job queue and performs file processing

Both are written in TypeScript and share no code at runtime, but may share type definitions through a shared package in the monorepo.

---

## API Server

### Responsibilities
- Serve REST endpoints for auth, files, and jobs
- Authenticate requests (JWT verification)
- Validate request input (Fastify schema validation)
- Delegate to service classes for business logic
- Manage WebSocket connections and forward Redis Pub/Sub events to clients
- Stream file uploads to storage and file downloads to clients

### Internal Structure

```
apps/api/src/
├── server.ts           Fastify instance setup, plugin registration
├── plugins/            Fastify plugins (auth, database, redis, multipart)
├── routes/             Route definitions grouped by domain
│   ├── auth/
│   ├── files/
│   └── jobs/
├── services/           Business logic (AuthService, FileService, JobService)
├── repositories/       Database access layer (UserRepo, FileRepo, JobRepo)
├── ws/                 WebSocket manager (connection registry, event dispatch)
├── queue/              BullMQ producer (enqueue jobs)
├── middleware/         Auth middleware, error handler
└── types/              Internal TypeScript types
```

### Layer Responsibilities

| Layer | Role |
|---|---|
| Routes | Parse and validate HTTP request; call service; return response |
| Services | Orchestrate business logic; call repositories and external services |
| Repositories | SQL queries only; return domain objects |
| WS Manager | Track connections by userId; push events to correct clients |
| Queue | Enqueue jobs into BullMQ; no business logic |

### Error Handling
- All errors propagate to a central Fastify error handler
- Domain errors (custom error classes) are mapped to HTTP status codes
- Unhandled errors are caught, logged, and returned as `500` without leaking internal details

---

## Worker Service

### Responsibilities
- Consume jobs from the BullMQ queue
- Retrieve the input file from storage
- Execute the processing logic
- Write the output file to storage
- Update the job record in PostgreSQL
- Publish progress events to Redis Pub/Sub throughout the job

### Internal Structure

```
apps/worker/src/
├── worker.ts           BullMQ Worker setup and job dispatch
├── processors/         One processor per job type
│   └── exampleProcessor.ts
├── services/           Storage access, database updates
├── repositories/       Job status updates (shared interface with API)
└── types/              Worker-specific types
```

### Job Processor Pattern
Each job type maps to a dedicated processor function. The dispatcher in `worker.ts` routes incoming jobs to the appropriate processor by `job.name` or `job.data.type`. This keeps processors isolated and easy to add.

### Progress Reporting
Processors publish progress at meaningful intervals (e.g. every 10%) via a shared `reportProgress(jobId, percent)` helper that:
1. Calls `job.updateProgress(percent)` (BullMQ built-in)
2. Publishes a structured event to the Redis channel `job:progress:<jobId>`

### Resilience
- BullMQ automatically retries failed jobs up to a configured `maxAttempts`
- Failed jobs move to a `failed` queue and the job record is updated with the error message
- The Worker is stateless; multiple instances can run in parallel without coordination

---

## Shared Packages (Monorepo)

| Package | Contents |
|---|---|
| `packages/types` | TypeScript interfaces shared between API and Worker (JobPayload, ProgressEvent, etc.) |
| `packages/db` | Drizzle schema definitions, migration files, and shared db client factory |
| `packages/config` | Shared environment variable parsing and validation |

---

## Database Access Pattern

Both the API Server and Worker use a repository layer built on **Drizzle ORM** with the `postgres` driver. Drizzle provides type-safe, schema-driven queries while staying close to SQL. The schema is defined in `packages/db/src/schema.ts` and shared across both services. Migrations are managed with `drizzle-kit`. Repository methods return typed domain objects, not raw Drizzle result types.

---

## Configuration and Environment

All configuration is loaded from environment variables at startup. A validation step (e.g. using `zod` or `envalid`) ensures required variables are present before the process starts. Missing required config causes an immediate startup failure with a descriptive error.

Key environment variable groups:
- `DATABASE_URL` — PostgreSQL connection string
- `REDIS_URL` — Redis connection string
- `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET` — Token signing secrets
- `STORAGE_PATH` — Base path for file storage volume
- `MAX_FILE_SIZE`, `ALLOWED_MIME_TYPES` — Upload constraints

---

## Logging

Fastify's built-in Pino logger is used throughout:
- JSON-structured logs in production
- Pretty-printed logs in development
- Request/response logging enabled at the framework level
- Service-layer events logged at appropriate levels (`info`, `warn`, `error`)
- Sensitive data (passwords, tokens) never logged

---

## Folder Organisation (Backend)

```
apps/
├── api/                Fastify HTTP + WebSocket server
└── worker/             BullMQ job consumer

packages/
├── types/              Shared TypeScript types
├── db/                 Drizzle schema, migrations, and db client factory
└── config/             Shared env config parsing

infra/
├── docker/             Dockerfiles per service
├── nginx/              Nginx config
└── postgres/           Init SQL scripts (schema migration placeholder)
```
