# PRD-07 — Convert Tool Page

**Status:** 🔲 Not Started
**Theme:** Core Tool / Primary User Job
**Depends on:** PRD-01 (design system), PRD-02 (routes), PRD-04 (Jobs page patterns)
**Blocks:** None

---

## Goal

Replace the current `/app/convert` stub ("Coming soon") with a fully functional, purpose-built conversion tool page. Users drop a file, configure the output format, submit the job, and see progress + download — all on one screen without navigating away.

## Why It Matters

Converting a file is the primary user job. It must be frictionless: one page, one flow, zero redirects. This is the feature that delivers real value and validates the platform's core promise.

---

## Scope

### Route

`/app/convert` — authenticated, inside `<AppLayout>`

### Page Flow (Linear, Top-to-Bottom)

The page uses a **step-by-step progressive disclosure** pattern. Only the current step is prominent; completed steps collapse into a summary line.

```
Step 1: Drop / select a file
        ↓  (file selected)
Step 2: Configure conversion options
        ↓  (options set, user clicks "Convert Now")
Step 3: Processing — live progress bar
        ↓  (job complete)
Step 4: Download result
```

### Step 1: File Input

- Full-width `<FileDropZone>` (existing component, styled with PRD-01 tokens)
- Accepted MIME types: `image/*`, `application/pdf`, `video/*`, `audio/*`
- Max file size label shown below the zone: "Max 50 MB"
- On file selection: display a file preview summary (name, size, type icon) and advance to Step 2
- [Clear file] button to reset back to Step 1

### Step 2: Conversion Options

Visible only after a file is selected. Options are contextual to the detected file type:

| Input Type | "Convert to" options |
|------------|---------------------|
| Image | PNG, JPEG, WEBP, GIF, BMP |
| PDF | DOCX, PNG (each page), TXT |
| Video | MP4, WEBM, GIF, MP3 (audio extract) |
| Audio | MP3, WAV, OGG, FLAC |

UI:
- Label: "Convert to"
- A segmented button group or styled `<select>` for format options
- Default: first option in the list for the detected type
- **[Convert Now]** `<Button variant="primary">` — submits the job

On submit:
1. Calls `POST /api/v1/files` (upload) then `POST /api/v1/jobs` (submit job with format param)
2. Transitions to Step 3

### Step 3: Processing

- Full-width `<ProgressBar>` with animated fill
- Status label: "Converting your file…" → "Almost done…" (at > 80%)
- Progress percentage driven by `useJobWebSocket` WebSocket events — no polling
- If job fails: transition to an error state with message "Conversion failed" + [Try again] button that resets to Step 1

### Step 4: Download Result

- Large prominent **[Download converted file]** `<Button variant="primary" size="lg">`
- File info summary: "output.png — 1.2 MB" (original → converted size comparison if available)
- Secondary action: **[Convert another file]** resets the entire flow to Step 1
- Soft upsell: "View in My Jobs →" link to `/app/jobs` to see this job in context

### State Management

All flow state (current step, selected file, selected format, jobId, progress) lives in a single `useConvertFlow` hook local to this feature. No global store changes needed.

The hook orchestrates:
1. Upload mutation (`useUploadFile`)
2. Job submit mutation (`useSubmitJob`)
3. WebSocket subscription via `useJobWebSocket`
4. Step transitions based on job status events

---

## Component Structure

```
features/converter/
  pages/
    ConverterPage.tsx          ← replace stub (default export)
  components/
    ConvertFlow.tsx            ← orchestrates the 4-step flow
    FileInputStep.tsx          ← step 1
    ConvertOptionsStep.tsx     ← step 2
    ProcessingStep.tsx         ← step 3
    DownloadStep.tsx           ← step 4
    FormatSelector.tsx         ← segmented format picker
  hooks/
    useConvertFlow.ts          ← all flow state + side effects
    useFormatOptions.ts        ← derives available formats from file type
```

---

## Acceptance Criteria

- [ ] `/app/convert` renders a functional conversion flow (not a stub)
- [ ] Step 1: user can drop or click-to-select a file; accepted types are enforced
- [ ] Step 1 → Step 2 transition occurs automatically on file selection
- [ ] Step 2: format options are contextual to the detected input file type
- [ ] Step 2: "Convert Now" button submits upload + job correctly
- [ ] Step 3: progress bar updates live via WebSocket (no polling, no full refetch)
- [ ] Step 3: job failure renders an error state with a "Try again" reset
- [ ] Step 4: download button downloads the converted file
- [ ] Step 4: "Convert another file" resets to Step 1
- [ ] All steps use `Card`, `Button`, `ProgressBar`, `Spinner` from PRD-01
- [ ] No page navigation occurs during the flow (single-page experience)
- [ ] Uploaded file is scoped to the authenticated user (no cross-user access)

---

## Out of Scope

- Batch conversion (multiple files at once)
- Advanced options (quality, resolution, bitrate)
- Preview of the converted output (thumbnail)
- Guest (unauthenticated) conversion — tracked in PRD-05
