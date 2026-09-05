<p align="center">
  <img src="apps/web/public/images/logo.png" width="112" alt="File Processing Platform logo" />
</p>

<h1 align="center">File Processing Platform</h1>

<p align="center">
  A production-grade, full-stack file processing platform demonstrating modern engineering patterns<br/>
  across a React frontend, Fastify API, background worker, and multi-container Docker infrastructure.
</p>

<p align="center">
  <img alt="React" src="https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=white&style=flat-square" />
  <img alt="TypeScript" src="https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white&style=flat-square" />
  <img alt="Fastify" src="https://img.shields.io/badge/Fastify-v5-000000?logo=fastify&logoColor=white&style=flat-square" />
  <img alt="PostgreSQL" src="https://img.shields.io/badge/PostgreSQL-16-4169E1?logo=postgresql&logoColor=white&style=flat-square" />
  <img alt="Redis" src="https://img.shields.io/badge/Redis-7-DC382D?logo=redis&logoColor=white&style=flat-square" />
  <img alt="Docker" src="https://img.shields.io/badge/Docker-Compose-2496ED?logo=docker&logoColor=white&style=flat-square" />
  <img alt="License" src="https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square" />
</p>

> [!NOTE]
> **Portfolio project** — built to showcase async architecture, real-time communication, and clean separation of concerns rather than business complexity.

---

## Overview

Users upload files, submit them for background processing (convert, compress, or transform), and receive live progress updates via WebSocket. The architecture mirrors real-world systems like Cloudinary, Google Drive, and document-conversion services — a stateless API tier, a decoupled worker tier, and Redis as the integration backbone between them.

**Highlights:**

- 🔐 **Authentication** — JWT access + refresh tokens, automatic silent refresh via Axios interceptor
- 📁 **File Management** — Upload, list, search, download, and soft-delete files
- ⚙️ **Background Processing** — Async job queue (BullMQ/Redis) with retry support
- 📡 **Real-Time Progress** — WebSocket push from Worker → Redis Pub/Sub → API → Browser
- 🧰 **Three Processing Pillars** — Converter, Compressor, and Tools
- 🔒 **User-scoped data** — every query is filtered by `user_id`; no cross-user data leaks

---

## Architecture

```mermaid
flowchart TB
    classDef frontend fill:#61DAFB,stroke:#1b6a80,color:#0b2b33,font-weight:bold
    classDef backend fill:#2f855a,stroke:#1c4532,color:#ffffff,font-weight:bold
    classDef infra fill:#ed8936,stroke:#7b341e,color:#ffffff,font-weight:bold
    classDef data fill:#4169E1,stroke:#1a2f6b,color:#ffffff,font-weight:bold

    Browser["🌐 Browser<br/>React SPA"]:::frontend
    Nginx["Nginx<br/>Reverse Proxy"]:::infra
    API["API Server<br/>Fastify"]:::backend
    Worker["Worker<br/>BullMQ Consumer"]:::backend
    PG[("PostgreSQL")]:::data
    Redis[("Redis<br/>Queue + Pub/Sub")]:::data
    MinIO[("MinIO<br/>File Storage")]:::data

    Browser -- "HTTP / WebSocket" --> Nginx
    Nginx --> API
    API --> PG
    API --> MinIO
    API <--> Redis
    Redis <--> Worker
    Worker --> PG
    Worker --> MinIO
```

Full service boundaries, key design decisions, repository structure, and database schema are documented in [docs/architecture.md](docs/architecture.md).

---

## How It Works

An upload flows through every service in the platform before the browser sees a live progress update:

```mermaid
sequenceDiagram
    actor User
    participant Web as React SPA
    participant API as API Server
    participant DB as PostgreSQL
    participant Q as Redis (BullMQ + Pub/Sub)
    participant W as Worker
    participant S as MinIO

    User->>Web: Upload file & start job
    Web->>API: POST /api/v1/files, /api/v1/jobs
    API->>DB: Insert file & job rows
    API->>S: Store raw file
    API->>Q: Enqueue job
    API-->>Web: 201 Created { jobId }
    Web->>API: Open WebSocket /ws
    Q->>W: Deliver job
    W->>S: Read input file
    W->>W: Process (convert / compress / tool)
    W->>S: Write output file
    W->>DB: Update job status & progress
    W->>Q: Publish progress event
    Q-->>API: Progress event (subscriber)
    API-->>Web: WS push { jobId, progress, status }
    Web-->>User: Live progress bar update
```

---

## Tech Stack

**Frontend**
<br/>
<img alt="React" src="https://img.shields.io/badge/React_18-61DAFB?logo=react&logoColor=white&style=flat-square" />
<img alt="TypeScript" src="https://img.shields.io/badge/TypeScript-3178C6?logo=typescript&logoColor=white&style=flat-square" />
<img alt="React Router" src="https://img.shields.io/badge/React_Router_v6-CA4245?logo=reactrouter&logoColor=white&style=flat-square" />
<img alt="TanStack Query" src="https://img.shields.io/badge/TanStack_Query_v5-FF4154?logo=reactquery&logoColor=white&style=flat-square" />
<img alt="Zustand" src="https://img.shields.io/badge/Zustand_v5-433E38?style=flat-square" />
<img alt="Axios" src="https://img.shields.io/badge/Axios-5A29E4?logo=axios&logoColor=white&style=flat-square" />
<img alt="Vite" src="https://img.shields.io/badge/Vite-646CFF?logo=vite&logoColor=white&style=flat-square" />

**API Server**
<br/>
<img alt="Node.js" src="https://img.shields.io/badge/Node.js-339933?logo=nodedotjs&logoColor=white&style=flat-square" />
<img alt="Fastify" src="https://img.shields.io/badge/Fastify_v5-000000?logo=fastify&logoColor=white&style=flat-square" />
<img alt="Drizzle ORM" src="https://img.shields.io/badge/Drizzle_ORM-C5F74F?logo=drizzle&logoColor=black&style=flat-square" />
<img alt="BullMQ" src="https://img.shields.io/badge/BullMQ-DC382D?logo=redis&logoColor=white&style=flat-square" />
<img alt="ws" src="https://img.shields.io/badge/ws-WebSocket-black?style=flat-square" />
<img alt="JWT" src="https://img.shields.io/badge/JWT-black?logo=jsonwebtokens&logoColor=white&style=flat-square" />

**Worker**
<br/>
<img alt="Node.js" src="https://img.shields.io/badge/Node.js-339933?logo=nodedotjs&logoColor=white&style=flat-square" />
<img alt="BullMQ" src="https://img.shields.io/badge/BullMQ-DC382D?logo=redis&logoColor=white&style=flat-square" />
<img alt="Drizzle ORM" src="https://img.shields.io/badge/Drizzle_ORM-C5F74F?logo=drizzle&logoColor=black&style=flat-square" />
<img alt="ioredis" src="https://img.shields.io/badge/ioredis-DC382D?logo=redis&logoColor=white&style=flat-square" />

**Infrastructure**
<br/>
<img alt="PostgreSQL" src="https://img.shields.io/badge/PostgreSQL_16-4169E1?logo=postgresql&logoColor=white&style=flat-square" />
<img alt="Redis" src="https://img.shields.io/badge/Redis_7-DC382D?logo=redis&logoColor=white&style=flat-square" />
<img alt="MinIO" src="https://img.shields.io/badge/MinIO-C72E49?logo=minio&logoColor=white&style=flat-square" />
<img alt="Docker" src="https://img.shields.io/badge/Docker_Compose-2496ED?logo=docker&logoColor=white&style=flat-square" />
<img alt="Nginx" src="https://img.shields.io/badge/Nginx-009639?logo=nginx&logoColor=white&style=flat-square" />
<img alt="pnpm" src="https://img.shields.io/badge/pnpm_workspaces-F69220?logo=pnpm&logoColor=white&style=flat-square" />

---

## Quick Start

**Prerequisites:** [Docker](https://docs.docker.com/get-docker/) + Docker Compose v2

```bash
git clone https://github.com/vietlvq2609/file-processing-platform.git
cd file-processing-platform
cp .env.example .env       # set JWT_ACCESS_SECRET, JWT_REFRESH_SECRET, MINIO_SECRET_KEY
docker compose up          # starts Postgres, Redis, MinIO, API, Worker, Nginx
pnpm db:seed                # creates test@example.com / password123
```

| URL | Description |
|---|---|
| `http://localhost:3000` | React SPA (via Nginx) |
| `http://localhost:3001` | API Server (direct) |
| `http://localhost:9001` | MinIO Console |

> [!TIP]
> Running services natively without Docker, the full list of available scripts, and the production build path are covered in [docs/development.md](docs/development.md) and [docs/deployment.md](docs/deployment.md).

---

## Documentation

| Document | Description |
|---|---|
| [docs/architecture.md](docs/architecture.md) | System topology, repository structure, service boundaries, and key design decisions |
| [docs/api.md](docs/api.md) | REST and WebSocket API reference |
| [docs/development.md](docs/development.md) | Local dev setup, debugging, and testing guide |
| [docs/deployment.md](docs/deployment.md) | Docker deployment and environment configuration |

---

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for development workflow, coding conventions, and pull request guidelines.

---

## License

Distributed under the [MIT License](LICENSE).
