# PRD-02 — Navigation Restructure

**Status:** 🔲 Not Started
**Theme:** Navigation / Information Architecture
**Depends on:** None (can run in parallel with PRD-01)
**Blocks:** PRD-03, PRD-04, PRD-07, PRD-08

---

## Goal

Restructure the app's routes and top navigation to reflect the product's actual hierarchy: **Tools** are the primary entry point, **Files** and **Jobs** are secondary management views, and **Account** is a utility concern. This directly addresses the "navigation doesn't feel intuitive" pain point.

## Why It Matters

The current nav puts "Files" (storage) at the same visual weight as "Converter" and "Compressor" (the actual tools). Users who come to process a file don't identify as "file managers". Promoting tool links and adding a live Jobs indicator gives the nav a purpose-driven feel.

---

## Scope

### Route Changes

| Old Path | New Path | Notes |
|----------|----------|-------|
| `/dashboard` | `/app/dashboard` | Renamed; content changed in PRD-03 |
| `/files/:id` | `/app/files/:id` | Scoped under `/app` |
| `/converter` | `/app/convert` | Shortened, consistent naming |
| `/compressor` | `/app/compress` | Shortened |
| `/tools` | `/app/tools` | Unchanged concept |
| *(new)* | `/app/jobs` | Added in PRD-04 |
| *(new)* | `/app/settings` | Added in PRD-09 |
| `/` (root) | redirect → `/app/dashboard` (auth) or `/` (landing, PRD-05) | Until PRD-05 lands, keep redirect to `/app/dashboard` |

All authenticated routes remain inside `<ProtectedRoute>` wrapping `<AppLayout>`.

### Navigation Bar Redesign

Replace the current flat 4-link nav with a two-cluster layout:

**Left cluster — Brand + Tools:**
```
[FileProc]   [Convert]  [Compress]  [Tools]
```

**Right cluster — Status + Account:**
```
[Jobs  ●2]   [user@email.com ▼]
                 ├── My Files
                 ├── Settings
                 └── Sign out
```

Details:
- `FileProc` brand mark links to `/app/dashboard`
- Tool links (`Convert`, `Compress`, `Tools`) are the primary CTA group
- **Jobs badge** shows count of `processing` jobs from TanStack Query cache; hidden when count is 0; links to `/app/jobs`
- User email opens a small dropdown menu (built with a `useState` toggle + click-outside handler — no library)
- Dropdown contains: **My Files** → `/app/files` (a new alias for the current dashboard file list), **Settings** → `/app/settings`, **Sign out** (existing logout logic)
- Active nav link: brand-coloured text + `var(--color-brand-light)` background pill

### New Route: `/app/files`

Add `/app/files` as an alias for the file list view (currently at `/dashboard`). The existing `DashboardPage` is **not** changed here — it moves to this route while `/app/dashboard` gets new content in PRD-03.

### Responsive Behaviour

- At < 768 px, collapse tool links behind a hamburger icon (simple `useState` toggle, no library)
- On mobile: show brand + hamburger on one line; expanded menu is full-width dropdown below the nav bar

---

## Acceptance Criteria

- [ ] All routes listed in the table above resolve correctly (no 404s, no broken redirects)
- [ ] Nav left cluster: brand + 3 tool links
- [ ] Nav right cluster: Jobs badge + user dropdown
- [ ] Jobs badge shows a count when there are active `processing` jobs; hidden otherwise
- [ ] User dropdown contains: My Files, Settings, Sign out — all functional links/actions
- [ ] Clicking a tool link highlights it as active; no other link is highlighted simultaneously
- [ ] Old paths (`/dashboard`, `/converter`, `/compressor`) redirect to their new equivalents (or 404 gracefully via `<RouteErrorPage>`)
- [ ] Mobile hamburger collapses/expands the nav links
- [ ] No third-party dropdown or menu component used

---

## Files to Create / Modify

```
apps/web/src/router/index.tsx            ← update all route paths
apps/web/src/components/layout/
  AppLayout.tsx                          ← full nav redesign
  UserMenu.tsx                           ← new: dropdown component
  NavJobsBadge.tsx                       ← new: live jobs count badge
  index.ts                               ← export new components
apps/web/src/pages/
  FilesPage.tsx                          ← new: thin wrapper, replaces DashboardPage as file list
apps/web/src/features/converter/pages/
  ConverterPage.tsx                      ← update any internal links from /converter → /app/convert
apps/web/src/features/compressor/pages/
  CompressorPage.tsx                     ← update any internal links
```

---

## Out of Scope

- Actual content of `/app/dashboard` (PRD-03)
- Actual content of `/app/jobs` (PRD-04)
- Actual content of `/app/convert`, `/app/compress` (PRD-07, PRD-08)
- Landing page at `/` (PRD-05)
- Settings page content (PRD-09)
- `NavJobsBadge` only reads from the existing `useJobs` query (or equivalent); it does not add new API calls beyond what already exists
