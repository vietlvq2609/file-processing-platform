# Architecture Overview

## System Topology

```
┌─────────────────────────────────────────────────────────────────┐
│  Browser                                                        │
│  React SPA (TypeScript)                                         │
│  TanStack Query · Zustand · Axios · WebSocket                  │
└───────────────────────┬─────────────────────────────────────────┘
                        │  HTTP / WebSocket
                        ▼
┌─────────────────────────────────────────────────────────────────┐
│  Nginx (Reverse Proxy)                                          │
│  · Routes /api/* → API Server                                   │
│  · Routes /ws    → API Server (WebSocket upgrade)              │
│  · Serves static frontend build                                 │
└───────────────────────┬─────────────────────────────────────────┘
                        │
          ┌─────────────┴─────────────┐
          │                           │
          ▼                           ▼
┌──────────────────┐       ┌─────────────────────┐
│  API Server      │       │  File Storage        │
│  Fastify + TS    │       │  Local volume /       │
│  · Auth routes   │       │  S3-compatible store │
│  · File routes   │       └─────────────────────┘
│  · Job routes    │                  ▲
│  · WS manager    │                  │ read/write
└────────┬─────────┘                  │
         │                            │
    ┌────┴────┐              ┌────────┴──────────┐
    │         │              │                   │
    ▼         ▼              │                   │
┌───────┐  ┌──────┐          │                   │
│  PG   │  │Redis │          │                   │
│  DB   │  │Queue │          │                   │
└───────┘  └──┬───┘          │                   │
              │              │                   │
              ▼              │                   │
┌─────────────────────────┐  │                   │
│  Worker Service         │──┘                   │
│  BullMQ Consumer        │                      │
│  · Processes jobs       │──────────────────────┘
│  · Publishes progress   │  WebSocket events via Redis Pub/Sub
│  · Updates DB status    │
└─────────────────────────┘
```

---

## Service Boundaries

| Service | Responsibility | Talks To |
|---|---|---|
| **Frontend** | UI, user interaction, real-time display | API Server (HTTP + WS) |
| **Nginx** | Proxy, SSL termination, static serving | Frontend build, API Server |
| **API Server** | Auth, REST endpoints, WebSocket hub, job dispatch | PostgreSQL, Redis, File Storage |
| **Worker Service** | Job consumption, file processing, progress events | Redis (BullMQ), PostgreSQL, File Storage |
| **PostgreSQL** | Persistent relational data (users, files, jobs) | API Server, Worker |
| **Redis** | Job queue transport, pub/sub for WS events | API Server, Worker |
| **File Storage** | Raw file persistence (input + output) | API Server (upload/download), Worker (read/write) |

---

## Key Architectural Decisions

### Separate API and Worker containers
The API Server and Worker run in separate Docker containers. This keeps HTTP request handling isolated from CPU/IO-intensive file processing and allows each to scale independently.

### Redis as the integration backbone
Redis serves two purposes: job queue (via BullMQ) and progress event bus (via Pub/Sub). The Worker publishes job progress to a Redis channel; the API Server subscribes and forwards events to WebSocket clients. This decouples the Worker from any knowledge of WebSocket connections.

### WebSocket managed by API Server
The API Server owns all WebSocket connections. Workers never hold open connections to the browser. This is the standard pattern for production systems and keeps the Worker stateless.

### JWT with short-lived access tokens
Access tokens expire quickly (15 minutes). Refresh tokens are longer-lived and stored securely. The Axios client automatically attempts token refresh using an interceptor before retrying the failed request.

### File storage abstraction
File storage is treated as an opaque backend (a mounted volume in development). The API and Worker access it through an abstraction layer, making it straightforward to swap to S3 or another object store later.

---

## Communication Patterns

| Pattern | Used For |
|---|---|
| REST (HTTP) | All CRUD operations, auth, file uploads, job submissions, downloads |
| WebSocket (server-push) | Real-time job progress updates, job completion notifications |
| BullMQ (queue) | Decoupled, reliable dispatch of processing jobs to Worker |
| Redis Pub/Sub | Worker-to-API-Server progress forwarding |
| Multipart form upload | File upload from browser to API |

---

## Deployment Topology (Docker Compose)

```
docker-compose.yml
├── nginx          (port 80/443 exposed to host)
├── frontend       (React build, served by Nginx)
├── api            (Fastify, internal port 3000)
├── worker         (BullMQ consumer, no exposed port)
├── postgres       (internal port 5432)
└── redis          (internal port 6379)
```

All services share an internal Docker network. Only Nginx is exposed to the outside world.
