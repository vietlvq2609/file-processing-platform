# Contributing

Thank you for your interest in contributing. This document outlines the development workflow, conventions, and guidelines for working on the File Processing Platform.

---

## Table of Contents

- [Development Setup](#development-setup)
- [Project Conventions](#project-conventions)
- [Adding a New Feature](#adding-a-new-feature)
- [Testing](#testing)
- [Pull Request Guidelines](#pull-request-guidelines)
- [Code Style](#code-style)

---

## Development Setup

Follow the [Quick Start](README.md#quick-start) section in the README to get the project running locally.

Ensure the following tools are installed:

| Tool | Version |
|---|---|
| Node.js | ≥ 20 |
| pnpm | ≥ 9 |
| Docker | Latest stable |
| Docker Compose | v2 |

---

## Project Conventions

### Naming

| Artifact | Convention | Example |
|---|---|---|
| React components | `PascalCase` file + named export | `FileCard.tsx` → `export function FileCard` |
| React page components | `PascalCase` file + default export | `DashboardPage.tsx` → `export default function DashboardPage` |
| Services / Repositories | `PascalCase` file + named export | `FileService.ts` → `export class FileService` |
| Hooks | `camelCase` prefixed with `use` | `useJobWebSocket.ts` |
| Utility functions | `camelCase` | `formatBytes.ts` |
| Directories | `lowercase` or `kebab-case`, plural for groupings | `routes/`, `services/` |
| Test files | Co-located, same name + `.test.ts` | `FileService.test.ts` |

### TypeScript

- **No `any`** — use `unknown` and narrow with type guards; `any` is a lint error
- **No non-null assertions (`!`)** without an inline comment explaining why the value is guaranteed
- **No implicit returns** — all functions return an explicit type or use inference from a typed return value
- Strict mode is enabled; the compiler will tell you when something is wrong

### Backend

- **Routes → Services → Repositories** — no database access in route handlers, no HTTP knowledge in services
- **Typed domain errors** — throw `NotFoundError`, `ForbiddenError`, etc. from services; the central error handler maps them to HTTP status codes
- **No `console.log`** — use the Pino logger (`request.log`, `server.log`, or injected logger)
- Every Fastify route must define a JSON schema for request and response shapes

### Frontend

- **TanStack Query for all server data** — no `useEffect` + `fetch` patterns
- **Query key factory** — always use `queryKeys.<domain>.<method>(params)` from `utils/queryKeys.ts`
- **Mutations** call `queryClient.invalidateQueries` or `queryClient.setQueryData` on success
- **No `localStorage` for tokens** — access tokens live in the Zustand memory store only
- **`async/await` everywhere** — no `.then()` chains except inside Axios interceptors

---

## Adding a New Feature

Follow this sequence in order:

1. **Define types** in `packages/types/src/` — domain types, enums, API request/response shapes
2. **Update Drizzle schema** in `packages/db/src/schema/` — add/alter tables and relations
3. **Generate and run migration** — `pnpm db:generate && pnpm db:migrate`
4. **Add repository method(s)** in `apps/api/src/repositories/` — one method per data operation
5. **Add service method(s)** in `apps/api/src/services/` — orchestrate repository calls, throw typed errors
6. **Add route handler(s)** in `apps/api/src/routes/` — Fastify JSON schema + service call + response
7. **Add query key(s)** in `apps/web/src/utils/queryKeys.ts`
8. **Add API client function(s)** in `apps/web/src/api/`
9. **Build UI** in `apps/web/src/features/<feature>/`
10. **Write unit tests** co-located next to the file under test (`*.test.ts`)

---

## Testing

Tests are co-located with source files (`FileService.test.ts` next to `FileService.ts`).

```bash
# Run all tests
pnpm test

# Run tests in a specific package
pnpm --filter @fpp/api test
pnpm --filter @fpp/web test

# Run with coverage
pnpm test:coverage
```

### What to test

- **Services** — unit-test business logic with stubbed repositories
- **Repositories** — integration-test against a real (or in-memory) database
- **React components** — test user interactions and query/mutation behaviour with React Testing Library

Test factories and stubs live in `apps/api/src/test/`.

---

## Pull Request Guidelines

1. **Branch from `main`** and use a descriptive branch name: `feat/file-download`, `fix/token-refresh`, `docs/api-reference`
2. **Keep PRs focused** — one logical change per PR
3. **All tests must pass** before requesting review
4. **No lint or TypeScript errors** — run `pnpm lint` and `pnpm build` locally
5. **Describe the change** in the PR description: what changed, why, and any notable decisions
6. **Link related issues** if applicable

---

## Code Style

Formatting is enforced by Prettier and linting by ESLint. Both run automatically on commit via Husky + lint-staged.

To run manually:

```bash
pnpm lint          # Check for lint errors
pnpm lint:fix      # Auto-fix lint errors
pnpm format        # Format all files
pnpm format:check  # Check formatting without writing
```

Configuration files:
- `.prettierrc` — Prettier rules
- `eslint.config.js` — ESLint rules (flat config)
