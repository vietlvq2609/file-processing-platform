# PRD-04 — Jobs Page

**Status:** 🔲 Not Started
**Theme:** Real-time Feedback / Job Management
**Depends on:** PRD-01 (design system), PRD-02 (routes)
**Blocks:** PRD-07, PRD-08

---

## Goal

Give users a dedicated, filterable view of all their processing jobs with real-time status updates. This directly addresses the "no sense of progress or feedback during processing" pain point — users no longer need to navigate into a FileDetail page to track what's happening.

## Why It Matters

Users who submit multiple jobs have no central place to monitor them today. A live jobs page with status filters and inline progress bars turns the platform from a one-shot tool into a manageable workflow hub.

---

## Scope

### Route

`/app/jobs` — authenticated, inside `<AppLayout>`

### Page Layout

```
┌──────────────────────────────────────────────────────┐
│  HEADER: "My Jobs"    [All] [Processing] [Completed] [Failed]  │
├──────────────────────────────────────────────────────┤
│  JOB ROW  filename · operation · status badge · time │
│  [progress bar if processing]                        │
│  JOB ROW ...                                         │
│  JOB ROW ...                                         │
├──────────────────────────────────────────────────────┤
│  PAGINATION: ← Prev  Page 1 of N  Next →             │
└──────────────────────────────────────────────────────┘
```

### Filter Tabs

- Four tabs: **All** | **Processing** | **Completed** | **Failed**
- Active tab is visually highlighted (brand underline or filled pill)
- Selecting a tab updates the `status` query param in the URL (`/app/jobs?status=processing`) so the filtered view is shareable/bookmarkable
- Filter is passed to `GET /api/v1/jobs?status=<value>&page=<n>&limit=20`

### Job Row

Each row in the list displays:

| Column | Content |
|--------|---------|
| File | filename (truncated to 32 chars with ellipsis) + file type icon |
| Operation | operation type label (e.g. "Convert", "Compress") |
| Status | `<Badge>` with appropriate variant |
| Progress | `<ProgressBar value={progress}>` — only visible when status is `processing` |
| Time | relative timestamp ("2 min ago") — updates every 60 s client-side |
| Actions | [Download] button (only when `completed`); [View File] link to `/app/files/:fileId` |

Row hover: subtle bg highlight (`gray-50`).

### Real-time Updates

- `useJobWebSocket` hook must update the TanStack Query cache for the jobs list query when a progress or status event arrives for a job visible on the current page
- When a `processing` job transitions to `completed`, its row animates: progress bar fills to 100%, then the [Download] button fades in
- No polling — WebSocket only

### Pagination

- 20 jobs per page (matching API default)
- Simple prev/next buttons + "Page X of Y" display
- Page resets to 1 when the filter tab changes

### Empty State

- Rendered by `<EmptyState>` (PRD-01) when the filtered list is empty
- Different messages per filter:
  - All: "No jobs yet — convert or compress a file to get started" + CTA → `/app/convert`
  - Processing: "No jobs currently running"
  - Completed: "No completed jobs yet"
  - Failed: "No failed jobs"

---

## Data Requirements

Uses existing endpoint: `GET /api/v1/jobs?status=<>&page=<>&limit=20`

WebSocket events shape (already defined in `packages/types/src/websocket.ts`):
- `job:progress` — `{ jobId, progress: number }`
- `job:status` — `{ jobId, status: JobStatus }`

The hook must update the specific job entry in the cached list, not refetch the entire list.

---

## Component Structure

```
pages/JobsPage.tsx                    ← new page (default export)

features/jobs/                        ← new feature folder
  components/
    JobsFilterTabs.tsx                ← tab strip with URL param sync
    JobList.tsx                       ← paginated list
    JobRow.tsx                        ← single job row
    JobRowActions.tsx                 ← download + view file buttons
  hooks/
    useJobs.ts                        ← useQuery wrapper for job list
    useJobsPageState.ts               ← manages filter + page state from URL params
```

---

## Acceptance Criteria

- [ ] `/app/jobs` route resolves and renders inside `<AppLayout>`
- [ ] All four filter tabs work; selected tab is visually distinct
- [ ] Filter selection updates the URL query param (`?status=processing` etc.)
- [ ] Page loads jobs from API using `useQuery`, not `useEffect` + `fetch`
- [ ] Jobs are paginated: prev/next buttons work; page resets on filter change
- [ ] A `processing` job shows a live-updating progress bar driven by WebSocket (no polling)
- [ ] When a job completes, the row updates in place (no full refetch visible to the user)
- [ ] Download button appears only for `completed` jobs and triggers file download
- [ ] All 4 empty state messages display correctly per filter
- [ ] `<Badge>`, `<ProgressBar>`, `<EmptyState>` from PRD-01 are used

---

## Out of Scope

- Bulk actions (select + delete multiple jobs)
- Job cancellation
- Re-running a failed job (future enhancement)
- Sorting beyond default (newest first)
