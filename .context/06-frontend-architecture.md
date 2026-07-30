# Frontend Architecture

## Overview

The frontend is a React SPA built with TypeScript. It communicates with the backend exclusively through the REST API and a WebSocket connection managed by the API Server.

The architecture is component-driven, with a clear separation between UI components, page-level views, data-fetching hooks, and global state.

---

## State Management Strategy

Two distinct categories of state require different solutions:

| State Category | Tool | Examples |
|---|---|---|
| Server state | TanStack Query | File lists, job status, user profile |
| Client state | Zustand | Auth tokens, WebSocket connection, UI toggles |

**Server state** (data that lives in the backend) is managed entirely by TanStack Query. It handles caching, background refetching, loading and error states, and optimistic updates.

**Client state** (ephemeral in-memory state) is managed by Zustand stores. Stores are small and focused — one for auth, one for WebSocket, one for any global UI concerns.

---

## Key Concerns and Patterns

### Authentication
- Access token stored in memory (Zustand auth store), never in `localStorage`
- Refresh token in httpOnly cookie (managed by the browser)
- Axios instance configured with a request interceptor (attach access token) and a response interceptor (retry on 401 with refreshed token)
- Protected routes rendered only when the user is authenticated; unauthenticated users are redirected to `/login`

### File Upload UX
- Drag-and-drop and file picker both supported
- Upload progress shown via `onUploadProgress` callback in Axios
- Files are uploaded one at a time or in parallel (configurable)
- Immediate feedback: file appears in list with `uploading` state before the server confirms

### Real-Time Updates
- A single WebSocket connection is established after login and managed by a Zustand store
- The connection subscribes to job IDs as jobs are submitted
- TanStack Query cache is updated imperatively when a `job:completed` or `job:failed` event arrives, so components re-render without a full refetch
- Progress values drive a progress bar component updated on each `job:progress` event

### Loading and Error States
- TanStack Query provides `isLoading`, `isError`, `error` for every query — no manual loading flags
- A global error boundary catches unexpected rendering errors
- Axios errors are normalised into a consistent shape before being surfaced to the UI

### Pagination, Search, and Filtering
- Implemented as URL query parameters (React Router), making filtered views bookmarkable and shareable
- TanStack Query key includes filter params, so changing filters triggers a new fetch with automatic caching per unique param set

---

## Routing Structure

```
/                       → redirect to /dashboard
/login                  → Login page (public)
/dashboard              → File library — general file manager (protected, AppLayout)
/files/:id              → File detail + job history (protected, AppLayout)
/converter              → Converter pillar (protected, AppLayout)
/compressor             → Compressor pillar (protected, AppLayout)
/tools                  → Tools pillar (protected, AppLayout)
```

All protected routes share a single `AppLayout` that renders the top navigation bar (Files | Converter | Compressor | Tools), user info, and sign-out. Route children are injected via React Router's `<Outlet />`.

---

## Component Hierarchy Concepts

```
App
├── Router
│   ├── PublicLayout
│   │   ├── LoginPage
│   │   └── RegisterPage
│   └── ProtectedLayout  (requires auth)
│       ├── Navbar
│       ├── DashboardPage
│       │   ├── FileUploadZone
│       │   └── FileList
│       │       └── FileCard
│       ├── FileDetailPage
│       │   ├── FileMetadata
│       │   └── JobList
│       │       └── JobCard (with ProgressBar)
│       └── JobDetailPage
│           ├── JobInfo
│           └── ProgressBar
```

Components are categorised as:
- **Pages** — Route-level components, compose smaller units
- **Feature components** — Domain-specific UI (FileUploadZone, JobCard)
- **UI primitives** — Generic, reusable components (Button, Badge, ProgressBar, Modal)

---

## Data Fetching Conventions

- All server-data hooks live in a `hooks/` directory alongside their query keys
- Query keys are centralised (e.g. `queryKeys.files.list(filters)`) to allow targeted cache invalidation
- Mutations (upload, create job, delete) call `queryClient.invalidateQueries` on success to keep the UI in sync
- WebSocket-driven updates call `queryClient.setQueryData` directly for immediate zero-latency updates

---

## Folder Organisation (Frontend)

```
src/
├── api/            HTTP client, axios instance, API function wrappers
├── components/
│   ├── layout/     AppLayout (shared nav + Outlet wrapper)
│   └── ui/         Reusable UI primitives — FileDropZone, Button, Modal, etc.
├── features/       Domain feature modules, one per pillar + core
│   ├── files/      Upload, list, detail, job progress (core)
│   ├── converter/  Converter pillar pages and components
│   ├── compressor/ Compressor pillar pages and components
│   └── tools/      Tools pillar pages and components
├── hooks/          Shared custom hooks (useWebSocket, useDebounce, etc.)
├── pages/          Route-level page components
├── stores/         Zustand stores (authStore, wsStore)
├── router/         React Router config, ProtectedRoute wrapper
├── types/          TypeScript interfaces and enums (DTOs, domain models)
└── utils/          Pure helpers (formatBytes, formatDate, etc.)
```

### Shared UI: `FileDropZone`

`components/ui/FileDropZone` is a **presentational** drag-and-drop file input. It accepts an `onFiles` callback, making it reusable across all three pillars without coupling to any specific upload mutation. Feature-specific wrappers (e.g. `features/files/components/FileUploadZone`) wire in the appropriate hook.
