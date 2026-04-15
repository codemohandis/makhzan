# Spec: Auth Middleware

## 1. Context & User Story (Human Layer)

- **SRS Reference:** FR-01 (Authentication — acceptance signal: unauthenticated `/dashboard` → redirect to `/login`)
- **Overview:** Add a Next.js edge middleware that intercepts all `/dashboard/**` requests and redirects unauthenticated visitors to `/login`. Also establishes the Supabase SSR client helpers (`server.ts`, `client.ts`) that every subsequent M-02–M-05 feature will reuse for session-aware data access.
- **User Story:** "As an unauthenticated visitor, I should be automatically redirected to the login page if I try to access any dashboard route, so that protected content is never accessible without a valid session."
- **Depends on:** Step 01 — Next.js 15 App Router Scaffold, Step 04 — Language Toggle Component (cookie infrastructure pattern)

---

## 2. Technical Blueprint (Agent Layer)

### Interface & Contract

| Interface | Type | Location | Access | Behaviour |
| :--- | :--- | :--- | :--- | :--- |
| `middleware` | Edge Function | `middleware.ts` (project root) | Public (intercept only) | Runs on `/dashboard/:path*`; calls `supabase.auth.getUser()`; redirects to `/login` if no user; refreshes session cookie on every response |
| `createSupabaseServerClient` | Helper fn | `src/lib/supabase/server.ts` | Server-only | Creates a Supabase client for Server Components and Server Actions using `cookies()` from `next/headers` |
| `createSupabaseBrowserClient` | Helper fn | `src/lib/supabase/client.ts` | Client-only | Creates a Supabase singleton for Client Components using `createBrowserClient` from `@supabase/ssr` |

### Execution Plan

- **Database:** Schema stable — no changes.

- **Create:**
  - `middleware.ts` (project root) — Next.js middleware using `@supabase/ssr` `createServerClient` with request/response cookies; calls `auth.getUser()` (not `getSession()` — server-side security requirement); redirects unauthenticated requests to `/login`; passes `supabaseResponse` through (preserves cookie refresh)
  - `src/lib/supabase/server.ts` — exports `createSupabaseServerClient()` using `createServerClient` from `@supabase/ssr` with `cookies()` from `next/headers`; marked `import 'server-only'` to prevent accidental client import
  - `src/lib/supabase/client.ts` — exports `createSupabaseBrowserClient()` using `createBrowserClient` from `@supabase/ssr`; singleton pattern to avoid multiple GoTrueClient warnings

- **Packages already installed:** `@supabase/ssr@^0.10.2`, `@supabase/supabase-js@^2.103.2` — no `npm install` needed.

- **Env vars required (already in `.env.local`):**
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### Middleware Cookie Pattern (`middleware.ts`)

```
createServerClient(URL, ANON_KEY, {
  cookies: {
    getAll()  → request.cookies.getAll()
    setAll()  → mutate request + rebuild NextResponse to propagate refreshed tokens
  }
})
→ supabase.auth.getUser()
→ if (!user && path.startsWith('/dashboard')) redirect('/login')
→ return supabaseResponse (always — preserves Set-Cookie headers)
```

### RTL Checklist
> Server-only feature — no UI files created. RTL checklist does not apply.

### Logic Scenarios (Gherkin-style)

- **Scenario:** Unauthenticated visitor hits `/dashboard`
  - **Given:** No Supabase session cookie is present
  - **When:** Browser navigates to `/dashboard` or any `/dashboard/**` sub-route
  - **Then:** Middleware redirects to `/login`; the original URL is not served

- **Scenario:** Authenticated user hits `/dashboard`
  - **Given:** A valid Supabase session cookie exists
  - **When:** Browser navigates to `/dashboard`
  - **Then:** Middleware calls `auth.getUser()`, receives a user object, passes the request through; session cookie is refreshed in the response if expiry is near

- **Scenario:** Session token refreshed transparently
  - **Given:** A near-expired JWT is present in the session cookie
  - **When:** Any `/dashboard/**` request is made
  - **Then:** `supabaseResponse` carries a refreshed `Set-Cookie` header; the user sees no interruption

- **Scenario:** Non-dashboard routes are unaffected
  - **Given:** Any route outside `/dashboard/**` (e.g., `/`, `/about`, `/login`)
  - **When:** Browser navigates to that route
  - **Then:** Middleware matcher does not fire; no Supabase call is made; zero latency overhead

### Hard Constraints
> Inherited from `CLAUDE.md — Coding Standards`. No exceptions.
>
> Additional: `SUPABASE_SERVICE_ROLE_KEY` must **never** appear in `middleware.ts` or any client-accessible module. Middleware uses `NEXT_PUBLIC_SUPABASE_ANON_KEY` only.

---

## 3. Definition of Done

- [ ] `npx tsc --noEmit` exits with 0 errors
- [ ] Unauthenticated `GET /dashboard` → HTTP 307 redirect to `/login` (verified in browser Network tab)
- [ ] Unauthenticated `GET /dashboard/articles` → HTTP 307 redirect to `/login`
- [ ] Authenticated `GET /dashboard` → 200 (passes through; page renders)
- [ ] Session cookie is refreshed: valid session on near-expired token → no logout forced, `Set-Cookie` present in response headers
- [ ] `src/lib/supabase/server.ts` is imported by a Server Component → no TypeScript errors
- [ ] `src/lib/supabase/client.ts` is imported by a Client Component → no TypeScript errors
- [ ] `SUPABASE_SERVICE_ROLE_KEY` does not appear anywhere in `middleware.ts`, `server.ts`, or `client.ts`
- [ ] Middleware `matcher` does not cover `/login`, `/`, or `/_next/**` routes (verified via `console.log` in dev or matcher config review)
