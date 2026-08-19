# API Reference

Base URL: `/api/v1`

All endpoints (except auth) require a valid JWT access token:

```
Authorization: Bearer <accessToken>
```

## Response Envelope

**Success:**
```json
{ "data": <T>, "meta": { "total": 42, "page": 1, "limit": 20 } }
```
`meta` is only present on paginated list responses.

**Error:**
```json
{ "error": { "code": "UPPER_SNAKE_CASE", "message": "Human-readable description" } }
```

## HTTP Status Codes

| Code | Meaning |
|---|---|
| `200` | OK |
| `201` | Created |
| `204` | No Content |
| `400` | Bad Request |
| `401` | Unauthorized (invalid or expired token) |
| `403` | Forbidden (authenticated but not allowed) |
| `404` | Not Found |
| `409` | Conflict |
| `422` | Unprocessable Entity (validation error) |
| `500` | Internal Server Error |

---

## Auth

### Register

```
POST /api/v1/auth/register
```

**Request body:**
```json
{
  "email": "user@example.com",
  "password": "at-least-8-chars"
}
```

**Response `201`:**
```json
{
  "data": {
    "accessToken": "<jwt>",
    "user": { "id": "<uuid>", "email": "user@example.com" }
  }
}
```

Sets `refreshToken` as an httpOnly cookie.

---

### Login

```
POST /api/v1/auth/login
```

**Request body:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response `200`:**
```json
{
  "data": {
    "accessToken": "<jwt>",
    "user": { "id": "<uuid>", "email": "user@example.com" }
  }
}
```

Sets `refreshToken` as an httpOnly cookie.

---

### Refresh Access Token

```
POST /api/v1/auth/refresh
```

Reads the `refreshToken` cookie automatically.

**Response `200`:**
```json
{
  "data": { "accessToken": "<new-jwt>" }
}
```

---

### Logout

```
POST /api/v1/auth/logout
```

Revokes the refresh token and clears the cookie.

**Response `204`** — no body.

---

### Get Current User

```
GET /api/v1/auth/me
```

**Response `200`:**
```json
{
  "data": { "id": "<uuid>", "email": "user@example.com", "createdAt": "2024-01-01T00:00:00Z" }
}
```

---

## Files

### Upload a File

```
POST /api/v1/files
Content-Type: multipart/form-data
```

**Form fields:**

| Field | Type | Required | Notes |
|---|---|---|---|
| `file` | binary | yes | Max size configured via `MAX_FILE_SIZE_BYTES` |

**Response `201`:**
```json
{
  "data": {
    "id": "<uuid>",
    "originalName": "report.pdf",
    "mimeType": "application/pdf",
    "size": 204800,
    "status": "ready",
    "createdAt": "2024-01-01T00:00:00Z"
  }
}
```

---

### List Files

```
GET /api/v1/files
```

**Query parameters:**

| Param | Type | Default | Description |
|---|---|---|---|
| `page` | integer | `1` | 1-based page number |
| `limit` | integer | `20` | Max `100` |
| `search` | string | — | Filter by filename (partial match) |
| `sort` | string | `createdAt` | Field to sort by |
| `order` | `asc` \| `desc` | `desc` | Sort direction |

**Response `200`:**
```json
{
  "data": [ { "id": "...", "originalName": "...", ... } ],
  "meta": { "total": 42, "page": 1, "limit": 20 }
}
```

---

### Get File

```
GET /api/v1/files/:id
```

**Response `200`:**
```json
{
  "data": {
    "id": "<uuid>",
    "originalName": "report.pdf",
    "mimeType": "application/pdf",
    "size": 204800,
    "status": "ready",
    "createdAt": "2024-01-01T00:00:00Z"
  }
}
```

---

### Delete File

```
DELETE /api/v1/files/:id
```

Soft-deletes the file. Associated jobs are unaffected.

**Response `204`** — no body.

---

### Download Processed Output

```
GET /api/v1/files/:id/download
```

Returns the processed output as a binary stream. Only available when the related job has `status = completed`.

**Response `200`:** binary file stream with appropriate `Content-Type` and `Content-Disposition` headers.

---

## Jobs

### Submit a Job

```
POST /api/v1/jobs
```

**Request body:**
```json
{
  "fileId": "<uuid>",
  "jobType": "compress_image"
}
```

**Response `201`:**
```json
{
  "data": {
    "id": "<uuid>",
    "fileId": "<uuid>",
    "jobType": "compress_image",
    "status": "pending",
    "progress": 0,
    "createdAt": "2024-01-01T00:00:00Z"
  }
}
```

---

### List Jobs

```
GET /api/v1/jobs
```

**Query parameters:**

| Param | Type | Default | Description |
|---|---|---|---|
| `page` | integer | `1` | 1-based page number |
| `limit` | integer | `20` | Max `100` |
| `status` | string | — | Filter by `pending` \| `processing` \| `completed` \| `failed` |
| `fileId` | UUID | — | Filter jobs for a specific file |

**Response `200`:**
```json
{
  "data": [ { "id": "...", "status": "completed", "progress": 100, ... } ],
  "meta": { "total": 5, "page": 1, "limit": 20 }
}
```

---

### Get Job

```
GET /api/v1/jobs/:id
```

**Response `200`:**
```json
{
  "data": {
    "id": "<uuid>",
    "fileId": "<uuid>",
    "jobType": "compress_image",
    "status": "completed",
    "progress": 100,
    "outputFileId": "<uuid>",
    "createdAt": "2024-01-01T00:00:00Z",
    "startedAt": "2024-01-01T00:00:05Z",
    "completedAt": "2024-01-01T00:00:12Z"
  }
}
```

---

### Cancel a Job

```
DELETE /api/v1/jobs/:id
```

Only cancels jobs in `pending` state. Returns `409` if the job is already processing or finished.

**Response `204`** — no body.

---

## WebSocket

Connect to `/ws` with the access token as a query parameter:

```
ws://localhost/ws?token=<accessToken>
```

The connection is closed immediately with code `4401` if the token is missing or invalid.

### Client → Server Events

| Event | Payload | Description |
|---|---|---|
| `subscribe` | `{ "jobId": "<uuid>" }` | Start receiving progress for a job |
| `unsubscribe` | `{ "jobId": "<uuid>" }` | Stop receiving progress for a job |

### Server → Client Events

| Event | Payload | Description |
|---|---|---|
| `job:progress` | `{ "jobId": "<uuid>", "progress": 42, "status": "processing" }` | Progress update (0–100) |
| `job:completed` | `{ "jobId": "<uuid>", "outputFileId": "<uuid>" }` | Job finished successfully |
| `job:failed` | `{ "jobId": "<uuid>", "error": "message" }` | Job failed |

**Example flow:**

```javascript
const ws = new WebSocket(`ws://localhost/ws?token=${accessToken}`);

ws.onopen = () => {
  ws.send(JSON.stringify({ event: 'subscribe', jobId: '<uuid>' }));
};

ws.onmessage = ({ data }) => {
  const { event, ...payload } = JSON.parse(data);
  if (event === 'job:completed') {
    // trigger download
  }
};
```

---

## Error Codes

| Code | HTTP | Description |
|---|---|---|
| `VALIDATION_ERROR` | 422 | Request body or params failed schema validation |
| `UNAUTHORIZED` | 401 | Missing, invalid, or expired access token |
| `FORBIDDEN` | 403 | Authenticated user does not own this resource |
| `FILE_NOT_FOUND` | 404 | File does not exist or has been deleted |
| `JOB_NOT_FOUND` | 404 | Job does not exist |
| `JOB_NOT_CANCELLABLE` | 409 | Job is not in `pending` state |
| `FILE_TOO_LARGE` | 400 | Upload exceeds `MAX_FILE_SIZE_BYTES` |
| `INTERNAL_ERROR` | 500 | Unexpected server error |
