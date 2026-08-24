# PRD-03 — Dashboard Refocus

**Status:** 🔲 Not Started
**Theme:** Engagement / First Impression
**Depends on:** PRD-01 (design system), PRD-02 (routes)
**Blocks:** None

---

## Goal

Transform `/app/dashboard` from a plain file-manager into a **personal activity hub** — a page that surfaces what the user has done, what is happening right now, and what they can do next. This directly addresses the "dashboard feels empty / lacks purpose" pain point.

## Why It Matters

The dashboard is the first screen authenticated users see. A stats bar, a live jobs feed, and quick-action shortcuts give returning users an immediate orientation and drive engagement toward the tools (the platform's core value).

---

## Scope

### Layout — Three-Zone Design

```
┌────────────────────────────────────────────────────────────┐
│  QUICK STATS ROW  (3 metric cards side by side)            │
├───────────────────────────┬────────────────────────────────┤
│  RECENT JOBS FEED         │  QUICK START PANEL             │
│  (last 5 jobs, live)      │  (3 action cards)              │
└───────────────────────────┴────────────────────────────────┘
```

On mobile (< 768 px): stack vertically — Stats → Quick Start → Recent Jobs.

### Zone 1: Quick Stats Row

Three metric cards using the `Card` primitive from PRD-01.

| Card | Value | Source |
|------|-------|--------|
| Files Uploaded | count of user's files with status `ready` | `GET /api/v1/files` (use total from pagination meta) |
| Jobs Run | count of all user's jobs | `GET /api/v1/jobs` (total from pagination meta) |
| Storage Used | sum of file sizes formatted with `formatBytes` | derive from files list or dedicated endpoint |

- Each card: large number, label below, neutral icon on the right
- Numbers use a subtle count-up animation on first mount (CSS transition, no library)
- Show `—` while loading; show `0` on empty; never show an error state (fail silently with `0`)

### Zone 2: Recent Jobs Feed

- Fetches the **5 most recent jobs** from `GET /api/v1/jobs?limit=5&page=1`
- Uses `useQuery` with the existing `queryKeys` factory
- Each row: filename → operation type → `Badge` with status → elapsed time ago
- Jobs with status `processing` show a compact `ProgressBar` instead of the elapsed time
- Real-time updates: `useJobWebSocket` updates the TanStack Query cache so in-progress jobs update live without a refetch
- "View all jobs →" link at the bottom → `/app/jobs`
- Empty state: `<EmptyState>` with title "No jobs yet" and a CTA "Convert your first file →" linking to `/app/convert`

### Zone 3: Quick Start Panel

Three action cards stacked vertically (or in a 1-column layout on the right side):

| Card | Icon | Label | Destination |
|------|------|-------|-------------|
| Convert | arrow icon | Convert a file | `/app/convert` |
| Compress | compress icon | Compress a file | `/app/compress` |
| Browse tools | grid icon | See all tools | `/app/tools` |

Each card: icon + label + chevron right, subtle hover state using `Card` primitive.

---

## Data Requirements

The dashboard needs the following existing API endpoints — **no new endpoints required**:

- `GET /api/v1/files?limit=1` — to get `meta.total` for file count
- `GET /api/v1/jobs?limit=5&page=1` — for recent jobs feed
- `GET /api/v1/jobs?limit=1` — to get `meta.total` for jobs-run count
- Storage used: can be derived client-side from the files list if file size is included in the response; otherwise show 0 until a dedicated endpoint exists

---

## Component Structure

```
pages/DashboardPage.tsx              ← replace content entirely

features/dashboard/                  ← new feature folder
  components/
    QuickStatsRow.tsx                ← 3 StatCard components
    StatCard.tsx                     ← single metric card
    RecentJobsFeed.tsx               ← job list with live updates
    RecentJobRow.tsx                 ← single row in the feed
    QuickStartPanel.tsx              ← 3 action cards
    QuickStartCard.tsx               ← single action card
```

---

## Acceptance Criteria

- [ ] Dashboard at `/app/dashboard` renders the three-zone layout
- [ ] Stats row shows files count, jobs count, and storage used (or `0` if no data)
- [ ] Stats use real API data via `useQuery`; no `useEffect` + `fetch`
- [ ] Recent Jobs Feed shows up to 5 most recent jobs
- [ ] A `processing` job in the feed shows a live progress bar that updates via WebSocket (no polling)
- [ ] "View all jobs →" link navigates to `/app/jobs`
- [ ] Empty state is shown in the jobs feed when there are no jobs
- [ ] Quick Start cards navigate to the correct tool routes
- [ ] All components use `Card`, `Badge`, `ProgressBar`, `EmptyState` from PRD-01
- [ ] Layout is responsive: stacks on mobile

---

## Out of Scope

- Editing or deleting files/jobs from the dashboard
- Filtering or searching jobs on the dashboard (that's the Jobs page — PRD-04)
- Pagination on the recent jobs feed (always shows latest 5)
- Storage used calculation from a dedicated endpoint (use 0 or client-side sum until available)
