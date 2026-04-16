# Spec: Apply RLS Policies (Articles, Books, Videos)

## 1. Context & User Story (Human Layer)
- **SRS Reference:** FR-02, FR-03, FR-04, FR-06
- **Overview:** Adds Row-Level Security policies to the `articles`, `books`, and `videos` tables so that public users can only read published content, authenticated managers can create and edit their own records, and only admins can delete any row.
- **User Story:** "As an Admin, I want RLS policies enforced at the database layer so that no server-action bypass, misconfiguration, or direct API call can allow a Manager to delete content or an anonymous user to read unpublished drafts."
- **Depends on:** Step 24 — Migrate Articles Table · Step 25 — Migrate Books + Videos Tables · Step 07 — Profiles Table + Auto-Create Trigger (user_role enum must exist)

---

## 2. Technical Blueprint (Agent Layer)

### Interface & Contract
| Interface | Method | Path / Action | Access | Behaviour |
| :--- | :--- | :--- | :--- | :--- |
| RLS Policy | SELECT | `articles` | Public (anon) | Rows where `status = 'published'` only |
| RLS Policy | SELECT | `articles` | Authenticated (any role) | All rows — author sees drafts; manager/admin see all |
| RLS Policy | INSERT | `articles` | Authenticated (any role) | `author_id` must equal `auth.uid()` |
| RLS Policy | UPDATE | `articles` | Author or Admin | Author edits own rows; Admin edits any row |
| RLS Policy | DELETE | `articles` | Admin only | `(SELECT role FROM profiles WHERE id = auth.uid()) = 'admin'` |
| RLS Policy | SELECT | `books` | Public (anon) | All rows visible (no draft concept for books) |
| RLS Policy | INSERT | `books` | Authenticated (any role) | `author_id` must equal `auth.uid()` |
| RLS Policy | UPDATE | `books` | Author or Admin | Same pattern as articles |
| RLS Policy | DELETE | `books` | Admin only | Same admin role check |
| RLS Policy | SELECT | `videos` | Public (anon) | All rows visible (no draft concept for videos) |
| RLS Policy | INSERT | `videos` | Authenticated (any role) | `author_id` must equal `auth.uid()` |
| RLS Policy | UPDATE | `videos` | Author or Admin | Same pattern as articles |
| RLS Policy | DELETE | `videos` | Admin only | Same admin role check |

### Execution Plan
- **Database:** One new migration file — `supabase/migrations/20260416200000_apply_rls_policies.sql`
  - Articles: 5 policies (anon SELECT published, auth SELECT all, INSERT, UPDATE, DELETE)
  - Books: 4 policies (anon SELECT, INSERT, UPDATE, DELETE)
  - Videos: 4 policies (anon SELECT, INSERT, UPDATE, DELETE)
  - All `DROP POLICY IF EXISTS` guards before each `CREATE POLICY` for idempotency
- **Modify:** `docs/agent-context.md` — update "Pending" note under DB Schema Snapshot to mark RLS policies as applied
- **Create:**
  - `supabase/migrations/20260416200000_apply_rls_policies.sql` — all RLS policies for articles, books, and videos

### Logic Scenarios (Gherkin-style)
- **Scenario:** Success — Admin deletes an article
  - **Given:** User has role `admin` and is authenticated via Supabase JWT
  - **When:** A DELETE is issued on `public.articles` for any row
  - **Then:** Policy allows the operation; row is removed

- **Scenario:** Failure — Manager attempts delete
  - **Given:** User has role `manager` and is authenticated
  - **When:** A DELETE is issued on `public.articles` for any row
  - **Then:** RLS policy denies; Postgres returns 0 rows affected (no error thrown — caller must check `count`)

- **Scenario:** Success — Anonymous user reads published articles
  - **Given:** No JWT / anon key only
  - **When:** SELECT on `public.articles`
  - **Then:** Only rows where `status = 'published'` are returned

- **Scenario:** Failure — Anonymous user reads draft article
  - **Given:** No JWT / anon key only
  - **When:** SELECT on `public.articles` where `status = 'draft'`
  - **Then:** 0 rows returned; no error; draft is invisible

- **Scenario:** Success — Manager inserts a new book
  - **Given:** User is authenticated (any role); `author_id` matches `auth.uid()`
  - **When:** INSERT into `public.books`
  - **Then:** Row created successfully

- **Scenario:** Failure — Authenticated user inserts with mismatched author_id
  - **Given:** Authenticated user attempts to spoof another user's `author_id`
  - **When:** INSERT into `public.books` with `author_id ≠ auth.uid()`
  - **Then:** RLS INSERT policy denies; Postgres returns permission error

### Edge Cases
- **Edge:** Service role key bypasses RLS
  - **Given:** Server action uses `SUPABASE_SERVICE_ROLE_KEY` (service role)
  - **When:** Any mutation is attempted
  - **Then:** RLS is bypassed by design — server actions must therefore enforce role checks in TypeScript (see `CLAUDE.md` security pattern) before calling service-role clients. This policy migration secures direct/anon access only.

- **Edge:** Null `author_id` on existing rows (SET NULL from profiles delete)
  - **Given:** A `profiles` row is deleted, cascading `author_id` to NULL on content rows
  - **When:** UPDATE policy checks `author_id = auth.uid()`
  - **Then:** NULL ≠ any UID → policy denies update for that row. Admin can still update via the admin branch of the UPDATE policy.

- **Edge:** Concurrent policy creation (migration run twice)
  - **Given:** Migration is applied a second time (e.g. re-run in dev)
  - **When:** `CREATE POLICY` executes
  - **Then:** `DROP POLICY IF EXISTS` guard before each policy ensures idempotency — no duplicate-policy error

### Hard Constraints
> Inherited from `CLAUDE.md — Coding Standards`. No exceptions.
- Delete policy pattern must use subquery: `(SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'`
- `SUPABASE_SERVICE_ROLE_KEY` is server-only — never referenced in migrations
- Never edit a migration file after it has been applied to production

---

## 3. Automated Checks
> Run `/verify-spec 26-apply-rsl-policies` immediately after implementation.

| # | Check | Tool | Pass Condition |
| :- | :--- | :--- | :--- |
| 1 | TypeScript compilation | `npx tsc --noEmit` | Exit 0, zero type errors |

> Rows 2–3 omitted: this is a DB-only migration with no UI or server-action files created.

---

## 4. Definition of Done
- [ ] `npx tsc --noEmit` exits with 0 errors
- [ ] Migration file `20260416200000_apply_rls_policies.sql` exists in `supabase/migrations/`
- [ ] Anonymous Supabase client querying `articles` returns only `status = 'published'` rows
- [ ] Authenticated Manager JWT querying `articles` returns all rows (drafts + published)
- [ ] Manager JWT issuing DELETE on any content table gets 0 rows affected (RLS blocks silently)
- [ ] Admin JWT issuing DELETE on any content table succeeds
- [ ] INSERT with mismatched `author_id` is denied by RLS
- [ ] All `DROP POLICY IF EXISTS` guards present — migration is idempotent (safe to re-run in dev)
