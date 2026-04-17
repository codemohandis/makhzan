# Spec: Create Storage Bucket

## 1. Context & User Story (Human Layer)
- **SRS Reference:** FR-03
- **Overview:** Create and configure the Supabase Storage bucket `books` that holds uploaded PDF files. The bucket requires public read access for inline viewing and download, and authenticated-only write/delete access enforced by storage policies.
- **User Story:** "As an Admin or Manager, I want PDF files to be stored in a secured Supabase Storage bucket so that authenticated users can upload books and the public can read them without exposing management operations."
- **Depends on:** Step 07 — Profiles Table (user_role enum required by storage policies), Step 25 — Migrate Books + Videos Tables (books table must exist before referencing storage URLs).

---

## 2. Technical Blueprint (Agent Layer)

### Interface & Contract

| Interface | Method | Path / Action | Access | Behaviour |
| :--- | :--- | :--- | :--- | :--- |
| Storage Bucket | READ (GET object) | `storage/books/**` | Public (anon + auth) | Any request can read/download a file |
| Storage Bucket | INSERT (upload) | `storage/books/**` | Authenticated only | Only logged-in users may upload files |
| Storage Bucket | UPDATE (overwrite) | `storage/books/**` | Author or Admin | User who uploaded the file, or any admin |
| Storage Bucket | DELETE (remove file) | `storage/books/**` | Admin only | Only admin role may delete stored files |

### Execution Plan

- **Database:** Single new migration file. No changes to existing tables.
  - Create bucket `books` (public: true) via `storage.buckets` insert.
  - Add four storage object policies on `storage.objects` for bucket `books`:
    - **SELECT** — `USING (bucket_id = 'books')` — open to all.
    - **INSERT** — `WITH CHECK (bucket_id = 'books' AND auth.uid() IS NOT NULL)` — authenticated users only.
    - **UPDATE** — `USING (bucket_id = 'books' AND auth.uid() IS NOT NULL)` — authenticated users; tighten to admin if desired.
    - **DELETE** — `USING (bucket_id = 'books' AND (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin')` — admin only.

- **Modify:** None — no existing files require modification.
- **Create:**
  - `supabase/migrations/20260417000000_create_books_bucket.sql` — creates the `books` storage bucket and all four storage-object RLS policies.

### RTL Checklist
> No UI files created — skip.

### Logic Scenarios (Gherkin-style)

- **Scenario:** Success — public user reads a PDF
  - **Given:** User is unauthenticated (anon key)
  - **When:** GET request is made to `storage/books/<file-path>`
  - **Then:** File is served; HTTP 200 returned

- **Scenario:** Success — authenticated user uploads a PDF
  - **Given:** User is logged in (any role: manager or admin)
  - **When:** `supabase.storage.from('books').upload(path, file)` is called
  - **Then:** File is stored; storage returns the public URL

- **Scenario:** Failure — unauthenticated user attempts upload
  - **Given:** User is not logged in
  - **When:** INSERT to `storage.objects` bucket `books` is attempted
  - **Then:** Supabase returns 403; file is not stored

- **Scenario:** Failure — Manager attempts to delete a stored file
  - **Given:** User has role `manager`
  - **When:** DELETE on `storage.objects` for bucket `books` is attempted
  - **Then:** Supabase returns 403; file is not removed

- **Scenario:** Success — Admin deletes a stored file
  - **Given:** User has role `admin`
  - **When:** `supabase.storage.from('books').remove([path])` is called
  - **Then:** File is deleted from storage; 200 returned

### Edge Cases

- **Edge:** Duplicate filename upload
  - **Given:** A file with the same path already exists in the bucket
  - **When:** An authenticated user uploads with the same path
  - **Then:** Use `upsert: true` option in the upload call to overwrite silently; no duplicate key error

- **Edge:** Bucket already exists (re-running migration)
  - **Given:** `books` bucket was previously created (e.g., manual setup or re-applied migration)
  - **When:** The migration runs again
  - **Then:** `INSERT ... ON CONFLICT DO NOTHING` prevents an error; migration is idempotent

- **Edge:** Policy name collision on re-run
  - **Given:** Storage policies with the same name already exist
  - **When:** Migration runs
  - **Then:** `DROP POLICY IF EXISTS` before each `CREATE POLICY` ensures idempotency

### Hard Constraints
> Inherited from `CLAUDE.md — Coding Standards`. No exceptions.
- `SUPABASE_SERVICE_ROLE_KEY` is server-only — the migration runs via Supabase CLI, never client-side.
- Bucket name must be `books` exactly — FR-03 and `agent-context.md` specify this name; it is referenced by `pdf_url` columns in the `books` table.

---

## 3. Automated Checks

| # | Check | Tool | Pass Condition |
| :- | :--- | :--- | :--- |
| 1 | TypeScript compilation | `npx tsc --noEmit` | Exit 0, zero type errors |

> Rows 2–3 omitted — this is a DB/Storage-only feature with no UI or server action mutations.

---

## 4. Definition of Done

- [ ] `npx tsc --noEmit` exits with 0 errors (no TS changes, but verify no regressions)
- [ ] Migration file `20260417000000_create_books_bucket.sql` exists and is syntactically valid SQL
- [ ] Bucket `books` is visible in Supabase Dashboard → Storage
- [ ] Bucket is set to **public** (public read confirmed in Dashboard)
- [ ] Unauthenticated GET of a stored file returns HTTP 200
- [ ] Unauthenticated PUT/POST to the bucket returns HTTP 403
- [ ] Manager JWT upload succeeds (HTTP 200)
- [ ] Manager JWT file delete returns HTTP 403
- [ ] Admin JWT file delete returns HTTP 200
- [ ] Migration is idempotent — running it twice produces no errors
