# Data Flow & Lifecycle

## 1. Authentication Flow

```
Browser                  API Server               PostgreSQL
  │                          │                        │
  │── POST /auth/login ──────▶                        │
  │                          │── SELECT user ────────▶│
  │                          │◀─ user row ────────────│
  │                          │  (verify password hash)│
  │◀── 200 { accessToken,    │                        │
  │          refreshToken } ─│                        │
  │                          │                        │
  │  (store tokens in memory/│                        │
  │   httpOnly cookie)       │                        │
```

- Access token: short-lived JWT (15 min), stored in memory
- Refresh token: longer-lived JWT (7 days), stored in httpOnly cookie
- Token refresh is transparent to the user (Axios interceptor)

---

## 2. File Upload Flow

```
Browser                  API Server          PostgreSQL     File Storage
  │                          │                   │               │
  │── POST /files            │                   │               │
  │   multipart/form-data ──▶│                   │               │
  │                          │── validate ──────▶│               │
  │                          │── INSERT file ───▶│               │
  │                          │◀─ file.id ─────────│               │
  │                          │── write file ─────────────────────▶│
  │◀── 201 { file } ─────────│                   │               │
```

- Validation: file type, size limits, authenticated user
- File metadata is written to PostgreSQL before file bytes are committed to storage
- On failure after metadata is written, a cleanup mechanism removes the orphaned record

---

## 3. Job Submission and Background Processing Flow

```
Browser     API Server    PostgreSQL    Redis (Queue)    Worker         File Storage
  │              │              │              │              │               │
  │─POST /jobs──▶│              │              │              │               │
  │              │─INSERT job──▶│              │              │               │
  │              │◀─job.id──────│              │              │               │
  │              │─ENQUEUE ─────────────────────▶            │               │
  │◀─201 {job}──│              │              │              │               │
  │              │              │              │              │               │
  │              │              │              │◀─CONSUME job─│               │
  │              │              │              │              │─read input ───▶│
  │              │              │              │              │◀─file bytes ───│
  │              │              │              │              │  (process...)  │
  │              │              │              │              │─write output──▶│
  │              │              │─UPDATE job──▶│              │               │
  │              │              │  (completed) │              │               │
```

---

## 4. Real-Time Progress Flow

```
Worker         Redis (Pub/Sub)    API Server        Browser (WS)
  │                  │                 │                 │
  │─PUBLISH ─────────▶                 │                 │
  │  progress event  │                 │                 │
  │                  │─notify─────────▶│                 │
  │                  │                 │─WS push────────▶│
  │                  │                 │  { jobId,       │
  │                  │                 │    progress,    │
  │                  │                 │    status }     │
```

- Worker publishes progress events to a Redis channel per job (e.g. `job:progress:<jobId>`)
- API Server has a Redis subscriber running per connected WebSocket client (or a shared subscriber with fan-out)
- Browser receives live updates without polling

---

## 5. File Download Flow

```
Browser                  API Server          PostgreSQL     File Storage
  │                          │                   │               │
  │── GET /files/:id/download▶                   │               │
  │                          │── SELECT job ────▶│               │
  │                          │  (verify status   │               │
  │                          │   = completed)    │               │
  │                          │── read output ────────────────────▶│
  │◀── 200 (file stream) ────│                   │               │
```

- Only files with `status = completed` are downloadable
- Response streams the file bytes directly — no in-memory buffering

---

## 6. Request Lifecycle (API)

```
HTTP Request
    │
    ▼
Nginx (proxy, TLS termination)
    │
    ▼
Fastify (route match)
    │
    ▼
Auth Middleware (verify JWT, attach user to request)
    │
    ▼
Route Handler
    ├── Validate input (Fastify JSON schema)
    ├── Call service layer
    │       ├── Database operations (PostgreSQL)
    │       ├── Queue operations (BullMQ / Redis)
    │       └── Storage operations (file system / S3)
    └── Return response (JSON)
    │
    ▼
Error Handler (centralized, maps domain errors → HTTP codes)
```

---

## 7. Background Job Lifecycle (Worker)

```
Job enters queue (status: pending)
    │
    ▼
Worker picks up job (status: processing)
    │
    ├── Reads input file from storage
    ├── Runs processing logic
    ├── Publishes progress events (0% → 100%)
    ├── Writes output file to storage
    └── Updates job record in PostgreSQL
    │
    ▼ (on success)
Job status: completed
Output file path stored in job record
    │
    ▼ (on failure)
Job status: failed
Error message stored in job record
BullMQ retries up to configured max attempts
```

---

## Data Consistency Notes

- Job records are created in PostgreSQL **before** the job is enqueued in Redis. If enqueue fails, the job remains in a `pending` state and can be retried or cleaned up.
- File metadata is written to PostgreSQL before bytes reach storage. A scheduled cleanup or transaction-aware approach handles orphaned records.
- Worker updates job status in PostgreSQL after writing output — ensuring a completed status always corresponds to an available output file.
