# PRD-06 — Auth Pages Refactor

**Status:** 🔲 Not Started
**Theme:** Auth / Onboarding
**Depends on:** PRD-01 (design system), PRD-05 (landing page introduces /register)
**Blocks:** None

---

## Goal

Upgrade the current single-screen `LoginPage` into a polished, two-state auth experience (Login + Register) that feels consistent with the platform's clean & minimal aesthetic. Reduce friction for new users arriving from the landing page.

## Why It Matters

The current `LoginPage` is a minimal form with no registration path. New users from the landing page's "Sign up free" CTA hit a dead end. This PRD adds the registration form and polishes both screens using the design system from PRD-01.

---

## Scope

### Routes

| Path | Purpose |
|------|---------|
| `/login` | Login form (existing, refactored) |
| `/register` | Registration form (new) |

Both routes are **public** (no `<ProtectedRoute>`). Authenticated users who visit either are redirected to `/app/dashboard`.

### Shared Auth Layout

Both pages share a centered, split-panel layout:

```
┌────────────────┬────────────────────────────────────┐
│                │                                    │
│  Brand panel   │   Form panel                       │
│  (left, 40%)   │   (right, 60%)                     │
│                │                                    │
│  "FileProc"    │   [Login / Register form]          │
│  tagline       │                                    │
│                │   Tab strip: Login | Register      │
└────────────────┴────────────────────────────────────┘
```

On mobile (< 768 px): brand panel is hidden; form panel fills the screen.

The tab strip allows switching between Login and Register **without a full page navigation** — it uses React Router `<NavLink>` so the URL still updates (shareable links) but the layout does not re-mount.

### Login Form

Fields:
- **Email** — `<Input type="email">` (PRD-01)
- **Password** — `<Input type="password">`
- **[Sign in]** — `<Button variant="primary" isLoading>` (PRD-01)

Behaviour:
- On submit: calls existing `login()` API, stores token in Zustand, redirects to `/app/dashboard`
- Validation: both fields required, email format validated client-side before submit
- API error (401): display inline error message below the form ("Invalid email or password")
- Network error: display generic "Something went wrong, please try again" inline

No "Remember me" or "Forgot password" — out of scope.

### Register Form

Fields:
- **Email** — `<Input type="email">`
- **Password** — `<Input type="password">` (min 8 characters)
- **Confirm password** — `<Input type="password">`
- **[Create account]** — `<Button variant="primary" isLoading>`

Behaviour:
- Client-side validation before submit: all fields required, password ≥ 8 chars, passwords match
- On submit: calls `POST /api/v1/auth/register` (new backend endpoint — see backend note)
- On success: auto-login (store token) + redirect to `/app/dashboard`
- API error (409 conflict — email taken): inline error "An account with this email already exists"

> **Backend note:** `POST /api/v1/auth/register` is a new endpoint. If it does not yet exist, the form should show a placeholder state: form renders but submit button is disabled with tooltip "Registration coming soon". The PRD is implementable on the frontend independent of the backend.

### Visual Polish

Using PRD-01 primitives:
- Form container: `<Card>` with generous padding (32 px)
- All inputs use the `<Input>` primitive with label + error state
- Submit button uses `<Button variant="primary" isLoading>`
- Error messages use red text (`var(--color-danger)`) below the relevant field
- Success feedback (after register): brief "Account created!" confirmation before redirect

---

## Component Structure

```
pages/
  LoginPage.tsx              ← refactor existing
  RegisterPage.tsx           ← new (default export)

features/auth/
  components/
    AuthLayout.tsx           ← shared split-panel wrapper
    AuthTabStrip.tsx         ← Login | Register tab navigation
    LoginForm.tsx            ← form logic + validation
    RegisterForm.tsx         ← form logic + validation
  hooks/
    useLoginForm.ts          ← form state, validation, mutation
    useRegisterForm.ts       ← form state, validation, mutation
```

---

## Acceptance Criteria

- [ ] `/login` renders the login form inside the split-panel layout
- [ ] `/register` renders the register form inside the split-panel layout
- [ ] Tab strip switches between login and register; URL updates accordingly
- [ ] Authenticated users visiting either route are redirected to `/app/dashboard`
- [ ] Login form: submits with valid credentials, stores token, redirects to dashboard
- [ ] Login form: shows inline error on 401 response
- [ ] Register form: validates all fields client-side before submit
- [ ] Register form: shows inline error on duplicate email (409)
- [ ] Register form: on success, logs the user in and redirects to dashboard
- [ ] On mobile: brand panel is hidden, form fills the screen
- [ ] All inputs use the `<Input>` primitive; button uses `<Button isLoading>` from PRD-01
- [ ] No third-party form library used

---

## Out of Scope

- Forgot password / password reset flow
- OAuth / social login
- Email verification
- "Remember me" / persistent sessions
