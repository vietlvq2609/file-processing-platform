# PRD-10 — Empty States & Final Polish

**Status:** 🔲 Not Started
**Theme:** Visual Polish / UX Completeness
**Depends on:** PRD-01 through PRD-09
**Blocks:** None

---

## Goal

Apply the final layer of polish that turns a functional app into a professional product: consistent empty states on every list view, loading skeletons instead of spinners for content-heavy pages, micro-interactions on key state transitions, and a responsive audit across all pages.

## Why It Matters

The difference between a "demo project" and a "production-quality portfolio piece" is often entirely in the details. Empty states, loading feedback, and visual transitions signal craftsmanship. This is the last pass before the platform is considered showcase-ready.

---

## Scope

### 1. Empty States Audit

Every list/table page must have a designed empty state using the `<EmptyState>` primitive (PRD-01). Audit each page and ensure it is covered:

| Page | Empty condition | Title | Description | CTA |
|------|----------------|-------|-------------|-----|
| `/app/dashboard` — Recent Jobs | No jobs | "No jobs yet" | "Process a file to see your activity here" | "Convert a file →" → `/app/convert` |
| `/app/jobs` — All | No jobs | "Nothing here yet" | "Your processed jobs will appear here" | "Convert a file →" → `/app/convert` |
| `/app/jobs` — Processing | None active | "No jobs running" | "Start a conversion or compression" | None |
| `/app/jobs` — Completed | None | "No completed jobs" | — | None |
| `/app/jobs` — Failed | None | "No failed jobs" | "Looks like everything worked!" | None |
| `/app/files` | No files | "No files uploaded" | "Upload a file to get started" | "Upload a file →" (opens FileDropZone) |

Each empty state should have an **inline SVG illustration** — simple, single-colour line art (no external assets). Examples:
- Empty jobs: a stylised empty inbox tray
- Empty files: a stylised empty folder
- No failures: a stylised checkmark/shield

### 2. Loading Skeletons

Replace the generic `<Spinner>` full-page loader on content-heavy pages with skeleton screens:

| Page | Skeleton elements |
|------|------------------|
| `/app/jobs` | 5 skeleton rows (grey blocks at correct widths simulating the job row layout) |
| `/app/files` | 4 skeleton cards (grey blocks simulating FileCard proportions) |
| `/app/dashboard` — Stats row | 3 grey metric card placeholders |
| `/app/dashboard` — Recent Jobs | 5 skeleton rows |

Skeleton implementation:
- Pure CSS animated shimmer using `@keyframes` + `background: linear-gradient(90deg, ...)` — no library
- A `<Skeleton>` component in `components/ui/` that accepts `width`, `height`, and `className`

### 3. Micro-interactions

Small but meaningful state transition animations:

| Interaction | Animation |
|-------------|-----------|
| Job completes (status → completed) | Row background briefly flashes green (`bg-green-50`) then fades back to white; [Download] button fades in |
| Job fails | Row background briefly flashes red (`bg-red-50`) |
| File deleted | Row fades out with `opacity: 0` + `max-height: 0` transition (CSS, no library) |
| Button `isLoading` → false (success) | Brief ✓ icon replaces spinner for 1 second before returning to normal label |
| Form submit success | Inline success message slides down with `transition: all 200ms ease` |

Implementation: use CSS `transition` and `className` toggling via `useState`. No animation library.

### 4. Responsive Audit

Walk through every page at three breakpoints and fix any layout issues:

| Breakpoint | Width |
|-----------|-------|
| Mobile | 375 px |
| Tablet | 768 px |
| Desktop | 1280 px |

Known gaps to check:
- Dashboard three-zone layout stacks correctly on mobile
- Jobs table truncates long filenames gracefully (CSS `text-overflow: ellipsis`)
- Settings sidebar collapses to horizontal tabs on mobile
- Auth split-panel hides brand panel on mobile
- Tool pages (Convert/Compress) remain single-column on all breakpoints
- Nav hamburger menu works correctly on 375 px

### 5. Page Titles

Every route should set the browser tab title to a meaningful value. Use React Router's pattern or a small `useDocumentTitle` hook:

| Route | `<title>` |
|-------|----------|
| `/` | FileProc — Process files instantly |
| `/login` | Sign in — FileProc |
| `/register` | Create account — FileProc |
| `/app/dashboard` | Dashboard — FileProc |
| `/app/jobs` | My Jobs — FileProc |
| `/app/files` | My Files — FileProc |
| `/app/files/:id` | File Details — FileProc |
| `/app/convert` | Convert — FileProc |
| `/app/compress` | Compress — FileProc |
| `/app/tools` | Tools — FileProc |
| `/app/settings` | Settings — FileProc |

### 6. Error Boundary Polish

The existing `<RouteErrorPage>` component should be styled consistently with the design system:
- Use brand fonts and colours
- Include a "Go to Dashboard" `<Button variant="secondary">` link
- Show a friendly message for 404s vs unexpected errors

---

## Component Additions

```
apps/web/src/components/ui/
  Skeleton.tsx                    ← new shimmer placeholder

apps/web/src/hooks/
  useDocumentTitle.ts             ← new: sets document.title on mount/update
```

---

## Acceptance Criteria

- [ ] Every list page has an appropriate `<EmptyState>` with inline SVG icon
- [ ] Loading skeletons replace full-page spinners on Jobs, Files, and Dashboard pages
- [ ] `<Skeleton>` component exists in `components/ui/` with shimmer animation
- [ ] Job completion/failure micro-interaction is visible in the Jobs list
- [ ] File delete transition animates the row out
- [ ] All pages render without layout breaks at 375 px, 768 px, and 1280 px
- [ ] Every route sets a meaningful `document.title`
- [ ] `<RouteErrorPage>` is styled with the design system
- [ ] No animation library is introduced (CSS transitions and keyframes only)

---

## Out of Scope

- Page transition animations (route-level enter/exit)
- Accessibility audit (WCAG compliance — valuable but a separate workstream)
- Performance profiling / bundle optimisation
- PWA / offline support
