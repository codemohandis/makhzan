# Spec: Migrate Articles Table

## 1. Context & User Story (Human Layer)

- **SRS Reference:** SRS §5.1 — Database Schema; FR-02 — Article Management
- **Overview:** Creates the `articles` table in Supabase Postgres via a numbered migration file. The `profiles` table, `user_role` enum, and the auto-create trigger are already applied (`20260416000000_create_profiles.sql`); this migration builds on that foundation.
- **User Story:** "As a Developer, I want the `articles` table to exist in Supabase so that the Article CRUD server actions (F-03-02) have a target table to read from and write to."
- **Depends on:** Step 07 — Profiles Table + Auto-Create Trigger (applied ✅)

---

## 2. Technical Blueprint (Agent Layer)

### Interface & Contract

| Interface | Method | Path / Action | Access | Behaviour |
| :--- | :--- | :--- | :--- | :--- |
| Migration SQL | — | `supabase/migrations/<timestamp>_create_articles.sql` | DB admin (migration runner) | Creates `articles` table, enables RLS placeholder, adds `updated_at` trigger |
| TypeScript Type | — | `src/types/index.ts` | Compile-time | Adds `Article` interface matching the DB columns exactly |

> No HTTP endpoints or server actions in this feature — pure DB + type layer.

### Execution Plan

- **Database:** New migration file — creates `articles` table with all SRS §5.1 columns, enables RLS (policies deferred to F-06-03), and adds `updated_at` auto-stamp trigger.

- **Create:**
  - `supabase/migrations/20260416000001_create_articles.sql` — full migration with table, RLS enable, updated_at trigger, and rollback comment block
  - *(no new src/ files)* — the `Article` TypeScript type should be added to the existing `src/types/index.ts`

- **Modify:**
  - `src/types/index.ts` — append `Article` interface and `ArticleStatus` / `ArticleLanguage` type aliases

- **Omit RTL Checklist** — DB migration only; no UI files created.

### Migration SQL Specification

```sql
-- ── 1. Table ──────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.articles (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  title       TEXT        NOT NULL,
  content     JSONB,
  language    TEXT        NOT NULL CHECK (language IN ('ur', 'fa')),
  status      TEXT        NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published')),
  author_id   UUID        REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── 2. RLS (enable now; policies added in F-06-03) ────────────────────────────
ALTER TABLE public.articles ENABLE ROW LEVEL SECURITY;

-- ── 3. Updated-at trigger ─────────────────────────────────────────────────────
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

-- ── 4. Indexes ────────────────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS articles_language_idx ON public.articles (language);
CREATE INDEX IF NOT EXISTS articles_status_idx   ON public.articles (status);
CREATE INDEX IF NOT EXISTS articles_author_idx   ON public.articles (author_id);
```

> **Note:** `set_updated_at()` is defined as a reusable function — F-06-02 (books, videos) can reuse it via the same trigger pattern without redefining the function.

### TypeScript Type (to append to `src/types/index.ts`)

```ts
export type ArticleStatus   = 'draft' | 'published';
export type ArticleLanguage = 'ur' | 'fa';          // reuses Locale values

export interface Article {
  id:         string;
  title:      string;
  content:    Record<string, unknown> | null;  // TipTap JSONB
  language:   ArticleLanguage;
  status:     ArticleStatus;
  author_id:  string | null;
  created_at: string;
  updated_at: string;
}
```

### Logic Scenarios (Gherkin-style)

- **Scenario:** Migration runs clean on a fresh Supabase project
  - **Given:** `profiles` table and `user_role` enum already exist (from prior migration)
  - **When:** `npx supabase db push` (or migration runner) applies `20260416000001_create_articles.sql`
  - **Then:** `articles` table exists with all 8 columns; RLS is enabled; `articles_set_updated_at` trigger is active; 3 indexes exist

- **Scenario:** Migration is applied a second time (idempotency)
  - **Given:** Migration was already applied
  - **When:** The SQL is executed again (e.g., reset + replay)
  - **Then:** `IF NOT EXISTS` guards prevent errors; `CREATE OR REPLACE FUNCTION` and `DROP TRIGGER IF EXISTS` ensure clean re-apply

- **Scenario:** `updated_at` auto-stamps on edit
  - **Given:** An `articles` row exists with `updated_at = T1`
  - **When:** Any column on that row is UPDATEd
  - **Then:** `updated_at` becomes `NOW()` (≥ T1); `created_at` is unchanged

### Edge Cases

- **Edge:** Migration applied before `profiles` table exists
  - **Given:** The `author_id UUID REFERENCES public.profiles(id)` FK is declared
  - **When:** Migration runs on a DB where `profiles` has not yet been created
  - **Then:** Postgres rejects the FK with a relation-does-not-exist error. **Resolution:** Always apply `20260416000000_create_profiles.sql` first. Migration filenames enforce order by timestamp.

- **Edge:** Concurrent INSERTs on `articles` (no sequence contention)
  - **Given:** Multiple server actions insert rows simultaneously
  - **When:** Each INSERT omits `id` (uses `DEFAULT gen_random_uuid()`)
  - **Then:** UUIDs are generated independently; no sequence lock contention; no duplicates

- **Edge:** `set_updated_at` function already exists from a previous partial migration
  - **Given:** Function exists but trigger does not (partial failure scenario)
  - **When:** Migration re-runs
  - **Then:** `CREATE OR REPLACE FUNCTION` is a no-op if identical; `DROP TRIGGER IF EXISTS` + `CREATE TRIGGER` recreates cleanly

### Hard Constraints

> Inherited from `CLAUDE.md — Coding Standards`. No exceptions.

- Migration file must live in `supabase/migrations/` — never edit after applying to remote
- No `any` types in the TypeScript interface — use `Record<string, unknown>` for JSONB
- `SUPABASE_SERVICE_ROLE_KEY` must not appear in this feature (no server actions here)
- `language` values must always be `'ur' | 'fa'` — never free-form strings

---

## 3. Automated Checks

> Run `/verify-spec 24-migrate-articles-table` immediately after implementation.

| # | Check | Tool | Pass Condition |
| :- | :--- | :--- | :--- |
| 1 | TypeScript compilation | `npx tsc --noEmit` | Exit 0, zero type errors |

> Rows 2–3 (RTL audit, role guard audit) omitted — this is a DB migration + type definition feature with no UI or server action mutations.

---

## 4. Definition of Done

- [ ] `npx tsc --noEmit` exits with 0 errors after adding the `Article` interface
- [ ] `supabase/migrations/20260416000001_create_articles.sql` exists and is valid SQL
- [ ] `articles` table is visible in the Supabase Dashboard with all 8 columns (`id`, `title`, `content`, `language`, `status`, `author_id`, `created_at`, `updated_at`)
- [ ] RLS is **enabled** on `articles` in the Supabase Dashboard (green shield icon) — policies deferred to F-06-03
- [ ] `articles_set_updated_at` trigger is listed under `articles` triggers in Supabase Dashboard
- [ ] 3 indexes (`articles_language_idx`, `articles_status_idx`, `articles_author_idx`) exist in Supabase Dashboard
- [ ] Editing any article row updates `updated_at`; `created_at` is unchanged
- [ ] `Article` interface, `ArticleStatus`, and `ArticleLanguage` types are exported from `src/types/index.ts`
