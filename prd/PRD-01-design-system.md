# PRD-01 — Design System Foundation

**Status:** 🔲 Not Started
**Theme:** Visual Polish / Foundation
**Depends on:** None
**Blocks:** PRD-03, PRD-04, PRD-05, PRD-06, PRD-07, PRD-08, PRD-09, PRD-10

---

## Goal

Establish a single source of truth for visual tokens (colour, typography, spacing, shadow) and a set of reusable UI primitives that every subsequent PRD will consume. This prevents divergent styling as new pages are added and makes the "clean & minimal" direction consistent across the entire app.

## Why It Matters

Every other PRD adds new components. Without a shared design language, each developer/session makes different colour and spacing choices, producing an incoherent UI. Doing this first is the cheapest way to get consistency.

---

## Scope

### 1. CSS Design Tokens (Tailwind theme extension)

Extend `tailwind.config` (or a root CSS file) with these semantic tokens:

| Token | Value | Usage |
|-------|-------|-------|
| `--color-brand` | `#6366f1` (indigo-500) | Primary CTAs, active nav, links |
| `--color-brand-light` | `#eef2ff` (indigo-50) | Active nav bg, tag backgrounds |
| `--color-success` | `#22c55e` | Completed status |
| `--color-warning` | `#f59e0b` | Processing status |
| `--color-danger` | `#ef4444` | Failed status, destructive actions |
| `--color-surface` | `#ffffff` | Card/panel backgrounds |
| `--color-border` | `#e5e7eb` (gray-200) | All borders |
| `--color-text-primary` | `#111827` (gray-900) | Headings, primary text |
| `--color-text-secondary` | `#6b7280` (gray-500) | Labels, meta text |
| `--color-text-muted` | `#9ca3af` (gray-400) | Placeholder, timestamps |

Font: set `font-family: 'Inter', system-ui, sans-serif` with `font-feature-settings: "cv02", "cv03", "cv04"` for clean numerics. Load Inter via Google Fonts or self-hosted in `index.html`.

Base spacing: 4 px grid — ensure all Tailwind spacing utilities are anchored to multiples of 4.

### 2. Shared UI Primitives (`apps/web/src/components/ui/`)

Build these components. Each takes only the props it needs — no over-engineering.

#### `Button`
```
Props: variant ('primary' | 'secondary' | 'ghost' | 'danger'), size ('sm' | 'md' | 'lg'), isLoading, disabled, children, onClick, type
```
- `primary`: solid brand bg, white text
- `secondary`: white bg, brand border + text
- `ghost`: no border, gray text, gray hover bg
- `danger`: solid red bg, white text
- Loading state shows a spinner inline, disables the button, preserves width

#### `Badge`
```
Props: variant ('default' | 'success' | 'warning' | 'danger' | 'info'), children
```
- Coloured dot + label, small pill shape
- Maps to job/file status colours defined above

#### `Card`
```
Props: children, className?
```
- White bg, `var(--color-border)` border, `border-radius: 12px`, subtle box-shadow on hover (`0 1px 4px rgba(0,0,0,.06)`)

#### `Spinner`
```
Props: size ('sm' | 'md' | 'lg'), className?
```
- Pure CSS animated border spinner, uses brand colour

#### `EmptyState`
```
Props: icon (React node), title, description, action? (label + onClick)
```
- Centred layout, icon on top, title, secondary description, optional CTA button

#### `ProgressBar`
```
Props: value (0–100), variant ('default' | 'success' | 'danger'), animated?
```
- Full-width track, filled bar in brand/status colour, transition on value change

#### `Input`
```
Props: label?, placeholder, value, onChange, error?, disabled, type
```
- Label above, border input, red border + error message below on error state

#### `Modal`
```
Props: isOpen, onClose, title, children, footer?
```
- Overlay backdrop, centred dialog, close on backdrop click or Escape key

---

## Acceptance Criteria

- [ ] All 8 UI primitives exist in `apps/web/src/components/ui/` as named exports
- [ ] A single CSS file (or Tailwind config) defines all design tokens listed above
- [ ] `Button` renders in all 4 variants and shows spinner when `isLoading` is true
- [ ] `Badge` renders correct colours for all 5 variants
- [ ] `ProgressBar` animates when `value` prop changes
- [ ] `Inter` font is loaded and applied globally
- [ ] Existing `FileDropZone` component is refactored to use `Button` and `Spinner` from the new primitives
- [ ] No third-party UI library is added

---

## Files to Create / Modify

```
apps/web/src/components/ui/
  Button.tsx             ← new
  Badge.tsx              ← new
  Card.tsx               ← new
  Spinner.tsx            ← new
  EmptyState.tsx         ← new
  ProgressBar.tsx        ← new
  Input.tsx              ← new
  Modal.tsx              ← new
  index.ts               ← re-export all (add new entries)

apps/web/src/index.css   ← add design tokens + Inter font import
apps/web/index.html      ← add Inter font <link> tag
```

---

## Out of Scope

- Dark mode
- Animation library (Framer Motion etc.)
- Icon library integration (use inline SVG or text symbols per component)
- Theming / CSS-in-JS
