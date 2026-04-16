---
# Spec: Login & Logout Pages

## 1. Context & User Story (Human Layer)
- **SRS Reference:** FR-01
- **Overview:** Build the `/login` page with an email/password form that calls the existing `signIn` server action, and a logout server action callable from the dashboard nav. Together these give Admin and Manager users a visible entry and exit point for their authenticated session.
- **User Story:** "As an Admin or Manager, I want a login page to authenticate with my email and password and a logout button in the dashboard so that I can securely start and end my session."
- **Depends on:** Step 06 — Supabase Auth Setup (signIn/signOut via `@supabase/ssr`), Step 07 — Profiles Table + Auto-Create Trigger (profile row must exist after login).

---

## 2. Technical Blueprint (Agent Layer)

### Interface & Contract

| Interface | Method | Path / Action | Access | Behaviour |
| :--- | :--- | :--- | :--- | :--- |
| Page | GET | `/login` | Public (unauthenticated) | Renders RTL email/password form; already-authenticated users are redirected to `/dashboard` |
| Server Action | POST | `signIn(formData)` | Public | Calls `supabase.auth.signInWithPassword`; on success redirects to `/dashboard`; on failure returns `{ error: string }` |
| Server Action | POST | `signOut()` | Auth | Calls `supabase.auth.signOut`; clears session cookie; redirects to `/login` |
| Component | — | `LogoutButton` | Auth (client) | Client Component with a form that submits the `signOut` action; renders inside dashboard layout |

### Execution Plan

- **Database:** Schema stable — no changes.
- **Modify:**
  - `src/app/dashboard/page.tsx` — add `LogoutButton` import and render it in the dashboard header area.
- **Create:**
  - `src/lib/actions/auth.ts` — server actions `signIn(formData)` and `signOut()` using `createSupabaseServerClient`.
  - `src/app/login/page.tsx` — RTL login page; `<form>` with email + password inputs, error display, and submit button; uses `signIn` server action via form `action` prop.
  - `src/components/auth/LogoutButton.tsx` — `'use client'` component; wraps `signOut` in a `<form>` so it is safe in the App Router (no client-side fetch needed).

### RTL Checklist

- [ ] All layout classes use logical properties (`ps-*`, `pe-*`, `ms-*`, `me-*`, `text-start`, `text-end`)
- [ ] No `left-*`, `right-*`, `text-left`, `text-right` in new files
- [ ] Component tested with `lang="ur"` and `lang="fa"` on `<html>`

### Logic Scenarios (Gherkin-style)

- **Scenario:** Success — valid credentials
  - **Given:** A user exists in Supabase Auth with a known email and password
  - **When:** The login form is submitted with correct credentials
  - **Then:** `signIn` sets a `sb-*` session cookie and performs a server-side redirect to `/dashboard`; the dashboard renders with the user authenticated

- **Scenario:** Failure — wrong password
  - **Given:** A user exists but the wrong password is supplied
  - **When:** The login form is submitted
  - **Then:** `signIn` returns `{ error: 'ایمیل یا رمز عبور نادرست است.' }`; the login page re-renders with the error message inline; no session cookie is written

- **Scenario:** Success — user logs out
  - **Given:** An authenticated user is on `/dashboard`
  - **When:** The `LogoutButton` form is submitted
  - **Then:** `signOut` calls `supabase.auth.signOut`, clears the session cookie, and redirects to `/login`

- **Scenario:** Already authenticated — visiting `/login`
  - **Given:** A user with a valid session cookie navigates to `/login`
  - **When:** The login page Server Component runs `supabase.auth.getUser()`
  - **Then:** The page redirects to `/dashboard` without rendering the form

### Edge Cases

> **Required** — auth flow with cookie and redirect side-effects.

- **Edge:** Form submitted with empty email or password
  - **Given:** One or both fields are blank
  - **When:** The form is submitted
  - **Then:** HTML5 `required` attributes prevent submission client-side; if bypassed, `signInWithPassword` returns an error which is surfaced as the inline error string; no session is created

- **Edge:** `signOut` called when session is already expired or missing
  - **Given:** The session cookie is absent or expired before `signOut` fires (e.g., tab left open overnight)
  - **When:** `LogoutButton` form is submitted
  - **Then:** `supabase.auth.signOut` is called (it is a no-op for an already-invalid session); redirect to `/login` still proceeds; no error is thrown or shown

- **Edge:** Rapid double-submit on login form
  - **Given:** A user clicks submit twice quickly before the first response returns
  - **When:** Two `signIn` calls fire nearly simultaneously with the same credentials
  - **Then:** Both resolve successfully (Supabase is idempotent for valid credentials); the redirect from the first response wins; no duplicate session state or error

- **Edge:** `signIn` redirects inside a Server Action (Next.js `redirect()` throws)
  - **Given:** `redirect('/dashboard')` is called inside a `try/catch` block
  - **When:** `redirect()` internally throws a special Next.js error
  - **Then:** The `catch` block does **not** swallow this error — `redirect` throws must not be caught; structure the action so `redirect` is called outside any `try/catch`

### Hard Constraints
> Inherited from `CLAUDE.md — Coding Standards`. No exceptions.
- `SUPABASE_SERVICE_ROLE_KEY` must never appear in any client-side file.
- `createSupabaseServerClient` is server-only — never import it in `LogoutButton.tsx`.
- No `any` types; all form data typed via `FormData` API.
- `signOut` server action must validate via `supabase.auth.getUser()` before calling `signOut` to avoid acting on a spoofed request.

---

## 3. Automated Checks
> Run `/verify-spec 08-login-logout` immediately after implementation.

| # | Check | Tool | Pass Condition |
| :- | :--- | :--- | :--- |
| 1 | TypeScript compilation | `npx tsc --noEmit` | Exit 0, zero type errors |
| 2 | RTL class audit | `/fix-rtl` on `src/app/login/page.tsx` and `src/components/auth/LogoutButton.tsx` | 0 directional replacements needed |
| 3 | Role guard audit | `/secure-action` on `src/lib/actions/auth.ts` | No delete/update mutations — omit if tool flags N/A |

---

## 4. Definition of Done

- [ ] `npx tsc --noEmit` exits with 0 errors
- [ ] `src/app/login/page.tsx` renders an RTL-correct email/password form
- [ ] Valid credentials → session cookie set → redirect to `/dashboard`
- [ ] Invalid credentials → inline error message displayed; no redirect
- [ ] Already-authenticated visit to `/login` → redirect to `/dashboard` (no form flash)
- [ ] `LogoutButton` visible in dashboard; clicking it clears the session and redirects to `/login`
- [ ] `/fix-rtl` run on all new UI files — 0 replacements needed
- [ ] Login page renders correctly with `lang="ur"` (Noto Nastaliq, RTL layout)
- [ ] Login page renders correctly with `lang="fa"` (Vazirmatn, RTL layout)
