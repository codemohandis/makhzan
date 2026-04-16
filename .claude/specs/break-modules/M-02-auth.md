# M-02 · Auth — Module Breakdown

**Generated:** 2026-04-16  
**Module FR:** FR-01, FR-06  
**Total features:** 4 (0 specced, 4 need spec)

---

## Feature Table

| Step | Feature ID | Feature Name | Priority | Depends On | Spec File |
|---|---|---|---|---|---|
| 06 | F-02-01 | Configure Supabase Auth | P0 | F-01-01 | `.claude/specs/feature-specs/06-supabase-auth.md` |
| 07 | F-02-02 | Create Profiles Table + Trigger | P0 | F-02-01, F-06-01 | `.claude/specs/feature-specs/07-profiles-trigger.md` |
| 08 | F-02-03 | Build Login & Logout Pages | P0 | F-02-01, F-02-02 | `.claude/specs/feature-specs/08-login-logout.md` |
| 09 | F-02-04 | Implement Admin Role Elevation | P1 | F-02-02 | `.claude/specs/feature-specs/09-role-elevation.md` |

---

## Per-Feature Summaries

### F-02-01 — Configure Supabase Auth
- **What:** Wire `@supabase/ssr` into the Next.js 15 app so email/password sign-in and session cookies work end-to-end.
- **Why:** FR-01 requires Supabase Auth email/password; all subsequent auth features depend on a functioning client+server Supabase session.
- **Files touched:** `src/lib/supabase/client.ts`, `src/lib/supabase/server.ts`, `.env.local`
- **Acceptance signal:** `supabase.auth.getUser()` in a Server Component returns a live user object after sign-in — no `null` on reload.

### F-02-02 — Create Profiles Table + Trigger
- **What:** A `profiles` table is auto-populated on every new Supabase Auth signup via a Postgres trigger; row includes `full_name`, `role` (default `manager`).
- **Why:** FR-01 specifies the trigger; FR-06 RBAC and all delete guards rely on `profiles.role`.
- **Files touched:** `supabase/migrations/<timestamp>_profiles.sql`, `src/types/index.ts`
- **Acceptance signal:** Registering a new user in Supabase Auth automatically creates a matching `profiles` row with `role = 'manager'`.

### F-02-03 — Build Login & Logout Pages
- **What:** `/login` renders an RTL email/password form; successful sign-in redirects to `/dashboard`; a logout action clears the session and redirects to `/login`.
- **Why:** FR-01 unauthenticated entry point; F-01-05 middleware assumes `/login` exists as the redirect target.
- **Files touched:** `src/app/(auth)/login/page.tsx`, `src/app/(auth)/login/LoginForm.tsx`, `src/app/(auth)/login/loading.tsx`, `src/lib/actions/auth.ts`
- **Acceptance signal:** Visiting `/dashboard` unauthenticated lands on `/login`; valid credentials land on `/dashboard`; logout returns to `/login`.

### F-02-04 — Implement Admin Role Elevation
- **What:** A server action (admin-only) updates `profiles.role` from `manager` to `admin` for a given user ID; a minimal dashboard UI exposes the control.
- **Why:** FR-06 requires at least one admin; the system starts with all users as `manager` so there must be a promotion path.
- **Files touched:** `src/lib/actions/auth.ts` (`elevateToAdmin`), `src/app/dashboard/users/page.tsx`
- **Acceptance signal:** An existing admin can elevate a manager; a manager calling the same action receives a `403 Forbidden` error.
