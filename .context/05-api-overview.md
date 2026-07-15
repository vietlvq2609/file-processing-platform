# API Domain Overview

## Design Principles

- REST conventions: resource-based URLs, appropriate HTTP verbs and status codes
- All endpoints (except auth) require a valid JWT access token in the `Authorization: Bearer` header
- Responses follow a consistent envelope: `{ data, meta?, error? }`
- Validation errors return `422` with a structured field-level error body
- Business errors return appropriate codes (`400`, `403`, `404`, `409`)
- Pagination uses cursor or offset+limit; collections always include `meta.total`

---

## Domain Groups

### Auth (`/auth`)

| Intent | Method | Path |
|---|---|---|
| Register a new user | POST | `/auth/register` |
| Login (get tokens) | POST | `/auth/login` |
| Refresh access token | POST | `/auth/refresh` |
| Logout (revoke refresh) | POST | `/auth/logout` |
| Get current user profile | GET | `/auth/me` |

**Token strategy:**
- Access token in `Authorization` header (short-lived, ~15 min)
- Refresh token in httpOnly cookie (longer-lived, ~7 days)
- The Axios interceptor catches `401` responses, calls `/auth/refresh`, and retries the original request transparently

---

### Files (`/files`)

| Intent | Method | Path |
|---|---|---|
| Upload a file | POST | `/files` (multipart) |
| List user's files | GET | `/files` |
| Get a single file's metadata | GET | `/files/:id` |
| Delete a file (soft) | DELETE | `/files/:id` |
| Download a processed result | GET | `/files/:id/download` |

**Notes:**
- Upload is multipart/form-data
- List supports query params: `page`, `limit`, `search`, `sort`, `order`
- Download is only available once the related job has `status = completed`
- Users can only access their own files (ownership check on every route)

---

### Jobs (`/jobs`)

| Intent | Method | Path |
|---|---|---|
| Submit a processing job | POST | `/jobs` |
| List user's jobs | GET | `/jobs` |
| Get a single job's status | GET | `/jobs/:id` |
| Cancel a pending job | DELETE | `/jobs/:id` |

**Notes:**
- Job creation body includes `fileId` and `jobType`
- List supports filtering by `status`, `fileId`, `page`, `limit`
- Cancellation only works for jobs in `pending` state (not yet picked up by a Worker)

---

### WebSocket (`/ws`)

The WebSocket endpoint is a single connection point — not a traditional REST route.

| Event direction | Event name | Payload |
|---|---|---|
| Client → Server | `subscribe` | `{ jobId }` |
| Client → Server | `unsubscribe` | `{ jobId }` |
| Server → Client | `job:progress` | `{ jobId, progress, status }` |
| Server → Client | `job:completed` | `{ jobId, outputFileId }` |
| Server → Client | `job:failed` | `{ jobId, error }` |

**Connection lifecycle:**
1. Client connects to `/ws` with a valid access token in the query string (or an initial auth message)
2. Client subscribes to specific `jobId` events
3. Server pushes progress events as Worker publishes them via Redis
4. Client unsubscribes or the connection closes when done

---

## Authorization Model

All data is user-scoped. The rule is simple:

> A user can only read and modify resources they own.

- Every query to `files` or `jobs` includes a `WHERE user_id = :currentUser` filter
- There is no admin role in v1
- Attempting to access another user's resource returns `403 Forbidden` (not `404`) — this is a deliberate design choice for security transparency in a portfolio project

---

## Error Response Shape

```
{
  "error": {
    "code": "FILE_NOT_FOUND",
    "message": "The requested file does not exist or you do not have access to it.",
    "details": {}        // optional, field-level validation errors
  }
}
```

Error codes are uppercase snake-case strings. They are stable identifiers the frontend can map to UI messages.

---

## Pagination Shape

```
{
  "data": [...],
  "meta": {
    "total": 142,
    "page": 2,
    "limit": 20,
    "totalPages": 8
  }
}
```
