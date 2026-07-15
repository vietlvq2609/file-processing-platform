# Project Structure & Folder Organisation

## Monorepo Layout

The project uses a monorepo structure. Frontend, API, and Worker are separate applications under `apps/`. Shared code lives under `packages/`.

```
file-processing-platform/
│
├── apps/
│   ├── frontend/               React SPA
│   ├── api/                    Fastify API Server
│   └── worker/                 BullMQ Worker Service
│
├── packages/
│   ├── types/                  Shared TypeScript interfaces (DTOs, domain models)
│   ├── db/                     Drizzle schema, migrations, and shared db client factory
│   └── config/                 Shared environment variable parsing
│
├── infra/
│   ├── docker/
│   │   ├── api.Dockerfile
│   │   ├── worker.Dockerfile
│   │   └── frontend.Dockerfile
│   ├── nginx/
│   │   └── nginx.conf
│   └── postgres/
│       └── seeds/              Development seed data (SQL)
│
├── .context/                   GitHub Copilot context and project documentation
├── docker-compose.yml
├── docker-compose.override.yml (local dev overrides, not committed)
├── .env.example
├── package.json                Workspace root (npm/pnpm workspaces)
└── README.md
```

---

## Frontend Structure (`apps/frontend/`)

```
apps/frontend/
├── public/
├── src/
│   ├── api/
│   │   ├── client.ts           Axios instance with interceptors
│   │   ├── auth.ts             Auth API functions
│   │   ├── files.ts            File API functions
│   │   └── jobs.ts             Job API functions
│   │
│   ├── components/             Reusable UI primitives
│   │   ├── ui/                 Base components (Button, Input, Badge, Modal)
│   │   └── layout/             Layout components (Navbar, Sidebar, PageWrapper)
│   │
│   ├── features/               Domain feature modules
│   │   ├── auth/
│   │   │   ├── components/     LoginForm, RegisterForm
│   │   │   └── hooks/          useLogin, useRegister, useLogout
│   │   ├── files/
│   │   │   ├── components/     FileUploadZone, FileCard, FileList, FileDetail
│   │   │   └── hooks/          useFiles, useFile, useUploadFile, useDeleteFile
│   │   └── jobs/
│   │       ├── components/     JobCard, JobList, ProgressBar, JobStatusBadge
│   │       └── hooks/          useJobs, useJob, useCreateJob, useJobProgress
│   │
│   ├── hooks/                  Cross-feature shared hooks
│   │   ├── useWebSocket.ts
│   │   └── useDebounce.ts
│   │
│   ├── pages/                  Route-level page components
│   │   ├── LoginPage.tsx
│   │   ├── RegisterPage.tsx
│   │   ├── DashboardPage.tsx
│   │   ├── FileDetailPage.tsx
│   │   └── JobDetailPage.tsx
│   │
│   ├── router/
│   │   ├── index.tsx           React Router configuration
│   │   └── ProtectedRoute.tsx
│   │
│   ├── stores/
│   │   ├── authStore.ts        Zustand: user, access token, auth status
│   │   └── wsStore.ts          Zustand: WebSocket connection, subscriptions
│   │
│   ├── types/
│   │   ├── api.ts              API response shapes, DTOs
│   │   └── domain.ts           Domain model interfaces (User, File, Job)
│   │
│   └── utils/
│       ├── formatBytes.ts
│       ├── formatDate.ts
│       └── queryKeys.ts        Centralised TanStack Query key factory
│
├── index.html
├── vite.config.ts
└── tsconfig.json
```

---

## API Server Structure (`apps/api/`)

```
apps/api/
└── src/
    ├── server.ts               Fastify app factory, plugin and route registration
    ├── index.ts                Entry point, starts server
    │
    ├── plugins/
    │   ├── database.ts         Drizzle ORM client plugin (registers db on Fastify instance)
    │   ├── redis.ts            Redis client plugin
    │   ├── auth.ts             JWT plugin, decorates request with user
    │   └── multipart.ts        File upload plugin (@fastify/multipart)
    │
    ├── routes/
    │   ├── auth/
    │   │   ├── index.ts        Route definitions
    │   │   └── schemas.ts      Fastify JSON schemas for validation
    │   ├── files/
    │   │   ├── index.ts
    │   │   └── schemas.ts
    │   └── jobs/
    │       ├── index.ts
    │       └── schemas.ts
    │
    ├── services/
    │   ├── AuthService.ts
    │   ├── FileService.ts
    │   └── JobService.ts
    │
    ├── repositories/
    │   ├── UserRepository.ts
    │   ├── FileRepository.ts
    │   └── JobRepository.ts
    │
    ├── ws/
    │   ├── WebSocketManager.ts Connection registry, subscribe/broadcast
    │   └── handlers.ts         Incoming WS message handlers
    │
    ├── queue/
    │   └── jobProducer.ts      BullMQ Queue instance, enqueue helper
    │
    ├── middleware/
    │   └── errorHandler.ts     Centralized Fastify error handler
    │
    └── types/
        └── index.ts            Internal type augmentations, FastifyRequest extension
```

---

## Worker Service Structure (`apps/worker/`)

```
apps/worker/
└── src/
    ├── worker.ts               BullMQ Worker setup, processor dispatch
    ├── index.ts                Entry point
    │
    ├── processors/
    │   └── fileProcessor.ts    Core processing logic for the default job type
    │
    ├── services/
    │   ├── storageService.ts   File read/write from storage volume
    │   └── progressService.ts  Redis Pub/Sub progress publisher
    │
    └── repositories/
        └── JobRepository.ts    Job status + output path updates
```

---

## Shared DB Package (`packages/db/`)

```
packages/db/
├── src/
│   ├── index.ts                Re-exports schema, types, and createDb factory
│   ├── client.ts               createDb(connectionString): DrizzleClient factory
│   └── schema/
│       ├── index.ts            Barrel export of all tables
│       ├── users.ts            users table definition
│       ├── files.ts            files table definition
│       └── jobs.ts             jobs table definition
│
├── drizzle/                    Generated migration files (drizzle-kit output)
│   └── *.sql
│
├── drizzle.config.ts           drizzle-kit configuration
└── tsconfig.json
```

---

## Naming Conventions

| Concern | Convention |
|---|---|
| Files | `camelCase.ts` for modules, `PascalCase.tsx` for React components |
| Variables / functions | `camelCase` |
| Types / interfaces | `PascalCase` |
| Database columns | `snake_case` |
| Environment variables | `UPPER_SNAKE_CASE` |
| API routes | `kebab-case` (`/api/files/:id/download`) |
| CSS classes (if used) | `kebab-case` |
| Docker service names | `kebab-case` |
