---
# Spec: Article Updated-At Trigger

## 1. Context & User Story (Human Layer)
- **SRS Reference:** FR-02 (Article Management), F-06-05
- **Overview:** A PostgreSQL trigger automatically stamps the `updated_at` column on the `articles` table whenever a row is updated, ensuring accurate last-modified timestamps without requiring application-layer logic.
- **User Story:** "As a Manager or Admin, I want the article's `updated_at` timestamp to reflect the true last-edit time so that the dashboard and API always show accurate modification dates."
- **Depends on:** Step 24 — Migrate Articles Table (the trigger SQL is co-located in that migration).

---

## 2. Technical Blueprint (Agent Layer)

### Current State
> **Important:** The trigger SQL is already written inside `supabase/migrations/20260416000001_create_articles.sql` (Step 24). No new migration file is needed. This spec validates correctness and documents the contract.

The migration defines:
1. **Function** `public.set_updated_at()` — a reusable `BEFORE UPDATE` trigger function that sets `NEW.updated_at = NOW()`.
2. **Trigger** `articles_set_updated_at` — attaches `set_updated_at()` to `public.articles` `BEFORE UPDATE FOR EACH ROW`.

```sql
-- Already present in 20260416000001_create_articles.sql
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS articles_set_updated_at ON public.articles;
CREATE TRIGGER articles_set_updated_at
  BEFORE UPDATE ON public.articles
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
```

### Interface & Contract
| Interface | Method | Path / Action | Access | Behaviour |
| :--- | :--- | :--- | :--- | :--- |
| DB Trigger | AUTO | `articles_set_updated_at` (BEFORE UPDATE) | Internal (Postgres) | Sets `updated_at = NOW()` on every row update |
| DB Function | AUTO | `public.set_updated_at()` | Internal (Postgres) | Reusable; F-06-02 (books/videos) will attach the same function without redefining it |

### Execution Plan
- **Database:** Trigger and function already present in `supabase/migrations/20260416000001_create_articles.sql`. Schema is stable — no new migration file required.
- **Modify:** None.
- **Create:** None.

### RTL Checklist
> Skipped — DB-only feature; no UI files created.

### Logic Scenarios (Gherkin-style)
- **Scenario:** Success — Article row is updated
  - **Given:** The `articles` migration has been applied and the trigger exists
  - **When:** Any `UPDATE` is executed on `public.articles`
  - **Then:** `updated_at` is set to `NOW()` automatically; the application does not need to pass `updated_at` in the update payload

- **Scenario:** Reuse — Books or Videos table needs the same trigger
  - **Given:** `public.set_updated_at()` is already defined (created by this migration)
  - **When:** A future migration for books or videos runs `CREATE TRIGGER ... EXECUTE FUNCTION public.set_updated_at()`
  - **Then:** The function is found and the trigger is attached without error; no `CREATE OR REPLACE FUNCTION` needed again

- **Scenario:** Idempotent re-apply
  - **Given:** The migration is re-applied (e.g., on a fresh DB or after `supabase db reset`)
  - **When:** The migration runs
  - **Then:** `DROP TRIGGER IF EXISTS` + `CREATE OR REPLACE FUNCTION` ensure no duplicate-object errors

### Edge Cases
- **Edge:** Application accidentally passes `updated_at` in an UPDATE payload
  - **Given:** A server action includes `updated_at: someValue` in the Supabase `.update({})` call
  - **When:** Postgres processes the `BEFORE UPDATE` trigger
  - **Then:** The trigger overwrites the application-supplied value with `NOW()` — the trigger always wins; no stale timestamp is stored

- **Edge:** Concurrent updates to the same row
  - **Given:** Two requests update the same article in parallel (race condition)
  - **When:** Both `UPDATE` statements land on the DB
  - **Then:** Each fires the trigger independently; the last committed write sets `updated_at` to its own `NOW()` — Postgres row-level locking guarantees no partial write

### Hard Constraints
> Inherited from `CLAUDE.md — Coding Standards`. No exceptions.
> - `SUPABASE_SERVICE_ROLE_KEY` is server-only — never import in client components.
> - Server actions that mutate articles must validate `user.role` before calling Supabase.

---

## 3. Automated Checks
> Run `/verify-spec 28-article-updated-at-trigger` immediately after implementation.

| # | Check | Tool | Pass Condition |
| :- | :--- | :--- | :--- |
| 1 | TypeScript compilation | `npx tsc --noEmit` | Exit 0, zero type errors |
| 2 | Trigger exists on DB | `npx supabase db diff` or Supabase Dashboard → Table Editor → Triggers | `articles_set_updated_at` listed on `public.articles` |
| 3 | Function exists on DB | Supabase Dashboard → Database → Functions | `public.set_updated_at()` present |

> Rows 2–3 are manual Dashboard checks; no automated tool available in this stack.

---

## 4. Definition of Done
- [x] `npx tsc --noEmit` exits with 0 errors
- [x] `supabase/migrations/20260416000001_create_articles.sql` contains both `CREATE OR REPLACE FUNCTION public.set_updated_at()` and `CREATE TRIGGER articles_set_updated_at`
- [x] Migration `20260416000001` confirmed applied on remote (`supabase migration list` — Local and Remote both show `20260416000001`)
- [ ] Manual verify: Supabase Dashboard → `public.articles` → Triggers shows `articles_set_updated_at` with event `UPDATE` and timing `BEFORE`
- [ ] Manual verify: Supabase Dashboard → Database → Functions shows `set_updated_at` under schema `public`
- [ ] Manual smoke test: `UPDATE public.articles SET title = title WHERE id = '<id>'` via SQL editor — confirm `updated_at` timestamp advances
- [x] Future trigger attachment for `books`/`videos` (Step 25) uses `EXECUTE FUNCTION public.set_updated_at()` without redefining the function — confirmed: books/videos migrations created after this function exists
