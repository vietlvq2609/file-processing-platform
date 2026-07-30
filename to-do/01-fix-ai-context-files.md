# Ticket 01 — Fix & Harden AI Context Files

## Problem

The project has a `.context/` directory with `copilot-instructions.md` and 9 supporting architecture
markdown files. These files are the primary source of truth that GitHub Copilot (and any AI agent)
uses to generate consistent, architecture-aligned code. However, several issues make the context
unreliable or incomplete:

1. **Stale path references** — `copilot-instructions.md` says `apps/frontend/` but the actual
   directory is `apps/web/`. AI will generate wrong import paths.
2. **Stale version references** — The file describes Fastify v4 patterns (e.g. `fastify.register`)
   but the project uses Fastify v5, which has breaking API differences in plugin registration and
   error handling. AI will produce incompatible code.
3. **No anti-patterns section** — The file only describes what TO do. Without an explicit list of
   forbidden patterns, AI defaults to common internet patterns that violate project conventions
   (e.g., raw SQL in routes, `localStorage` for tokens, `useEffect`+`fetch` for data fetching).
4. **No naming conventions** — File naming (when to use PascalCase vs. kebab-case), export style
   (named vs. default), and directory placement rules are not documented. AI will be inconsistent.
5. **No feature-addition checklist** — There is no documented sequence for adding a new feature
   end-to-end. AI will skip steps (e.g., forget to add a query key, forget to create a repository
   method before the service method).
6. **Single flat context file, no scope targeting** — One global instructions file means every
   prompt loads all context even when editing a migration file. VS Code supports scoped
   `.instructions.md` files with `applyTo` frontmatter that target specific glob patterns.

## Workspace Layout (current state)

```
.context/
  copilot-instructions.md          ← global, stale, incomplete
  01-project-overview.md
  02-architecture-overview.md
  03-data-flow.md
  04-database-concepts.md
  05-api-overview.md
  06-frontend-architecture.md
  07-backend-architecture.md
  08-infrastructure.md
  09-folder-structure.md
  10-scalability-and-maintainability.md
```

The file `.context/copilot-instructions.md` is the primary instructions file loaded by Copilot.
The numbered `.md` files are supplementary domain context.

## Actual vs. Expected

| Issue | Current (wrong) | Expected (correct) |
|---|---|---|
| Frontend app path | `apps/frontend/` | `apps/web/` |
| Fastify version in text | "Fastify v4" | "Fastify v5" |
| Anti-patterns section | Missing | Present |
| Naming conventions | Missing | Present |
| Feature checklist | Missing | Present |
| Scoped instructions | Single global file | Per-area `.instructions.md` files |

## Acceptance Criteria

- [ ] `copilot-instructions.md` has no references to `apps/frontend/`; all paths match the real
      directory tree.
- [ ] Version numbers in the file match actual `package.json` versions (Fastify 5, TS 5/7, etc.).
- [ ] A clearly labeled **"Anti-Patterns — Never Do These"** section exists with at least the
      following rules:
  - No direct `db` access in route handlers (must go through repository layer)
  - No raw SQL strings outside of `packages/db` repositories
  - No `localStorage` or `sessionStorage` for tokens
  - No `useEffect` + `fetch` for server data (use TanStack Query)
  - No `.then()` chains except in Axios interceptors
  - No `any` type — use `unknown` and narrow
  - No `console.log` in production code — use the Pino logger instance
  - No non-null assertions (`!`) without an explanatory comment
- [ ] A **"Naming Conventions"** section documents:
  - File naming: `PascalCase` for classes/components, `camelCase` for utilities/hooks,
    `kebab-case` for config and non-class files
  - Exports: named exports everywhere except React page-level route components
  - Test files: co-located as `*.test.ts` / `*.test.tsx` next to the file under test
  - Directory names: `lowercase` or `kebab-case`, plural for groupings (e.g. `routes/`, `services/`)
- [ ] A **"Adding a New Feature — Step-by-Step"** checklist section exists covering:
  1. Define types in `packages/types/src/`
  2. Add/update Drizzle schema in `packages/db/src/schema/`
  3. Generate and run migration (`pnpm db:generate && pnpm db:migrate`)
  4. Add repository method(s) in `apps/api/src/repositories/`
  5. Add service method(s) in `apps/api/src/services/`
  6. Add route handler(s) in `apps/api/src/routes/`
  7. Add query key(s) in `apps/web/src/utils/queryKeys.ts`
  8. Add API client function(s) in `apps/web/src/api/`
  9. Build UI component/hook in `apps/web/src/features/<feature>/`
  10. Write unit tests for service and repository methods
- [ ] A scoped `.github/copilot-instructions.md` file exists (VS Code's preferred location) that
      mirrors or references the `.context/copilot-instructions.md` so it is picked up automatically.
- [ ] Optional stretch: Create `.instructions.md` files scoped per area:
  - `.context/instructions/backend.instructions.md` with `applyTo: apps/api/src/**`
  - `.context/instructions/frontend.instructions.md` with `applyTo: apps/web/src/**`
  - `.context/instructions/db.instructions.md` with `applyTo: packages/db/**`

## Files to Modify / Create

- `.context/copilot-instructions.md` — primary edits
- `.github/copilot-instructions.md` — create (can symlink or copy)
- Optionally: `.context/instructions/*.instructions.md` — create scoped files

## Reference

- VS Code Copilot instructions docs:
  https://code.visualstudio.com/docs/copilot/copilot-customization#_use-instructionsmd-files
- Fastify v5 migration guide:
  https://fastify.dev/docs/latest/Guides/Migration-Guide-V5/
