# Architecture

This document describes the system topology, service responsibilities, key design decisions, and data flows of the File Processing Platform.

---

## System Topology

```mermaid
flowchart TB
    classDef frontend fill:#61DAFB,stroke:#1b6a80,color:#0b2b33,font-weight:bold
    classDef backend fill:#2f855a,stroke:#1c4532,color:#ffffff,font-weight:bold
    classDef infra fill:#ed8936,stroke:#7b341e,color:#ffffff,font-weight:bold
    classDef data fill:#4169E1,stroke:#1a2f6b,color:#ffffff,font-weight:bold

    Browser["Browser<br/>React SPA · TanStack Query · Zustand · Axios · WebSocket"]:::frontend
    Nginx["Nginx (Reverse Proxy)<br/>/api/* → API · /ws → API · / → React build"]:::infra
    API["API Server (Fastify + TS)<br/>Auth · File · Job routes · WS manager"]:::backend
    Worker["Worker Service (BullMQ Consumer)<br/>Processes jobs · Publishes progress · Updates DB"]:::backend
    PG[("PostgreSQL")]:::data
    Redis[("Redis<br/>Queue + Pub/Sub")]:::data
    MinIO[("MinIO / File Storage<br/>S3-compatible")]:::data

    Browser -- "HTTP / WebSocket" --> Nginx
    Nginx --> API
    API --> PG
    API -- "read / write" --> MinIO
    API <--> Redis
    Redis <--> Worker
    Worker --> PG
    Worker -- "read / write" --> MinIO
    Worker -. "progress via Pub/Sub → API → Browser" .-> API
```

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

## Service Boundaries

| Service | Responsibility | Communicates With |
|---|---|---|
| **Frontend** | UI, user interaction, real-time display | API Server (HTTP + WS) |
| **Nginx** | Reverse proxy, static serving | Frontend build, API Server |
| **API Server** | Auth, REST endpoints, WebSocket hub, job dispatch | PostgreSQL, Redis, MinIO |
| **Worker** | Job consumption, file processing, progress events | Redis (BullMQ), PostgreSQL, MinIO |
| **PostgreSQL** | Persistent relational data (users, files, jobs) | API Server, Worker |
| **Redis** | Job queue transport + Pub/Sub for WebSocket events | API Server, Worker |
| **MinIO** | Raw file storage (input + processed output) | API Server (upload/download), Worker (read/write) |

---

## Key Design Decisions

### Separate API and Worker containers

The API Server and Worker run as separate Docker containers. This isolates CPU/IO-intensive file processing from HTTP request handling and allows each service to scale independently.

### Redis as the integration backbone

Redis serves two purposes:

1. **Job queue** (via BullMQ) — the API Server enqueues jobs; the Worker dequeues and processes them
2. **Progress event bus** (via Pub/Sub) — the Worker publishes progress updates to a Redis channel; the API Server subscribes and pushes them to WebSocket clients

This keeps the Worker completely decoupled from WebSocket connections.

### WebSocket managed by API Server

The API Server owns all WebSocket connections. Workers never hold open connections to the browser. This is the standard pattern for horizontally scaled systems: multiple API instances all subscribe to Redis Pub/Sub, so any instance can push to any client.

### JWT with short-lived access tokens

Access tokens expire in 15 minutes. The Axios interceptor catches `401` responses, silently calls `/auth/refresh`, and retries the original request. Refresh tokens are stored in httpOnly cookies and last 7 days.

### File storage abstraction

File I/O is handled through a storage abstraction. The current implementation uses MinIO (S3-compatible). Swapping to AWS S3 requires only a configuration change — no application code changes.

### Drizzle ORM with repository layer

All database access goes through repository classes in `packages/db/src/repositories/`. Services never call the database directly. This centralises query logic and makes services unit-testable with stub repositories.

---

## Backend Layer Responsibilities

```mermaid
flowchart TD
    A["Route Handler<br/>parse & validate HTTP request (Fastify JSON schema)"] --> B
    B["Service<br/>orchestrate business logic, throw typed domain errors"] --> C
    C["Repository<br/>SQL queries only, return typed domain objects"] --> D[("PostgreSQL / Redis / MinIO")]
```

---

## Data Flows

### 1. Authentication

```mermaid
sequenceDiagram
    participant Browser
    participant API as API Server
    participant DB as PostgreSQL

    Browser->>API: POST /api/v1/auth/login
    API->>DB: SELECT user
    DB-->>API: user row
    API->>API: verify bcrypt hash
    API-->>Browser: { accessToken, refreshToken }
```

- Access token: short-lived JWT (15 min), stored in Zustand memory store
- Refresh token: longer-lived JWT (7 days), stored in httpOnly cookie

### 2. File Upload

```mermaid
sequenceDiagram
    participant Browser
    participant API as API Server
    participant DB as PostgreSQL
    participant S as MinIO

    Browser->>API: POST /api/v1/files (multipart)
    API->>DB: INSERT file
    API->>S: write bytes
    API-->>Browser: 201 { file }
```

### 3. Job Submission and Processing

```mermaid
sequenceDiagram
    participant Browser
    participant API as API Server
    participant DB as PostgreSQL
    participant Q as Redis (BullMQ)
    participant W as Worker
    participant S as MinIO

    Browser->>API: POST /jobs
    API->>DB: INSERT job
    API->>Q: ENQUEUE
    API-->>Browser: 201 { job }
    Q->>W: CONSUME job
    W->>S: read
    W->>W: process
    W->>S: write
    W->>DB: UPDATE job
```

### 4. Real-Time Progress

```mermaid
sequenceDiagram
    participant W as Worker
    participant Q as Redis Pub/Sub
    participant API as API Server
    participant Browser as Browser (WebSocket)

    W->>Q: PUBLISH progress event
    Q->>API: notify
    API->>Browser: WS push { jobId, progress, status }
```

---

## Database Schema

### Entity Relationships

```mermaid
erDiagram
    USERS ||--o{ FILES : owns
    USERS ||--o{ JOBS : owns
    FILES ||--o{ JOBS : "processed by"
```

### Core Tables

**users**

| Column | Type | Notes |
|---|---|---|
| `id` | UUID PK | `gen_random_uuid()` |
| `email` | text unique | |
| `password_hash` | text | bcrypt |
| `created_at` | timestamptz | |
| `updated_at` | timestamptz | |
| `deleted_at` | timestamptz | soft delete |

**files**

| Column | Type | Notes |
|---|---|---|
| `id` | UUID PK | |
| `user_id` | UUID FK → users | |
| `original_name` | text | original filename from upload |
| `mime_type` | text | |
| `size` | bigint | bytes |
| `storage_path` | text | internal storage key, never exposed |
| `status` | text | `pending` \| `ready` \| `deleted` |
| `created_at` | timestamptz | |
| `deleted_at` | timestamptz | soft delete |

**jobs**

| Column | Type | Notes |
|---|---|---|
| `id` | UUID PK | |
| `user_id` | UUID FK → users | |
| `file_id` | UUID FK → files | |
| `job_type` | text | processing type enum |
| `status` | text | `pending` \| `processing` \| `completed` \| `failed` |
| `progress` | integer | 0–100 |
| `output_path` | text | storage key of processed result |
| `error` | text | error message if failed |
| `created_at` | timestamptz | |
| `started_at` | timestamptz | |
| `completed_at` | timestamptz | |

### Status State Machines

**File status:**
```mermaid
stateDiagram-v2
    [*] --> pending
    pending --> ready
    ready --> deleted
    pending --> deleted
```

**Job status:**
```mermaid
stateDiagram-v2
    [*] --> pending
    pending --> processing
    processing --> completed
    processing --> failed
```

---

## Scalability Notes

- **Workers** are stateless and can be horizontally scaled — BullMQ uses Redis locks to ensure each job is processed exactly once
- **API Server** is stateless for HTTP (JWT is self-verifying) — multiple instances can run behind a load balancer
- **WebSocket** scaling works with the Redis Pub/Sub approach: every API instance subscribes to all channels and can push to any connected client
- **File storage** is abstracted — switching from MinIO to AWS S3 requires only a configuration change
