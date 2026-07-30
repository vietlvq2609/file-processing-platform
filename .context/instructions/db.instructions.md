---
applyTo: packages/db/**
---

# Database / Drizzle Instructions

These instructions apply to all files under `packages/db/`.

## Schema Conventions

- Table names: `snake_case`, plural (e.g. `users`, `files`, `jobs`)
- Column names: `snake_case`
- Primary keys: `id uuid primary key default gen_random_uuid()`
- Timestamps: `created_at timestamptz default now()`, `updated_at timestamptz default now()`
- Soft deletes: `deleted_at timestamptz default null` (no hard deletes for user-owned data)
- Foreign keys must have an explicit `references` clause with `onDelete` behaviour specified

## Drizzle Query Builder

- Default to the Drizzle query builder (`db.select().from(table).where(...)`)
- `db.execute(sql\`...\`)` is allowed as an escape hatch — add a comment explaining why the query builder is insufficient
- Never construct SQL by string concatenation — always use Drizzle's `sql` tagged template literal

## Migrations

- Generate migrations with `pnpm db:generate` (runs `drizzle-kit generate`)
- Apply migrations with `pnpm db:migrate` (runs the migration script in `packages/db/src/`)
- Do not hand-edit generated migration files in `packages/db/drizzle/` — regenerate instead
- Migration filenames are auto-generated; do not rename them

## Repository Pattern

- Repository methods live in `apps/api/src/repositories/` (and `apps/worker/src/repositories/`)
- Each method performs exactly one logical data operation
- Return typed domain objects (from `packages/types`) — not raw Drizzle row types
- All queries on `files` and `jobs` tables must include a `userId` filter

## Anti-Patterns (database)

- ❌ Raw SQL strings outside of `db.execute(sql\`...\`)` tagged templates
- ❌ Accessing `packages/db` client directly from route handlers — go through repositories
- ❌ Auto-increment integer PKs — always use UUID
- ❌ Hard-deleting user data rows — use `deleted_at` soft delete
- ❌ Hand-editing generated migration files
