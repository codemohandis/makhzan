# Spec: Profile Table

## 1. Context & User Story (Human Layer)
- **SRS Reference:** FR-01, FR-06
- **Overview:** Create the `profiles` table in Supabase Postgres and a trigger that auto-inserts a row whenever a new user is created in `auth.users`. The row carries `full_name`, and `role` (default `manager`), which all RBAC delete guards across every module depend on.
- **User Story:** "As the system, I want a `profiles` row to be created automatically on signup so that every authenticated user has a role immediately available for authorization checks."
- **Depends on:** Step 06 — Configure Supabase Auth (a live Supabase project must exist before migrations can be applied).

---

## 2. Technical Blueprint (Agent Layer)

### Interface & Contract

| Interface | Method | Path / Action | Access | Behaviour |
| :--- | :--- | :--- | :--- | :--- |
| DB Migration | SQL | `supabase/migrations/<ts>_create_profiles.sql` | Supabase CLI | Creates `user_role` enum, `profiles` table, trigger function, trigger, and RLS policies |
| Trigger | Postgres | `on_auth_user_created` → `handle_new_user()` | Internal (DB) | Fires `AFTER INSERT ON auth.users`; inserts row into `profiles` with `id = NEW.id`, `role = 'manager'` |

### Execution Plan

- **Database:**
  1. Create enum type: `CREATE TYPE user_role AS ENUM ('admin', 'manager');`
  2. Create `profiles` table with columns: `id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE`, `full_name TEXT`, `role user_role NOT NULL DEFAULT 'manager'`, `created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()`
  3. Enable RLS: `ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;`
  4. RLS policies:
     - **Users can read own profile:** `SELECT` where `auth.uid() = id`
     - **Admins can read all profiles:** `SELECT` where `(SELECT role FROM profiles WHERE id = auth.uid()) = 'admin'`
     - **Users can update own profile (full_name only):** `UPDATE` where `auth.uid() = id`
     - **No direct insert/delete by users** (trigger handles insert; cascade handles delete)
  5. Trigger function `handle_new_user()`: inserts into `profiles(id, full_name, role)` using `NEW.id`, `NEW.raw_user_meta_data->>'full_name'`, `'manager'`
  6. Trigger `on_auth_user_created`: `AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION handle_new_user()`
  7. Grant execute on function to `supabase_auth_admin` role

- **Modify:** None — DB-only feature.
- **Create:**
  - `supabase/migrations/<timestamp>_create_profiles.sql` — full migration SQL (enum + table + RLS + trigger). Use `/db-migrate` to generate with the correct timestamp.

### RTL Checklist
> Skip — DB migration only; no UI files created.

### Logic Scenarios (Gherkin-style)

- **Scenario:** Success — new user signup auto-creates profile
  - **Given:** A Supabase Auth user is created (via email signup or admin creation)
  - **When:** The `on_auth_user_created` trigger fires
  - **Then:** A row exists in `profiles` with `id = <new_user_id>`, `role = 'manager'`, `created_at` set; `full_name` is populated if supplied in `raw_user_meta_data`

- **Scenario:** Success — profile readable by owner
  - **Given:** Authenticated user with id `U1` calls `getCurrentProfile()`
  - **When:** Supabase query runs `SELECT * FROM profiles WHERE id = auth.uid()`
  - **Then:** Returns exactly one row for `U1`; no other rows visible

- **Scenario:** Success — admin can read all profiles
  - **Given:** Authenticated user has `role = 'admin'`
  - **When:** A `SELECT * FROM profiles` query is issued
  - **Then:** All rows are returned (RLS admin policy allows it)

- **Scenario:** Failure — manager cannot read other profiles
  - **Given:** Authenticated user has `role = 'manager'`
  - **When:** A `SELECT * FROM profiles` query is issued
  - **Then:** Only their own row is returned; other rows are invisible (RLS filters them)

### Edge Cases

- **Edge:** User deleted from `auth.users`
  - **Given:** An admin deletes a user via Supabase Auth
  - **When:** The `auth.users` row is removed
  - **Then:** `ON DELETE CASCADE` removes the `profiles` row automatically; no orphan rows

- **Edge:** Trigger fires but `raw_user_meta_data` has no `full_name`
  - **Given:** A user is created without supplying `full_name` in metadata
  - **When:** `handle_new_user()` executes
  - **Then:** `full_name` is stored as `NULL` (column allows null); no error thrown; profile row is created correctly

- **Edge:** Migration applied twice (accidental re-run)
  - **Given:** Migration file is run a second time against the same DB
  - **When:** `CREATE TYPE` / `CREATE TABLE` / `CREATE TRIGGER` statements execute
  - **Then:** Statements use `IF NOT EXISTS` / `CREATE OR REPLACE` guards; migration is idempotent; no error thrown

### Hard Constraints
> Inherited from `CLAUDE.md — Coding Standards`. No exceptions.
- `SUPABASE_SERVICE_ROLE_KEY` is used only by the Supabase CLI — never in application code.
- Never edit a migration file after it has been applied to the remote DB (`supabase db push`).
- RLS must be enabled on `profiles` before any policy is created.

---

## 3. Automated Checks
> Run `/verify-spec 07-profile-table` immediately after implementation.

| # | Check | Tool | Pass Condition |
| :- | :--- | :--- | :--- |
| 1 | TypeScript compilation | `npx tsc --noEmit` | Exit 0, zero type errors |

> RTL and role-guard checks omitted — DB migration only; no UI components, no app-layer mutations.

---

## 4. Definition of Done

- [ ] `npx tsc --noEmit` exits with 0 errors
- [ ] `supabase/migrations/<timestamp>_create_profiles.sql` exists and is valid SQL
- [ ] Migration uses `IF NOT EXISTS` / `CREATE OR REPLACE` guards (idempotent)
- [ ] `profiles` table visible in Supabase Dashboard → Table Editor after `supabase db push`
- [ ] Signing up a new user automatically creates a matching `profiles` row with `role = 'manager'` (verify in Table Editor)
- [ ] `full_name = NULL` when not supplied — no trigger error
- [ ] RLS is enabled on `profiles` (Dashboard → Authentication → Policies shows green shield)
- [ ] Manager querying `profiles` sees only their own row; admin sees all rows
