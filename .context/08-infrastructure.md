# Infrastructure & Deployment

## Local Development Environment

All services run via Docker Compose. A single `docker-compose up` command starts the entire platform locally.

### Services in Compose

| Service | Image / Build | Internal Port | Notes |
|---|---|---|---|
| `nginx` | `nginx:alpine` + custom config | 80 | Only service exposed to host |
| `api` | Local Dockerfile | 3000 | Built from `apps/api` |
| `worker` | Local Dockerfile | — | No HTTP port; queue consumer only |
| `postgres` | `postgres:16-alpine` | 5432 | Volume-mounted data directory |
| `redis` | `redis:7-alpine` | 6379 | No persistence needed for dev |
| `frontend` | Multi-stage build (build → nginx static) | — | Served by Nginx |

### Volumes
- `postgres_data` — persistent PostgreSQL data between restarts
- `file_storage` — shared volume mounted by both `api` and `worker` for file read/write

### Networks
All services share one internal Docker network (`app_network`). Only Nginx binds to the host interface.

---

## Nginx Configuration

Nginx acts as the single entry point:

```
/ (static)           → Serve React build from /usr/share/nginx/html
/api/*               → Proxy to http://api:3000
/ws                  → Proxy to http://api:3000/ws  (WebSocket upgrade)
```

Key Nginx directives required:
- `proxy_http_version 1.1` — required for WebSocket proxying
- `proxy_set_header Upgrade` / `Connection` — WebSocket upgrade headers
- `client_max_body_size` — set to match the maximum allowed file upload size
- Gzip compression enabled for static assets

---

## Dockerfiles

Each application service uses a multi-stage build:

**Stage 1 (build):**
- Node.js image
- Install dependencies
- Compile TypeScript

**Stage 2 (runtime):**
- Slim Node.js image (no dev tools)
- Copy compiled output + production `node_modules`
- Set `NODE_ENV=production`
- Non-root user for security

The frontend Dockerfile has an additional Nginx stage to serve the built React app.

---

## Environment Configuration

Environment variables are provided via:
- `.env` file for local development (not committed to version control)
- `.env.example` committed to document required variables
- Docker Compose `env_file` and `environment` directives

All variables are validated at application startup. Services exit immediately with a clear error if required variables are missing.

---

## Database Migrations

Database schema changes are managed via migration files (plain SQL or a lightweight migration tool like `node-pg-migrate`). Migrations run automatically on API Server startup in development. In a production-like deployment, migrations are a separate step before the application starts.

A seed script populates development data (demo user, sample files and jobs) for a pleasant first-run experience.

---

## Development Workflow

```
# Start all services
docker-compose up

# API hot-reload (outside Docker, for faster iteration)
cd apps/api && npm run dev

# Worker hot-reload
cd apps/worker && npm run dev

# Frontend hot-reload (Vite dev server)
cd apps/frontend && npm run dev

# Run database migrations
npm run migrate

# Run seed data
npm run seed
```

---

## Health Checks

Each service exposes a health endpoint used by Docker Compose `healthcheck`:

- **API:** `GET /health` → `200 { status: "ok", db: "ok", redis: "ok" }`
- **Postgres:** `pg_isready` command
- **Redis:** `redis-cli ping`

Worker health is inferred from BullMQ queue metrics (stalled job count).

---

## Production Considerations (Future)

This section notes what would change for a real production deployment without implementing it in v1.

| Concern | v1 (Portfolio) | Production Approach |
|---|---|---|
| File storage | Local Docker volume | S3 / GCS / Azure Blob |
| Database | Single Postgres container | Managed RDS / Cloud SQL |
| Redis | Single Redis container | ElastiCache / Upstash |
| TLS | Nginx self-signed / HTTP only | Nginx + Let's Encrypt / load balancer TLS |
| Secrets | `.env` file | Vault / AWS Secrets Manager / K8s secrets |
| CI/CD | None | GitHub Actions: lint → test → build → deploy |
| Observability | Pino logs to stdout | Centralized logging, Prometheus metrics, tracing |
| Scaling Workers | Single container | Kubernetes horizontal pod autoscaler or ECS task scaling |
