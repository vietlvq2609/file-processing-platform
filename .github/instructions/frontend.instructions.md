---
applyTo: apps/web/src/**
---

# Frontend Instructions

These instructions apply to all files under `apps/web/src/`.

## Data Fetching — TanStack Query Only

- Use `useQuery` / `useMutation` from `@tanstack/react-query` for **all** server state
- Never use `useEffect` + `fetch` or `useEffect` + `axios` to load data
- All query keys must come from the factory in `utils/queryKeys.ts` — do not inline key arrays
- Mutations must call `queryClient.invalidateQueries(...)` or `queryClient.setQueryData(...)` on success

## Auth & Token Storage

- Access tokens live **only** in the Zustand `authStore` (in-memory) — never `localStorage`, never `sessionStorage`
- The Axios client in `api/client.ts` reads the token from the store via an interceptor
- On 401, the interceptor attempts a token refresh; if that fails, it clears the store and redirects to `/login`

## Real-time Updates (WebSocket)

- The `useJobWebSocket` hook connects to the WebSocket endpoint and updates the TanStack Query cache imperatively on incoming messages
- Never poll for job progress — use WebSocket events exclusively
- WebSocket state (connection status, last message) lives in the Zustand `wsStore`

## Routing

- All authenticated routes are wrapped in `<ProtectedRoute>` — unauthenticated users are redirected to `/login`
- React Router v6 `<Outlet>` is used for nested layouts
- Page components use **default exports** (`export default function DashboardPage`)

## Component & File Conventions

- Shared UI primitives live in `components/ui/`
- Feature-specific components, hooks, and pages live in `features/<feature>/`
- Page-level route components live in `pages/`
- Hooks are prefixed with `use` and live in `hooks/` (shared) or co-located in `features/<feature>/`
- Named exports everywhere except page-level route components

## Styling

- No third-party UI component libraries (MUI, Chakra, shadcn, etc.)
- Build UI primitives from scratch to demonstrate UI skills

## Anti-Patterns (frontend)

- ❌ `useEffect(() => { fetch('/api/...') }, [])` — use `useQuery` instead
- ❌ `localStorage.setItem('token', ...)` — store tokens in Zustand only
- ❌ Inline query key arrays (`useQuery({ queryKey: ['files'] })`) — use `queryKeys` factory
- ❌ `.then()` chains — use `async/await` (exception: Axios interceptors)
- ❌ `any` type — use `unknown` and narrow with type guards
- ❌ Non-null assertions (`value!`) without an explanatory comment
