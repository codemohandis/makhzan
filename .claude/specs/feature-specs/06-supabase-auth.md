# Spec: Supabase Auth Setup

## 1. Context & User Story (Human Layer)
- **SRS Reference:** FR-01
- **Overview:** Configure Supabase Auth (email/password) with `@supabase/ssr` so that session cookies are correctly set, read, and refreshed across Server Components, Server Actions, and Route Handlers in Next.js 15 App Router.
- **User Story:** "As an Admin or Manager, I want to sign in with my email and password so that my authenticated session persists across page navigations without re-login."
- **Depends on:** Step 01 — Next.js 15 App Router Scaffold, Step 02 — Tailwind RTL Configuration (env vars in `.env.local` must be set before this runs).

---

## 2. Technical Blueprint (Agent Layer)

### Interface & Contract

| Interface | Method | Path / Action | Access | Behaviour |
| :--- | :--- | :--- | :--- | :--- |
| Route Handler | GET | `/auth/callback` | Public | Exchanges PKCE auth code for session; sets cookie; redirects to `/dashboard` or `?error` |
| Utility | — | `createSupabaseServerClient()` | Server-only | Returns Supabase client with cookie read/write wired to Next.js `cookies()` |
| Utility | — | `createSupabaseBrowserClient()` | Client-only | Returns singleton Supabase client using `createBrowserClient` |

### Execution Plan

- **Database:** Schema stable — no changes. Supabase project must have Email provider enabled in Auth → Providers (manual step, documented in DoD).
- **Modify:**
  - `src/lib/supabase/server.ts` — already correct; verify `setAll` handles the `try/catch` required when called from Server Components (read-only cookie context). Add the guard so cookie writes in RSC don't throw.
  - `src/lib/supabase/client.ts` — already correct; no changes needed.
- **Create:**
  - `src/app/auth/callback/route.ts` — Route Handler that receives the `?code=` param from Supabase, calls `supabase.auth.exchangeCodeForSession(code)`, then redirects to `/dashboard`. Required for PKCE flow used by `@supabase/ssr`.

### RTL Checklist
> Skip — server-only feature; no UI files created.

### Logic Scenarios (Gherkin-style)

- **Scenario:** Success — valid credentials
  - **Given:** A user exists in Supabase Auth with email `test@example.com` and a known password
  - **When:** `supabase.auth.signInWithPassword({ email, password })` is called from `signIn()` server action
  - **Then:** A session cookie is written; subsequent `supabase.auth.getUser()` in a Server Component returns the user object (not `null`)

- **Scenario:** Failure — wrong password
  - **Given:** A user exists but the wrong password is supplied
  - **When:** `signIn()` is called
  - **Then:** `signIn()` returns `{ error: 'ایمیل یا رمز عبور نادرست است.' }`; no session cookie is written

- **Scenario:** Success — auth callback code exchange
  - **Given:** Supabase redirects to `/auth/callback?code=<pkce_code>`
  - **When:** The Route Handler processes the request
  - **Then:** `exchangeCodeForSession` succeeds; user is redirected to `/dashboard` with a valid session cookie

- **Scenario:** Failure — missing or expired code
  - **Given:** `/auth/callback` is hit without a valid `code` param (or with an expired one)
  - **When:** `exchangeCodeForSession` fails
  - **Then:** User is redirected to `/login?error=auth_callback_failed`; no partial session state remains

### Edge Cases

- **Edge:** Cookie write attempted inside a Server Component (read-only context)
  - **Given:** `createSupabaseServerClient()` is called from a Server Component that renders during a GET request (not a Server Action or Route Handler)
  - **When:** Supabase internally tries to call `setAll()` to refresh the session cookie
  - **Then:** The `setAll` call is wrapped in a `try/catch`; the error is silently swallowed; the read still succeeds and the component renders correctly

- **Edge:** Concurrent sign-in requests from the same device
  - **Given:** A user double-submits the login form before the first response arrives
  - **When:** Two `signInWithPassword` requests reach Supabase simultaneously
  - **Then:** Both requests succeed (Supabase is idempotent for valid credentials); only one session is active; no duplicate cookies or state corruption

- **Edge:** Tampered or forged session cookie
  - **Given:** An attacker manually sets a crafted `sb-*` cookie value
  - **When:** `supabase.auth.getUser()` is called on the server
  - **Then:** Supabase JWT verification fails; `getUser()` returns `{ data: { user: null }, error: ... }`; the middleware redirects to `/login`

### Hard Constraints
> Inherited from `CLAUDE.md — Coding Standards`. No exceptions.
- `SUPABASE_SERVICE_ROLE_KEY` must never appear in any client-side file.
- `createSupabaseServerClient` is marked `import 'server-only'` — keep it that way.
- No raw `<iframe>`, no `any` types.

---

## 3. Automated Checks
> Run `/verify-spec 06-supabase-auth` immediately after implementation.

| # | Check | Tool | Pass Condition |
| :- | :--- | :--- | :--- |
| 1 | TypeScript compilation | `npx tsc --noEmit` | Exit 0, zero type errors |

> RTL and role-guard checks omitted — this feature has no UI components and no mutating admin actions.

---

## 4. Definition of Done

- [ ] `npx tsc --noEmit` exits with 0 errors
- [ ] `src/app/auth/callback/route.ts` exists and correctly calls `exchangeCodeForSession`
- [ ] `createSupabaseServerClient` `setAll` is wrapped in `try/catch` so Server Component reads don't throw
- [ ] Signing in with valid credentials sets a `sb-*` session cookie (verifiable in browser DevTools → Application → Cookies)
- [ ] After sign-in, reloading `/dashboard` keeps the user authenticated (no redirect to `/login`)
- [ ] Signing in with an invalid password returns the error string without crashing
- [ ] Supabase project has Email provider enabled (Auth → Providers → Email: enabled, Confirm email: off for dev)
- [ ] `.env.local` contains `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` with real project values
