# Ticket 05 — Fix Development Setup and Add CI Pipeline

## Problem

The development setup works for the original author but has several gaps that block new
contributors, break automation, and make AI-generated setup instructions unreliable:

1. **No README.md** — There is no documentation of the first-run sequence. A new developer (or AI
   agent) has no canonical reference for the order of operations: start infra → configure env →
   install deps → migrate DB → seed → run dev servers.

2. **No `typecheck` script** — In dev mode, `tsx watch` transpiles TypeScript without type-checking
   (intentional for speed). The only way to catch type errors today is to run `pnpm build`, which
   compiles all packages. There is no lightweight `tsc --noEmit` script to run in CI or as a
   pre-commit step.

3. **TypeScript version mismatch** — `apps/api/package.json` has `"typescript": "^7.0.2"` while
   the root and all other packages have `"^5.4.0"`. Running pnpm in the monorepo can result in
   two different TypeScript binaries being resolved for different packages. This causes:
   - Inconsistent type errors between packages
   - Unpredictable behavior when editor tooling picks up different versions
   - AI-generated code tuned for one version may fail on the other

4. **No CI pipeline** — No `.github/workflows/` directory exists. No automated validation runs on
   pull requests. Lint errors, type errors, failing tests, and broken builds are only caught
   locally (and only if the developer runs the checks manually).

5. **`db:seed` depends on a hardcoded Docker container name** — The script is:
   ```json
   "db:seed": "docker exec -i fpp-postgres psql -U postgres ..."
   ```
   If the container is named differently (e.g., the Docker Compose project name changes), the
   command silently fails. This should use a connection URL instead, or at minimum document the
   assumption clearly.

6. **No worker health signal in dev** — The worker runs with `tsx watch` but has no readiness
   endpoint or health-check. When debugging, there is no way to confirm the worker is connected
   to Redis and consuming jobs vs. crashed silently.

## Acceptance Criteria

### 1 — Add `README.md`

- [ ] Create `/README.md` at the repository root with the following sections:
  - **Overview** — one paragraph describing what the project is
  - **Tech Stack** — table of technologies per layer (copy from context files, keep brief)
  - **Prerequisites** — Node.js version, pnpm version, Docker
  - **First Run (step by step)**:
    1. `git clone` the repo
    2. `cp .env.example .env` and fill in required values
    3. `pnpm install`
    4. `docker compose up -d` (starts Postgres, Redis, MinIO)
    5. `pnpm db:migrate`
    6. `pnpm db:seed`
    7. `pnpm dev`
  - **Available Scripts** — table of all root-level `pnpm` scripts and what they do
  - **Project Structure** — brief directory tree with one-line descriptions
  - **Architecture** — link to `.context/02-architecture-overview.md`

### 2 — Add `typecheck` scripts

- [ ] Add to each `apps/*/package.json` and `packages/*/package.json`:
  ```json
  "typecheck": "tsc --noEmit"
  ```
- [ ] Add to root `package.json`:
  ```json
  "typecheck": "pnpm -r typecheck"
  ```
- [ ] Verify `pnpm typecheck` passes with zero errors across the entire monorepo.

### 3 — Unify TypeScript version

- [ ] Decide on a single TypeScript version for the entire monorepo. Use the latest stable `^5.x`
      (current LTS) unless there is a deliberate reason to use `^7.x`.
- [ ] Set the chosen version in the root `package.json` `devDependencies`.
- [ ] Remove the TypeScript `devDependency` from `apps/api/package.json` (let it hoist from root),
      OR use pnpm's `catalog:` feature in `pnpm-workspace.yaml` to pin a single version:
      ```yaml
      # pnpm-workspace.yaml
      catalog:
        typescript: ^5.8.3
      ```
      Then reference `"typescript": "catalog:"` in all `package.json` files.
- [ ] Run `pnpm install` and `pnpm typecheck` to confirm no regressions.

### 4 — Add GitHub Actions CI workflow

- [ ] Create `.github/workflows/ci.yml` that runs on every push and pull request to `main`:

  ```yaml
  name: CI

  on:
    push:
      branches: [main]
    pull_request:
      branches: [main]

  jobs:
    validate:
      runs-on: ubuntu-latest
      steps:
        - uses: actions/checkout@v4

        - uses: pnpm/action-setup@v4
          with:
            version: 9

        - uses: actions/setup-node@v4
          with:
            node-version: 22
            cache: pnpm

        - name: Install dependencies
          run: pnpm install --frozen-lockfile

        - name: Build shared packages
          run: pnpm --filter @fpp/types build && pnpm --filter @fpp/db build

        - name: Type check
          run: pnpm typecheck

        - name: Lint
          run: pnpm lint

        - name: Format check
          run: pnpm format:check

        - name: Test
          run: pnpm test
  ```

- [ ] Confirm the workflow file is valid YAML and all referenced scripts exist in `package.json`.

### 5 — Fix `db:seed` robustness

- [ ] Replace the `db:seed` script with one that uses the `DATABASE_URL` environment variable
      directly so it is not tied to a specific container name:
  ```json
  "db:seed": "dotenv -e .env -- psql $DATABASE_URL -f infra/postgres/seeds/01_test_user.sql"
  ```
  Or document the assumption in a comment near the script and in the README so it is explicit.
- [ ] Add a prerequisite note in the README that `db:seed` requires the Docker container to be
      running with the project name `fpp`.

### 6 — Worker startup log

- [ ] In `apps/worker/src/worker.ts`, add a startup log message using the logger when the BullMQ
      worker is ready and connected to Redis:
  ```typescript
  worker.on('ready', () => {
    logger.info('Worker ready — connected to Redis and consuming jobs queue')
  })
  ```
- [ ] Add an error log handler:
  ```typescript
  worker.on('error', (err) => {
    logger.error({ err }, 'Worker error')
  })
  ```
  This provides a clear dev-time signal instead of a silent crash.

## Files to Create / Modify

| Action | Path |
|---|---|
| Create | `README.md` |
| Create | `.github/workflows/ci.yml` |
| Modify | `package.json` (root) — add `typecheck` and `test` scripts |
| Modify | `apps/api/package.json` — add `typecheck`, fix TS version |
| Modify | `apps/worker/package.json` — add `typecheck` |
| Modify | `apps/web/package.json` — add `typecheck` |
| Modify | `packages/db/package.json` — add `typecheck` |
| Modify | `packages/types/package.json` — add `typecheck` |
| Modify | `pnpm-workspace.yaml` — add catalog for TypeScript version (optional) |
| Modify | `apps/worker/src/worker.ts` — add ready/error event handlers |

## Verification

```bash
pnpm install            # clean install, no version conflicts
pnpm typecheck          # zero type errors
pnpm lint               # zero lint errors
pnpm test               # all tests pass (after Ticket 04)
pnpm build              # full production build succeeds
```

## Ordering Notes

- This ticket can be worked in parallel with Ticket 01, 02, and 03.
- The CI workflow's `test` step will fail until Ticket 04 is complete. That is acceptable — add the
  step now and let it fail; it will pass once tests are added.
- Complete the TypeScript version unification (step 3) before running `pnpm typecheck` to avoid
  false positives from version mismatches.
