# Copilot Instructions

This file provides GitHub Copilot with the context needed to give accurate, relevant assistance throughout development of the File Processing Platform.

---

## Project Identity

**Name:** File Processing Platform
**Type:** Engineering portfolio project — not a commercial product
**Primary goal:** Showcase production-quality full-stack engineering patterns

---

## Technology Stack

### Frontend (`apps/frontend/`)
- React 18, TypeScript
- React Router v6 (SPA routing)
- TanStack Query v5 (server state, caching, loading/error states)
- Zustand (client state: auth store, WebSocket store)
- Axios (HTTP client with request/response interceptors for token refresh)
- Native WebSocket API (real-time job progress)
- Vite (build tool)

### Backend API (`apps/api/`)
- Node.js, TypeScript
- Fastify v4 (HTTP framework with JSON schema validation)
- `@fastify/multipart` (file upload handling)
- `jsonwebtoken` (JWT access + refresh token signing and verification)
- `drizzle-orm` (ORM for type-safe SQL queries through repository layer)
- `drizzle-kit` (schema migrations and introspection)
- `postgres` (PostgreSQL driver used by Drizzle)
- `ioredis` (Redis client)
- `bullmq` (job queue producer)
- `ws` (WebSocket server)

### Worker (`apps/worker/`)
- Node.js, TypeScript
- `bullmq` (job queue consumer)
- `ioredis` (Redis client for Pub/Sub progress publishing)
- `drizzle-orm` (ORM for job status updates)
- `postgres` (PostgreSQL driver used by Drizzle)

### Infrastructure
- Docker + Docker Compose
- Nginx (reverse proxy, static serving, WebSocket upgrade)
- PostgreSQL 16
- Redis 7

---

## Architecture Principles

1. **Layered backend:** Routes → Services → Repositories. Business logic never lives in route handlers.
2. **Stateless services:** API Server and Worker are stateless; state lives in PostgreSQL and Redis.
3. **Worker isolation:** The Worker has no HTTP port. It only communicates via the BullMQ queue (Redis) and PostgreSQL.
4. **WebSocket via Redis Pub/Sub:** Workers publish progress to Redis channels. The API Server subscribes and forwards to WebSocket clients. Workers never hold WebSocket connections.
5. **Drizzle ORM:** Repository layer uses Drizzle ORM for type-safe, schema-driven queries. Raw SQL escape hatches (`db.execute(sql\`...\``) are allowed when needed, but Drizzle's query builder is the default.
6. **User-scoped data:** Every database query for files and jobs includes a `user_id` filter. No data leaks between users.
7. **UUID primary keys:** All entities use UUID PKs, not auto-increment integers.
8. **Fail fast on config:** Missing required environment variables cause immediate startup failure.

---

## Key Patterns to Follow

### Backend
- Repository methods return typed domain objects, not raw query results
- Services throw typed domain errors (e.g. `NotFoundError`, `ForbiddenError`) that the central error handler maps to HTTP codes
- Fastify route schemas define request body, params, querystring, and response shapes — always include these
- All async operations are properly `await`ed with `try/catch` or error propagation
- No `any` types — use `unknown` and narrow appropriately

### Frontend
- TanStack Query for all server data — no `useEffect` + `fetch` patterns
- Query keys use the centralised factory in `utils/queryKeys.ts`
- Mutations call `queryClient.invalidateQueries` or `queryClient.setQueryData` on success
- WebSocket events update the TanStack Query cache imperatively (no polling)
- Access tokens stored in Zustand memory store — never in `localStorage`
- Protected routes redirect to `/login` if the user is not authenticated

### Shared
- TypeScript strict mode is enabled — no implicit `any`, no `!` non-null assertions without comment
- All files use named exports, not default exports (except React page components where convention differs)
- Consistent async/await — no `.then()` chains except in Axios interceptors

---

## File and Job Status Values

**File status:** `pending` | `ready` | `deleted`
**Job status:** `pending` | `processing` | `completed` | `failed`

---

## Database Conventions
- Table names: `snake_case`, plural (`users`, `files`, `jobs`)
- Column names: `snake_case`
- Primary keys: `id UUID DEFAULT gen_random_uuid()`
- Timestamps: `created_at TIMESTAMPTZ DEFAULT NOW()`, `updated_at TIMESTAMPTZ DEFAULT NOW()`
- Soft deletes: `deleted_at TIMESTAMPTZ DEFAULT NULL`

---

## API Conventions
- Base path: `/api/v1`
- Auth header: `Authorization: Bearer <accessToken>`
- Success response: `{ data: T, meta?: PaginationMeta }`
- Error response: `{ error: { code: string, message: string, details?: object } }`
- Error codes: `UPPER_SNAKE_CASE` strings (e.g. `FILE_NOT_FOUND`, `UNAUTHORIZED`)
- Pagination params: `page` (1-based), `limit` (default 20, max 100)

---

## What to Avoid
- Do not add alternative ORM dependencies (Prisma, TypeORM, Sequelize) — Drizzle ORM is the chosen ORM for this project
- Do not use `localStorage` for tokens
- Do not add business complexity — the domain is intentionally simple
- Do not add third-party UI component libraries (build primitives from scratch to demonstrate UI skills)
- Do not use `class-validator` or decorator-based validation — Fastify JSON schemas handle this
- Do not add `console.log` — use the Fastify/Pino logger
