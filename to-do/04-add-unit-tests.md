# Ticket 04 — Add Unit Test Infrastructure and Baseline Tests

## Problem

The project has zero tests. No test runner, no configuration, no test files, no scripts. This is
the highest-risk gap for AI-assisted development: without tests, AI-generated code has no
automated verification, regressions are invisible, and there is no forcing function to keep
services and repositories well-factored.

The architecture is structurally test-friendly (constructor injection, typed errors, pure
functions), but this advantage is unrealised until tests are written.

### Specific gaps:

1. **No test runner configured** — `pnpm test` resolves to nothing at the root level.
2. **No test scripts in any `package.json`** — each app/package is missing a `"test"` script.
3. **No test utilities** — no factory functions for domain objects, no in-memory repository stubs,
   no shared fixtures. Every test would need to manually construct objects from scratch.
4. **No coverage threshold** — without a minimum coverage gate, tests are optional by convention
   only. AI will generate code without tests and CI will pass.
5. **Worker processor tests are not possible** without a BullMQ `Job` mock — no pattern exists.
6. **Frontend hooks have no tests** — `useJobWebSocket` and `useRequiredParam` are non-trivial
   custom hooks with branching logic and zero coverage.

## Technology Choice

Use **Vitest** across all packages (API, worker, packages/db, packages/types, web). Reasons:
- Native ESM support (all packages use `"type": "module"`)
- Identical assertion API to Jest (low migration cost later)
- Built into Vite ecosystem (web app already uses Vite)
- Faster than Jest for TypeScript projects

Use **`@testing-library/react`** and **`@testing-library/user-event`** for web component/hook tests.

## Acceptance Criteria

### 1 — Vitest configuration per package

- [ ] Add `vitest.config.ts` to each of the following:
  - `apps/api/`
  - `apps/worker/`
  - `apps/web/`
  - `packages/db/` (for repository unit tests with a mocked Drizzle client)
- [ ] Each config sets:
  ```typescript
  // apps/api/vitest.config.ts (example)
  import { defineConfig } from 'vitest/config'
  export default defineConfig({
    test: {
      environment: 'node',
      include: ['src/**/*.test.ts'],
      coverage: {
        provider: 'v8',
        thresholds: { lines: 80, functions: 80 },
        include: ['src/services/**', 'src/repositories/**'],
      },
    },
  })
  ```
- [ ] Web app uses `environment: 'jsdom'` and includes `setupFiles` for Testing Library.

### 2 — Test scripts in each package.json

- [ ] Add to each `apps/*/package.json` and `packages/*/package.json`:
  ```json
  "test": "vitest run",
  "test:watch": "vitest",
  "test:coverage": "vitest run --coverage"
  ```
- [ ] Add to root `package.json`:
  ```json
  "test": "pnpm -r test",
  "test:coverage": "pnpm -r test:coverage"
  ```

### 3 — Test utilities / fixtures

- [ ] Create `apps/api/src/test/factories.ts` with builder functions:
  ```typescript
  // Returns a valid User domain object with sensible defaults
  export function buildUser(overrides?: Partial<User>): User { ... }
  export function buildFile(overrides?: Partial<FileRecord>): FileRecord { ... }
  export function buildJob(overrides?: Partial<Job>): Job { ... }
  ```
- [ ] Create `apps/api/src/test/stubs/` with in-memory stub repositories:
  ```typescript
  // InMemoryUserRepository implements IUserRepository
  // Stores data in a Map, no DB required
  export class InMemoryUserRepository implements IUserRepository { ... }
  export class InMemoryFileRepository implements IFileRepository { ... }
  export class InMemoryJobRepository implements IJobRepository { ... }
  ```
  > This is why Ticket 02 (interfaces) must be completed first.

### 4 — Baseline service unit tests

Write tests for the three main services using the in-memory stubs. Target the happy path and the
most important error branches.

**`apps/api/src/services/AuthService.test.ts`:**
- [ ] `register()` — creates user and returns tokens
- [ ] `register()` — throws `ConflictError` when email already exists
- [ ] `login()` — returns tokens on valid credentials
- [ ] `login()` — throws `UnauthorizedError` on wrong password
- [ ] `login()` — throws `UnauthorizedError` on unknown email
- [ ] `refresh()` — returns new access token on valid refresh token
- [ ] `refresh()` — throws `UnauthorizedError` on reuse detection (hash mismatch)
- [ ] `logout()` — clears the refresh token hash

**`apps/api/src/services/FileService.test.ts`:**
- [ ] `upload()` — creates file record with correct userId and storagePath
- [ ] `findById()` — throws `NotFoundError` when file does not exist
- [ ] `findById()` — throws `NotFoundError` when file belongs to a different user
- [ ] `delete()` — soft-deletes (sets status='deleted'), does not hard-delete

**`apps/api/src/services/JobService.test.ts`:**
- [ ] `create()` — creates job and enqueues to BullMQ (mock the queue)
- [ ] `create()` — throws `NotFoundError` when file does not exist
- [ ] `cancel()` — cancels a pending job
- [ ] `cancel()` — throws error when job is not in `pending` state

### 5 — Baseline worker processor test

**`apps/worker/src/processors/defaultProcessor.test.ts`:**
- [ ] Mock a BullMQ `Job` object with `updateProgress()` spy
- [ ] Mock `IJobRepository` with `updateStatus()` spy
- [ ] Mock Redis `publish()` spy
- [ ] Assert that after `process()`: status transitions `pending → active → completed`,
      `updateProgress` was called, and Redis `publish` was called for progress events.

### 6 — Baseline frontend hook test

**`apps/web/src/hooks/useRequiredParam.test.ts`:**
- [ ] Returns the param value when it exists in the URL
- [ ] Throws (or triggers error boundary) when the param is missing

## Files to Create

```
apps/api/vitest.config.ts
apps/api/src/test/factories.ts
apps/api/src/test/stubs/InMemoryUserRepository.ts
apps/api/src/test/stubs/InMemoryFileRepository.ts
apps/api/src/test/stubs/InMemoryJobRepository.ts
apps/api/src/services/AuthService.test.ts
apps/api/src/services/FileService.test.ts
apps/api/src/services/JobService.test.ts
apps/worker/vitest.config.ts
apps/worker/src/processors/defaultProcessor.test.ts
apps/web/vitest.config.ts
apps/web/src/test/setup.ts  (Testing Library setup)
apps/web/src/hooks/useRequiredParam.test.tsx
packages/db/vitest.config.ts
```

## Dependencies to Install

```bash
# API and Worker
pnpm add -D vitest @vitest/coverage-v8 --filter @fpp/api --filter @fpp/worker

# Web
pnpm add -D vitest @vitest/coverage-v8 jsdom \
  @testing-library/react @testing-library/user-event \
  @testing-library/jest-dom --filter @fpp/web

# DB package
pnpm add -D vitest @vitest/coverage-v8 --filter @fpp/db
```

## Ordering Dependency

**This ticket depends on Ticket 02 (interfaces)** being complete first, because the in-memory
stub repositories must implement the `IRepository` interfaces defined there. Do not start
writing tests until the interfaces exist.

## Verification

```bash
pnpm test              # all tests pass
pnpm test:coverage     # coverage >= 80% for services and repositories
```
