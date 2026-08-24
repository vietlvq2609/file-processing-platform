# PRD-09 — Settings Page

**Status:** 🔲 Not Started
**Theme:** Account Management / Freemium Awareness
**Depends on:** PRD-01 (design system), PRD-02 (routes)
**Blocks:** None

---

## Goal

Provide authenticated users with a central settings page covering their profile, current usage against plan limits, and an API key management section. The usage panel also serves as the primary in-app freemium upgrade prompt.

## Why It Matters

For a freemium SaaS, users need to understand their current plan constraints without hitting an error wall. Surfacing usage proactively (before limits are hit) is better for conversion and retention than a hard block with a confusing error message.

---

## Scope

### Route

`/app/settings` — authenticated, inside `<AppLayout>`

### Page Layout

Sidebar-style tabbed layout:

```
┌──────────────┬────────────────────────────────────────┐
│  Settings    │                                        │
│              │   [Tab content area]                   │
│  > Profile   │                                        │
│    Usage     │                                        │
│    API Keys  │                                        │
│              │                                        │
└──────────────┴────────────────────────────────────────┘
```

On mobile: sidebar collapses to a horizontal tab strip above the content area.

---

### Tab 1: Profile

**Current email** — displayed read-only (not editable in this PRD).

**Change password form:**
- Current password — `<Input type="password">`
- New password — `<Input type="password">` (min 8 chars)
- Confirm new password — `<Input type="password">`
- **[Update password]** `<Button variant="primary" isLoading>`

Behaviour:
- Client-side validation before submit (all fields required, new passwords match, min length)
- Calls `PUT /api/v1/auth/password` (new backend endpoint)
- Success: inline "Password updated" confirmation message, form resets
- Error (wrong current password): "Current password is incorrect"

> **Backend note:** If `PUT /api/v1/auth/password` does not exist, the form renders but the button is disabled with label "Coming soon".

**Danger zone:**
- **[Delete account]** `<Button variant="danger">` — opens a `<Modal>` confirming the action with email re-entry required before proceeding
- Out of scope for initial implementation — button can be present but disabled with "Coming soon" label

---

### Tab 2: Usage & Quota

Displays the user's current consumption against their plan limits.

```
┌──────────────────────────────────────────────────────┐
│  Plan: Free Tier                                     │
│                                                      │
│  Files uploaded   ████████░░░░░░░░  8 / 50           │
│  Jobs run         ████░░░░░░░░░░░░  12 / 100  /month │
│  Storage used     ██░░░░░░░░░░░░░░  45 MB / 500 MB   │
│                                                      │
│  ┌──────────────────────────────────────────────┐    │
│  │  Need more? Upgrade to Pro.                  │    │
│  │  Unlimited jobs · 10 GB storage · API access │    │
│  │  [Upgrade to Pro]                            │    │
│  └──────────────────────────────────────────────┘    │
└──────────────────────────────────────────────────────┘
```

Each quota row uses `<ProgressBar>` from PRD-01:
- ≤ 70% used: default (brand colour)
- 71–90% used: warning (amber)
- > 90% used: danger (red)

Quota values:
- **Files uploaded**: total file count from `GET /api/v1/files` `meta.total` vs hardcoded free-tier limit (50)
- **Jobs run**: total job count from `GET /api/v1/jobs` `meta.total` vs hardcoded limit (100/month — note: monthly reset not tracked in this PRD, use all-time count as proxy)
- **Storage used**: sum of file sizes vs hardcoded limit (500 MB)

Hardcoded limits are defined in a `constants/plans.ts` file so they can be easily changed.

The upgrade CTA `<Button>` links to an external URL (`#` placeholder until a billing page exists).

---

### Tab 3: API Keys

Allows users to generate and revoke API keys for programmatic access (a freemium "Pro" feature).

```
┌──────────────────────────────────────────────────────┐
│  API Keys                                            │
│  Use these keys to access the FileProc API.          │
│                                                      │
│  [+ Generate new key]                                │
│                                                      │
│  sk-••••••••••••••••  Created 2 days ago  [Revoke]  │
│  sk-••••••••••••••••  Created 14 days ago [Revoke]  │
└──────────────────────────────────────────────────────┘
```

Behaviour:
- Keys are masked by default (show only last 4 chars); a [Show] toggle reveals the full key
- [+ Generate new key] calls `POST /api/v1/api-keys` (new endpoint)
- [Revoke] calls `DELETE /api/v1/api-keys/:id` — opens a confirmation `<Modal>` before proceeding
- On key generation, the full key is shown once in a highlighted box with a [Copy] button; subsequent views only show the masked version
- Limit: max 5 active API keys per user (enforced by API)

> **Backend note:** If the API keys endpoint does not exist, the entire tab renders a placeholder: "API key management coming soon" with the upgrade CTA.

---

## Component Structure

```
pages/SettingsPage.tsx                         ← new (default export)

features/settings/
  components/
    SettingsSidebar.tsx                        ← tab navigation
    ProfileTab.tsx                             ← profile + password change
    UsageTab.tsx                               ← quota bars + upgrade CTA
    ApiKeysTab.tsx                             ← key list + generate/revoke
    QuotaBar.tsx                               ← single usage row (label + ProgressBar)
    ApiKeyRow.tsx                              ← single key row
    ChangePasswordForm.tsx                     ← form with validation
  hooks/
    useChangePassword.ts                       ← mutation + validation state
    useApiKeys.ts                              ← query + create/revoke mutations
```

---

## Acceptance Criteria

- [ ] `/app/settings` renders the tabbed settings layout
- [ ] Sidebar/tab strip switches between Profile, Usage, and API Keys tabs
- [ ] Profile tab: change password form validates and submits correctly
- [ ] Profile tab: success and error states are displayed inline
- [ ] Usage tab: all 3 quota rows render with correct values from API
- [ ] Usage tab: `<ProgressBar>` uses correct colour variant based on usage %
- [ ] Usage tab: upgrade CTA is visible
- [ ] API Keys tab: existing keys are listed with masked values
- [ ] API Keys tab: [+ Generate new key] creates a key and shows the full value once
- [ ] API Keys tab: [Revoke] opens a confirmation modal before deleting
- [ ] If backend endpoints are absent, tabs degrade gracefully (no errors thrown)
- [ ] Layout is responsive (tabs go horizontal on mobile)
- [ ] Uses `Card`, `Button`, `Input`, `Modal`, `ProgressBar` from PRD-01

---

## Out of Scope

- Email change
- Account deletion (button present but disabled)
- Billing / payment integration
- Plan upgrade checkout flow
- Monthly job count reset logic
- Team/organisation settings
