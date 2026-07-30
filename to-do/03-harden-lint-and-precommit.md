# Ticket 03 — Harden Lint Rules and Add Pre-commit Hooks

## Problem

The current ESLint setup is functional but uses only the minimal `recommended` ruleset. Several
categories of bugs and inconsistencies that are common in this codebase are not caught:

1. **Async safety** — `typescript-eslint/recommended` does NOT include `no-floating-promises` or
   `no-misused-promises`. In an async-heavy Fastify + BullMQ codebase, an unawaited promise is a
   silent bug. These rules require the `strict` or `strictTypeChecked` ruleset.

2. **Logger discipline** — There is no `no-console` rule. The codebase uses Pino as its logger,
   but `console.log` will slip into production code (and into AI-generated code) unnoticed.

3. **Import ordering** — There is no import sort/order rule. AI-generated code will add imports
   in random order, causing noisy diffs and making file structure hard to scan.

4. **`*.js` files excluded from lint** — The ESLint `ignores` list contains `**/*.js`, which
   silently skips `eslint.config.js`, `vite.config.ts` output, and `drizzle.config.ts`. While
   some of these should remain ignored, the blanket exclusion is too broad.

5. **No pre-commit enforcement** — `pnpm lint` and `pnpm format` are optional. Nothing prevents
   a commit with lint errors, type errors, or unformatted code from reaching the main branch.
   Without husky + lint-staged, the main branch accumulates violations over time.

## Current State

**`eslint.config.js`:**
```javascript
// Uses only:
js.configs.recommended
...ts.configs.recommended    // ← not strict, missing no-floating-promises etc.
// Missing: no-console, simple-import-sort, strictTypeChecked
```

**`package.json` (root):**
```json
// No husky, no lint-staged, no "prepare" script
// devDependencies has no husky or lint-staged
```

## Acceptance Criteria

### 1 — Upgrade to `strictTypeChecked`

- [ ] In `eslint.config.js`, replace `...ts.configs.recommended` with
      `...ts.configs.recommendedTypeChecked` (or `strictTypeChecked`) for backend and shared
      packages.
- [ ] Add `languageOptions.parserOptions.project` pointing to each app's `tsconfig.json` so
      type-aware rules have type information.
- [ ] Confirm `no-floating-promises`, `no-misused-promises`, `await-thenable` are now active.
- [ ] The frontend (`apps/web`) may use `recommended` rather than `strictTypeChecked` if the
      type-checked rules cause excessive noise on JSX files — document the decision in a comment.

### 2 — Add `no-console` rule

- [ ] Add `'no-console': 'error'` to the base TypeScript config block.
- [ ] Add an override to allow `console.error` in `apps/api/src/index.ts` only (startup error
      before logger is initialised), using an inline `// eslint-disable-next-line no-console`
      comment so the exception is explicit.

### 3 — Add import sorting

- [ ] Install `eslint-plugin-simple-import-sort` as a root devDependency.
- [ ] Add the plugin and enable rules:
  ```javascript
  'simple-import-sort/imports': 'error',
  'simple-import-sort/exports': 'error',
  ```
- [ ] Run `pnpm lint:fix` after enabling to auto-fix all existing files.

### 4 — Fix the `*.js` ignore

- [ ] Change the blanket `**/*.js` ignore to a more targeted list:
  ```javascript
  ignores: [
    '**/dist/**',
    '**/node_modules/**',
    '**/drizzle/**',
    '**/uploads/**',
  ]
  ```
- [ ] Verify `eslint.config.js` itself is now linted (it is already valid JS/ESM — this is a
      no-op check but confirms the ignore was too broad).

### 5 — Add husky + lint-staged pre-commit hook

- [ ] Install husky and lint-staged as root devDependencies:
  ```bash
  pnpm add -D husky lint-staged -w
  ```
- [ ] Add a `"prepare": "husky"` script to the root `package.json`.
- [ ] Initialise husky: `pnpm husky init`
- [ ] Create `.husky/pre-commit` that runs `pnpm lint-staged`.
- [ ] Add `lint-staged` config to root `package.json`:
  ```json
  "lint-staged": {
    "apps/**/src/**/*.{ts,tsx}": ["eslint --fix", "prettier --write"],
    "packages/**/src/**/*.ts": ["eslint --fix", "prettier --write"]
  }
  ```
- [ ] Verify: making a change with a `console.log` and attempting `git commit` should be blocked
      with an ESLint error.

## Files to Modify / Create

| Action | Path |
|---|---|
| Modify | `eslint.config.js` — upgrade ruleset, add plugins/rules |
| Modify | `package.json` (root) — add prepare script, lint-staged config |
| Install deps | `husky`, `lint-staged`, `eslint-plugin-simple-import-sort` |
| Create | `.husky/pre-commit` |

## Verification

```bash
pnpm lint           # zero errors across all workspaces
pnpm format:check   # zero formatting violations

# Test pre-commit hook
echo 'console.log("test")' >> apps/api/src/index.ts
git add apps/api/src/index.ts
git commit -m "test"   # should be BLOCKED by lint-staged
git checkout apps/api/src/index.ts  # restore
```

## Notes

- `strictTypeChecked` requires `parserOptions.project`. This will slow down lint runs. If
  performance is unacceptable, scope it to backend only and use `recommended` for the frontend.
- Do not add `@typescript-eslint/explicit-function-return-type` — it conflicts with inferred
  return types which are idiomatic in this codebase.
