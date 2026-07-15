# Scalability & Maintainability

## Scalability Considerations

This project is designed with correct patterns for scalability, even though it does not need to scale in practice. The goal is to demonstrate awareness of real production concerns.

### Horizontal Worker Scaling
Workers are stateless. Multiple Worker containers can consume from the same BullMQ queue simultaneously. BullMQ uses Redis locks to ensure each job is processed by exactly one Worker. Scaling workers is a matter of increasing the container replica count.

### API Server Scaling
The API Server is also stateless with respect to HTTP requests (JWT is self-verifying, no server-side session). Multiple API instances can run behind a load balancer.

WebSocket connections are stateful per-connection. If multiple API instances run, a client's WebSocket may connect to a different instance than the one that receives a Redis Pub/Sub event. The Redis Pub/Sub approach already handles this: every API instance subscribes to the same Redis channels and can push to any connected client. This is the standard pattern for horizontally scaled WebSocket services.

### Database Scaling
PostgreSQL handles the expected load comfortably at portfolio scale. The connection pool (via `pg`) limits the number of concurrent database connections. For higher scale, a connection pooler (PgBouncer) sits between the application and PostgreSQL.

### File Storage Scaling
The local volume approach works for a single host. Replacing it with an S3-compatible store requires only changes to the storage service abstraction — no other layer changes.

### Queue Backpressure
BullMQ supports job priorities, rate limiting, and concurrency limits per Worker. These can be configured if processing jobs pile up faster than Workers can consume them.

---

## Maintainability Considerations

### Layered Architecture
The strict separation of Routes → Services → Repositories in the API ensures that:
- Business logic is testable in isolation (services can be unit tested without HTTP)
- Database queries are centralised (one place to change if the schema evolves)
- Routes stay thin and focused on HTTP concerns

### Shared Types Package
The `packages/types` package defines the contracts between services. Any breaking change to a shared type surfaces as a TypeScript compile error in all consumers simultaneously, preventing silent mismatches.

### Environment Validation at Startup
Failing loudly on missing configuration (rather than failing silently at runtime) reduces time-to-diagnosis for deployment issues.

### Consistent Error Handling
A centralised error handler maps domain errors to HTTP responses. Adding a new error type in one place cascades to correct HTTP behaviour automatically.

### Schema Validation
Fastify schema validation on every route means malformed input never reaches the service layer. It also auto-generates OpenAPI documentation if a Swagger plugin is added.

### Query Key Factory (Frontend)
Centralising TanStack Query keys into a factory (`queryKeys.files.list(filters)`) ensures cache invalidation is precise. Scattered string keys lead to stale data bugs.

---

## Extensibility and Future Possibilities

The architecture supports the following extensions without fundamental restructuring:

| Extension | Where to add |
|---|---|
| New job type (e.g. image resizing) | Add a new processor in `apps/worker/processors/` |
| New file operation (e.g. share link) | Add a route + service + repository method |
| Admin dashboard | Add a new role check and admin-scoped routes |
| Email notifications on job completion | Worker publishes a `notify` event; a new notification service consumes it |
| API versioning | Nest routes under `/api/v1/`; add `/api/v2/` when ready |
| Full-text file search | Add `pg_trgm` index on filename; update FileRepository list query |
| S3 storage backend | Replace `storageService` implementation; interface stays the same |
| Rate limiting | Add `@fastify/rate-limit` plugin; configure per-route |
| OpenAPI documentation | Add `@fastify/swagger`; schemas are already defined |
| End-to-end tests | Playwright against the running Docker Compose stack |
| CI/CD pipeline | GitHub Actions: lint → type-check → unit tests → Docker build → deploy |

---

## Testing Strategy (High Level)

| Layer | Type | Tooling |
|---|---|---|
| Utilities / pure functions | Unit tests | Vitest |
| Services (business logic) | Unit tests with mocked repos | Vitest |
| Repositories | Integration tests against test DB | Vitest + Docker test container |
| API routes | Integration tests (HTTP) | Fastify `inject` + test DB |
| Frontend components | Component tests | Vitest + React Testing Library |
| Full flows | End-to-end | Playwright |

The test pyramid applies: many unit tests, fewer integration tests, minimal end-to-end tests.
