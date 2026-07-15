# Database Design Concepts

## Overview

PostgreSQL is the single source of truth for all persistent state: users, uploaded files, and processing jobs. The schema is intentionally straightforward — the goal is to demonstrate solid relational design, not complex business modeling.

---

## Core Entities

### users
Represents an authenticated account.

| Concept | Notes |
|---|---|
| Identity | Email + hashed password |
| Timestamps | `created_at`, `updated_at` |
| Soft delete | `deleted_at` (preserves referential integrity) |
| Relations | Owns many `files` and `jobs` |

---

### files
Represents a file uploaded by a user.

| Concept | Notes |
|---|---|
| Identity | UUID primary key |
| Ownership | Foreign key to `users` |
| Metadata | Original filename, MIME type, size in bytes, storage path |
| Status | `pending`, `ready`, `deleted` — tracks the file's own lifecycle |
| Timestamps | `uploaded_at`, `deleted_at` |
| Relations | One file can be associated with many `jobs` |

The `storage_path` is an internal reference (e.g. a relative path or an S3 key) — never exposed directly to clients.

---

### jobs
Represents a single processing request against a file.

| Concept | Notes |
|---|---|
| Identity | UUID primary key |
| Ownership | Foreign key to `users` (who submitted) |
| File reference | Foreign key to `files` (which file to process) |
| Job type | Enum or string identifying the kind of processing |
| Status | `pending` → `processing` → `completed` \| `failed` |
| Progress | Integer 0–100 (persisted at intervals) |
| Output path | Storage reference to the processed result |
| Error | Error message if status is `failed` |
| Timestamps | `created_at`, `started_at`, `completed_at` |

---

## Status State Machines

### File Status
```
uploaded → ready
         → deleted
```

### Job Status
```
pending → processing → completed
                    → failed → (retry via queue) → processing
```

---

## Relationships

```
users ──< files ──< jobs
```

- One user owns many files
- One file can have many processing jobs (e.g. different processing types, retries)
- One job belongs to one user and one file

---

## Key Design Principles

**UUIDs as primary keys**
All primary keys are UUIDs. This prevents ID enumeration in URLs and is consistent with production-system practice.

**Timestamps on all tables**
`created_at` and `updated_at` are present on every table. `updated_at` is maintained via a database trigger or application-level update.

**Soft deletes for user-owned data**
Files and users use soft deletes (`deleted_at IS NULL` filter) so referential integrity is preserved and data is recoverable.

**No denormalization in v1**
All queries join across the normalized tables. Denormalization can be introduced later if specific query performance becomes a concern.

**Indexes**
Expected indexes beyond primary keys:
- `files(user_id)` — fetch a user's files
- `jobs(file_id)` — fetch jobs for a file
- `jobs(user_id, status)` — fetch a user's jobs filtered by status
- `jobs(status)` — Worker queue recovery queries

---

## Out of Scope (v1)

- Full-text search on filenames (can add `pg_trgm` index later)
- Audit log table
- Job scheduling / cron jobs
- Multi-file jobs (one job per file in v1)
