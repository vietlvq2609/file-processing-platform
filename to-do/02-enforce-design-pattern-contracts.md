# Ticket 02 — Enforce Design Pattern Contracts

## Problem

The project follows a clean layered architecture (Routes → Services → Repositories → Drizzle → DB)
and this is consistently applied. However, the patterns are informal — held together by convention
rather than code contracts. This creates three specific structural problems:

### Problem A — No Repository Interfaces

All repositories are concrete classes with no interface. There is no `IUserRepository`,
`IFileRepository`, or `IJobRepository`. This means:
- You cannot swap implementations (e.g., an in-memory stub for unit tests) without modifying call
  sites or using `jest.mock` / module patching.
- AI agents generating new services will not know what contract to depend on — they will import
  the concrete class directly, coupling layers.

### Problem B — `JobRepository` is Duplicated

`apps/api/src/repositories/JobRepository.ts` and `apps/worker/src/repositories/JobRepository.ts`
are two separate, diverging files. They both query the same `jobs` table via Drizzle. When the
schema changes (e.g., adding a new column), both files must be updated manually. One will
inevitably drift, causing silent bugs.

The correct location for shared repository code is `packages/db/src/` since it already owns the
schema and the Drizzle client factory.

### Problem C — No Processor Contract

`apps/worker/src/processors/defaultProcessor.ts` is a stub (fake progress loop). Real processors
(e.g., image compression via sharp, video conversion via ffmpeg) will be added. Currently there is
no interface defining what a processor must implement, so each new processor will have an ad-hoc
signature and inconsistent progress/error reporting.

## Current File Structure

```
apps/api/src/repositories/
  FileRepository.ts      ← concrete class, no interface
  JobRepository.ts       ← concrete class, duplicated
  UserRepository.ts      ← concrete class, no interface

apps/worker/src/repositories/
  JobRepository.ts       ← DUPLICATE of api version

packages/db/src/
  client.ts              ← Drizzle client factory
  schema/                ← schema definitions
  index.ts               ← exports schema + client

apps/worker/src/processors/
  defaultProcessor.ts    ← stub, no interface contract
```

## Acceptance Criteria

### A — Repository Interfaces

- [ ] Create interface files alongside (or above) each repository:
  - `apps/api/src/repositories/interfaces/IUserRepository.ts`
  - `apps/api/src/repositories/interfaces/IFileRepository.ts`
  - `apps/api/src/repositories/interfaces/IJobRepository.ts`
- [ ] Each interface defines the method signatures with full TypeScript types (input params and
      return types using types from `packages/types`).
- [ ] Concrete repository classes implement (`implements`) their interface.
- [ ] Services depend on the interface type, not the concrete class, in their constructor
      signatures.
- [ ] Example structure for `IJobRepository`:
  ```typescript
  export interface IJobRepository {
    create(data: CreateJobData): Promise<Job>
    findAllByUser(userId: string, opts: PaginationOptions): Promise<PaginatedResult<Job>>
    findById(userId: string, jobId: string): Promise<Job | null>
    updateStatus(jobId: string, update: JobStatusUpdate): Promise<void>
    cancel(userId: string, jobId: string): Promise<void>
  }
  ```

### B — Deduplicate JobRepository

- [ ] Move the canonical `JobRepository` (and its interface) into `packages/db/src/repositories/`.
- [ ] Update `packages/db/src/index.ts` to export the repository class and interface.
- [ ] Update `apps/api` to import `JobRepository` from `@fpp/db`.
- [ ] Update `apps/worker` to import `JobRepository` from `@fpp/db`.
- [ ] Delete `apps/worker/src/repositories/JobRepository.ts`.
- [ ] Verify both apps still compile (`pnpm build`).

  > Note: `packages/db` already has `@fpp/api` and `@fpp/worker` as dependents via workspace
  > references, so no new `package.json` changes are needed.

### C — Processor Interface

- [ ] Create `apps/worker/src/processors/IProcessor.ts`:
  ```typescript
  import type { Job } from 'bullmq'
  import type { JobPayload } from '@fpp/types'
  import type { IJobRepository } from '@fpp/db'
  import type { Redis } from 'ioredis'

  export interface IProcessor {
    process(job: Job<JobPayload>, jobRepo: IJobRepository, redis: Redis): Promise<void>
  }
  ```
- [ ] Update `defaultProcessor.ts` to conform to `IProcessor`.
- [ ] Update the worker dispatch in `apps/worker/src/worker.ts` to call processors through the
      `IProcessor` interface.

## Files to Modify / Create

| Action | Path |
|---|---|
| Create | `apps/api/src/repositories/interfaces/IUserRepository.ts` |
| Create | `apps/api/src/repositories/interfaces/IFileRepository.ts` |
| Create | `apps/api/src/repositories/interfaces/IJobRepository.ts` |
| Modify | `apps/api/src/repositories/UserRepository.ts` — add `implements` |
| Modify | `apps/api/src/repositories/FileRepository.ts` — add `implements` |
| Modify | `apps/api/src/repositories/JobRepository.ts` — add `implements`, move to db pkg |
| Create | `packages/db/src/repositories/JobRepository.ts` |
| Modify | `packages/db/src/index.ts` — export repo + interface |
| Delete | `apps/worker/src/repositories/JobRepository.ts` |
| Modify | `apps/worker/src/worker.ts` — update import |
| Create | `apps/worker/src/processors/IProcessor.ts` |
| Modify | `apps/worker/src/processors/defaultProcessor.ts` — implement interface |

## Verification

```bash
pnpm build          # must pass with zero TS errors
pnpm lint           # must pass with zero new violations
```
