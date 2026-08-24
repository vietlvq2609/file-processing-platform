# PRD-05 — Public Landing Page

**Status:** 🔲 Not Started
**Theme:** User Acquisition / First Impression
**Depends on:** PRD-01 (design system)
**Blocks:** PRD-06

---

## Goal

Replace the current redirect-to-login root route with a public-facing landing page. Visitors can understand what the platform does, immediately try it without signing up, and only encounter an auth prompt after receiving value. This is the single highest-impact conversion change.

## Why It Matters

Currently, anyone who visits `/` is immediately redirected to `/login`. The platform's value proposition is never communicated before asking for a commitment. A landing page with an immediate demo moment ("drop a file and process it") dramatically lowers acquisition friction.

---

## Scope

### Route

`/` — **public** (no `<ProtectedRoute>` wrapper), new `PublicLayout`

Authenticated users who visit `/` see the same landing page (no forced redirect to dashboard). The nav shows a **"Go to Dashboard →"** CTA instead of "Sign up" if the user is already logged in.

### Page Sections

#### Section 1: Hero

```
┌──────────────────────────────────────────────────────┐
│  [FileProc logo]                [Login]  [Sign up]   │
├──────────────────────────────────────────────────────┤
│                                                      │
│   Process any file.  Instantly.                      │
│   Convert, compress, and transform files in          │
│   seconds — no sign-up required.                     │
│                                                      │
│   ┌──────────────────────────────────────────────┐   │
│   │  [Convert]  [Compress]  (tab strip)          │   │
│   │                                              │   │
│   │     DROP YOUR FILE HERE                      │   │
│   │     or click to browse                       │   │
│   └──────────────────────────────────────────────┘   │
│                                                      │
└──────────────────────────────────────────────────────┘
```

- The hero upload zone is the primary interactive element; it appears above the fold
- Tool tabs pre-select the operation; tab content swaps the `accept` filter and option panel below the drop zone
- "No sign-up required" is visually prominent — it is the key objection handler

#### Section 2: How It Works

Three steps, horizontal card row:

1. **Drop your file** — "Drag and drop or click to upload. We support images, PDFs, videos, and more."
2. **Choose an operation** — "Convert formats, compress size, or apply transformations."
3. **Download instantly** — "Your processed file is ready in seconds. No account needed."

#### Section 3: Tool Showcase

Simple grid of tool cards (4–6), each showing:
- Tool icon
- Tool name
- One-line description
- "Try it →" link to the tool tab in the hero zone (anchor scroll) or to the authenticated tool page

Examples: Convert Images, Compress PDF, Resize Video, Convert Audio

#### Section 4: Sign-up CTA (bottom)

```
┌──────────────────────────────────────────────────────┐
│  Want to save your history?                          │
│  Create a free account and track every file          │
│  you've processed.                                   │
│                                                      │
│  [Create free account]    [Sign in]                  │
└──────────────────────────────────────────────────────┘
```

### Guest Processing Flow

When a guest drops a file in the hero zone:

1. File is uploaded and job is submitted without authentication
2. Progress is shown inline in the hero zone (progress bar + status message)
3. On completion: **[Download your file]** button appears
4. Below the download button: a soft upsell prompt — "Save this to your history — it's free" with [Sign up] and [Sign in] links
5. The processed file download link is ephemeral (backend generates a short-lived signed URL or returns the file directly)

> **Backend note:** Guest processing requires the API to accept job submissions without a JWT. This may require a new guest-mode endpoint or a relaxed auth on the existing upload + job submit endpoints. The scope of backend changes is tracked separately. If the backend does not yet support guest mode, the hero zone falls back to showing a "Sign up free to process files →" CTA instead of an actual drop zone.

### Public Navigation Bar (`PublicLayout`)

- Brand logo (left) + [Login] [Sign up] buttons (right)
- Minimal, no tool links (those are app-internal)
- Sticky on scroll

---

## Component Structure

```
pages/LandingPage.tsx                         ← new (default export)

components/layout/
  PublicLayout.tsx                            ← new: wraps public routes
  PublicNav.tsx                               ← new: logo + auth CTAs

features/landing/
  components/
    HeroSection.tsx                           ← upload zone + tool tabs
    HeroUploadZone.tsx                        ← guest-capable upload widget
    HowItWorksSection.tsx                     ← 3-step cards
    ToolShowcaseSection.tsx                   ← tool grid
    SignupCtaSection.tsx                      ← bottom CTA strip
  hooks/
    useGuestJob.ts                            ← manages guest upload + poll/ws for progress
```

---

## Acceptance Criteria

- [ ] `/` renders the landing page (not a redirect to `/login`)
- [ ] Page has all four sections: Hero, How It Works, Tool Showcase, Sign-up CTA
- [ ] Tool tabs (Convert / Compress) switch the active drop zone context
- [ ] Authenticated users see "Go to Dashboard →" instead of "Sign up" in the nav
- [ ] Guest file drop shows a progress indicator and download button on completion
- [ ] If backend does not support guest mode, the hero zone shows a sign-up CTA instead and no error is thrown
- [ ] [Login] and [Sign up] nav buttons link to `/login` and `/register` respectively
- [ ] Page is responsive (single column on mobile)
- [ ] Uses `Card`, `Button`, `ProgressBar`, `Spinner` from PRD-01
- [ ] No internal app navigation links (tool pages are app-only)

---

## Out of Scope

- Animated hero or scroll-triggered animations
- Marketing copy A/B testing
- SEO meta tags / Open Graph (good to have, not required now)
- Blog or documentation links
- Pricing section (covered in PRD-09 Settings as a freemium concept)
