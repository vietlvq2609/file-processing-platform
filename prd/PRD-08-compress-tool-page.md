# PRD-08 — Compress Tool Page

**Status:** 🔲 Not Started
**Theme:** Core Tool / Primary User Job
**Depends on:** PRD-01 (design system), PRD-02 (routes), PRD-04 (Jobs page patterns), PRD-07 (establishes tool page pattern)
**Blocks:** None

---

## Goal

Replace the `/app/compress` stub with a fully functional compression tool page. Mirrors the linear flow pattern established in PRD-07 but with compression-specific UX: a quality/level control and a before/after size comparison on completion.

## Why It Matters

Compression is the second core tool and the most universally useful operation (users compress images, PDFs, and videos daily). The before/after size delta is a high-value, shareable "wow moment" that reinforces the platform's value.

---

## Scope

### Route

`/app/compress` — authenticated, inside `<AppLayout>`

### Page Flow

Same 4-step linear pattern as PRD-07:

```
Step 1: Drop / select a file
        ↓
Step 2: Configure compression level
        ↓  (user clicks "Compress Now")
Step 3: Processing — live progress bar
        ↓
Step 4: Download result + size comparison
```

### Step 1: File Input

- `<FileDropZone>` accepting: `image/*`, `application/pdf`, `video/*`
- Max file size label: "Max 50 MB"
- On selection: show file preview summary (name, original size, type icon) + advance to Step 2
- [Clear file] button to reset

### Step 2: Compression Options

| Control | Description |
|---------|-------------|
| **Quality slider** | Range 1–100, default 80. Label: "Quality: 80%" updates as user drags. Low quality = higher compression. |
| **Preset buttons** | Three quick-select pills: [Low] (quality 40) · [Balanced] (quality 70) · [High] (quality 90). Selecting a preset updates the slider value. |
| **[Compress Now]** | `<Button variant="primary">` — submits the job |

The quality value is passed to `POST /api/v1/jobs` as a `quality` parameter in the job options payload.

> **Backend note:** The job processor must support a `quality` parameter. If it does not, the frontend submits without the parameter and the backend uses its default. The UI still works.

### Step 3: Processing

- Identical to PRD-07 Step 3: `<ProgressBar>` + WebSocket progress events
- Label: "Compressing your file…"
- Failure state: "Compression failed" + [Try again] reset

### Step 4: Download + Size Comparison

This step is richer than the Convert equivalent:

```
┌──────────────────────────────────────────────────────┐
│  ✓  Compression complete                             │
│                                                      │
│  Before:  4.2 MB                                     │
│  After:   1.1 MB   ↓ 73% smaller                    │
│                                                      │
│  ████████████████████████░░░░░░░░░░░░  73%           │
│  (visual bar showing compression ratio)              │
│                                                      │
│  [Download compressed file]                          │
│  [Compress another file]      [View in My Jobs →]    │
└──────────────────────────────────────────────────────┘
```

- "↓ N% smaller" is computed client-side: `Math.round((1 - afterSize / beforeSize) * 100)`
- The compression ratio bar is a static `<ProgressBar>` (not animated) showing the ratio
- If the compressed file is somehow larger (edge case), show "No reduction achieved" instead of a negative percentage
- Original file size is stored in the flow state from Step 1; compressed file size comes from the job result or the downloaded file metadata

---

## State Management

`useCompressFlow` hook (mirrors `useConvertFlow` from PRD-07):
- Flow step, selected file, quality value, jobId, job result (including output file size)
- Orchestrates upload → job submit → WebSocket → step transitions

---

## Component Structure

```
features/compressor/
  pages/
    CompressorPage.tsx         ← replace stub (default export)
  components/
    CompressFlow.tsx           ← orchestrates 4-step flow
    FileInputStep.tsx          ← step 1 (can share with PRD-07 if identical)
    CompressOptionsStep.tsx    ← step 2 (quality slider + presets)
    ProcessingStep.tsx         ← step 3 (can share with PRD-07 if identical)
    CompressResultStep.tsx     ← step 4 (size comparison unique to compress)
    QualitySlider.tsx          ← slider control with preset pills
    SizeComparison.tsx         ← before/after display
  hooks/
    useCompressFlow.ts         ← all flow state + side effects
```

> Note on sharing: If `FileInputStep` and `ProcessingStep` are identical to PRD-07, extract them into `features/shared/components/` rather than duplicating. Only do this if the components are truly identical — do not over-abstract prematurely.

---

## Acceptance Criteria

- [ ] `/app/compress` renders a functional compression flow (not a stub)
- [ ] Step 1: file drop/select works; accepted types enforced
- [ ] Step 2: quality slider renders and updates value label as it's dragged
- [ ] Step 2: preset pills (Low / Balanced / High) update the slider value
- [ ] Step 2: "Compress Now" submits upload + job with quality parameter
- [ ] Step 3: progress bar updates live via WebSocket (no polling)
- [ ] Step 3: failure state renders with reset button
- [ ] Step 4: before/after sizes are displayed with the percentage reduction
- [ ] Step 4: compression ratio bar renders correctly
- [ ] Step 4: download button downloads the compressed file
- [ ] Step 4: "Compress another file" resets to Step 1
- [ ] Edge case: if compressed ≥ original size, shows "No reduction achieved" (no negative %)
- [ ] All steps use `Card`, `Button`, `ProgressBar` from PRD-01

---

## Out of Scope

- Batch compression
- Format-specific compression settings (e.g. JPEG subsampling, PDF image downscaling)
- Side-by-side visual preview of image before/after
- Lossless vs lossy toggle (future enhancement)
- Guest compression — tracked in PRD-05
