# Spec: Migrate Books Videos Tables

## 1. Context & User Story (Human Layer)
- **SRS Reference:** FR-03, FR-04
- **Overview:** Create and apply Supabase migrations for the `books` and `videos` tables so that book library and video gallery features have a stable DB foundation.
- **User Story:** "As an Admin, I want the `books` and `videos` tables to exist in the database so that I can store and manage book PDFs and YouTube video entries."
- **Depends on:** Step 07 — Profiles Table + Auto-Create Trigger (FK `author_id` references `profiles.id`)

---

## 2. Technical Blueprint (Agent Layer)

### Interface & Contract
| Interface | Method | Path / Action | Access | Behaviour |
| :--- | :--- | :--- | :--- | :--- |
| Migration | SQL | `supabase/migrations/<timestamp>_create_books_table.sql` | DB-level | Creates `books` table with all columns and constraints |
| Migration | SQL | `supabase/migrations/<timestamp>_create_videos_table.sql` | DB-level | Creates `videos` table with all columns and constraints |

> No UI or server actions in this step — DB schema only.

### Execution Plan
- **Database:**
  - Create `books` table: `id UUID PK DEFAULT gen_random_uuid()`, `title TEXT NOT NULL`, `pdf_url TEXT NOT NULL`, `thumbnail_url TEXT`, `language TEXT NOT NULL CHECK (language IN ('ur', 'fa'))`, `can_download BOOLEAN NOT NULL DEFAULT TRUE`, `author_id UUID NOT NULL REFERENCES profiles(id)`, `created_at TIMESTAMPTZ NOT NULL DEFAULT now()`
  - Create `videos` table: `id UUID PK DEFAULT gen_random_uuid()`, `title TEXT NOT NULL`, `youtube_id TEXT NOT NULL`, `language TEXT NOT NULL CHECK (language IN ('ur', 'fa'))`, `description TEXT`, `author_id UUID NOT NULL REFERENCES profiles(id)`, `created_at TIMESTAMPTZ NOT NULL DEFAULT now()`
  - Enable RLS on both tables (`ALTER TABLE books ENABLE ROW LEVEL SECURITY;` etc.) — policies deferred to Step 26
  - Add index on `books(language)` and `videos(language)` for public listing queries

- **Create:**
  - `supabase/migrations/20260416100000_create_books_table.sql` — DDL for `books` table + RLS enable
  - `supabase/migrations/20260416100001_create_videos_table.sql` — DDL for `videos` table + RLS enable

- **Modify:** None — no existing files changed.

### RTL Checklist
> Skip — DB migration only, no UI files created.

### Logic Scenarios (Gherkin-style)
- **Scenario:** Success — Migration applies cleanly
  - **Given:** `profiles` table exists with `id UUID PK`
  - **When:** Both migration files are applied via `npx supabase db push` or local `npx supabase migration up`
  - **Then:** `books` and `videos` tables exist; `\dt` in psql confirms both; FK to `profiles` resolves

- **Scenario:** Failure — Profiles table missing
  - **Given:** `profiles` table does not exist (e.g., ran out of order)
  - **When:** Migration applies `REFERENCES profiles(id)`
  - **Then:** Postgres raises a foreign key violation error; migration rolls back; no partial table created

### Edge Cases
- **Edge:** Migration run twice (idempotency)
  - **Given:** Migration has already been applied to the local DB
  - **When:** `npx supabase migration up` is run again
  - **Then:** Supabase CLI skips already-applied migrations; no duplicate table error; operation is a no-op

- **Edge:** `youtube_id` contains a full URL instead of bare ID
  - **Given:** A row is inserted with `youtube_id = 'https://youtube.com/watch?v=abc123'`
  - **When:** The INSERT executes
  - **Then:** The DB accepts it (constraint is a `NOT NULL` check only); enforcement of ID-only format is the responsibility of the server action layer (Step 22), not the DB schema

### Hard Constraints
> Inherited from `CLAUDE.md — Coding Standards`. No exceptions.
- `SUPABASE_SERVICE_ROLE_KEY` must never appear in migration files
- `youtube_id` must be `TEXT NOT NULL` — never store full URLs at DB level
- `can_download` must default to `TRUE` to avoid accidental lockouts on new rows
- `supabase/migrations/` files must never be edited after being applied

---

## 3. Automated Checks
> Run `/verify-spec 25-migrate-books-videos-tables` immediately after implementation.

| # | Check | Tool | Pass Condition |
| :- | :--- | :--- | :--- |
| 1 | TypeScript compilation | `npx tsc --noEmit` | Exit 0, zero type errors |

> Rows 2–3 omitted — no UI components or server mutation actions in this step.

---

## 4. Definition of Done
- [ ] `npx tsc --noEmit` exits with 0 errors
- [ ] `supabase/migrations/20260416100000_create_books_table.sql` exists and is valid SQL
- [ ] `supabase/migrations/20260416100001_create_videos_table.sql` exists and is valid SQL
- [ ] Both tables visible in local Supabase dashboard after `npx supabase migration up`
- [ ] `books.author_id` FK to `profiles.id` resolves without error
- [ ] `videos.author_id` FK to `profiles.id` resolves without error
- [ ] RLS is enabled on both tables (policies deferred to Step 26)
- [ ] Indexes on `books(language)` and `videos(language)` confirmed in DB
