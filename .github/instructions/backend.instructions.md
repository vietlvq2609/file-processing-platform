---
applyTo: apps/api/src/**
---

# Backend API Instructions

These instructions apply to all files under `apps/api/src/`.

## Architecture: Routes → Services → Repositories

Never skip layers. Route handlers call services; services call repositories; repositories call the database.

```
route handler  →  service method  →  repository method  →  Drizzle ORM  →  PostgreSQL
```

## Fastify v5 Patterns

- Register plugins with `await fastify.register(plugin, opts)` — Fastify v5 uses async-first plugin registration
- Declare route schemas inline with `schema: { body, params, querystring, response }` on every route
- Use `request.log` for logging inside route handlers (Pino logger is injected automatically)
- Use `reply.code(n).send(payload)` — do not return values from route handlers
- Error handling: throw typed domain errors from services; the central `errorHandler` in `middleware/errorHandler.ts` maps them to HTTP responses

## Repository Rules

- Every public method must return a typed domain object (from `packages/types`), not a raw Drizzle result
- All queries must include a `userId` filter when operating on user-owned data (`files`, `jobs`)
- Use Drizzle query builder by default; `db.execute(sql\`...\`)` is allowed only as an escape hatch with a comment explaining why
- No raw SQL strings — never construct SQL by string concatenation

## Service Rules

- Throw typed domain errors (`NotFoundError`, `ForbiddenError`, `ConflictError`, etc.) from `utils/errors.ts`
- Never access `db` directly in a service — delegate to repository methods
- Services are stateless — no class instance state beyond constructor-injected dependencies

## Worker Instructions

These also apply to `apps/worker/src/**`.

- The worker has no HTTP server — no Fastify, no `reply`, no `request`
- Progress updates are published to Redis Pub/Sub channels; the API server subscribes and forwards to WebSocket clients
- Use `ioredis` for Pub/Sub; use Drizzle repositories for database writes

## Anti-Patterns (backend)

- ❌ `db.select().from(files)` inside a route handler
- ❌ Raw SQL strings (`"SELECT * FROM files WHERE id = $1"`)
- ❌ `console.log(...)` — use `request.log.info(...)` or `server.log.info(...)`
- ❌ `any` type — use `unknown` and narrow
- ❌ Non-null assertions (`value!`) without an explanatory comment
