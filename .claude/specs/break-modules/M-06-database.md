# Break-Module: M-06 · Database

**Generated:** 2026-04-16  
**Source:** `/break-module M-06 · Database`

---

## Feature Table

| Step | Feature ID | Feature Name | Priority | Depends On | Spec File |
|---|---|---|---|---|---|
| 24 | F-06-01 | Migrate Articles Table | P0 | F-06-01 profiles (done) | `.claude/specs/feature-specs/24-migrate-articles-table.md` |
| 25 | F-06-02 | Migrate Books + Videos Tables | P0 | F-06-01 | — |
| 26 | F-06-03 | Apply RLS Policies (Articles, Books, Videos) | P0 | F-06-01, F-06-02 | — |
| 27 | F-06-04 | Create Storage Bucket + Policies | P0 | — | — |
| 28 | F-06-05 | Articles Updated-At Trigger | P1 | F-06-01 | — |

---

### F-06-01 — Migrate Articles Table
- **What:** Creates the `articles` table (profiles + enum + trigger already applied in `20260416000000_create_profiles.sql`)
- **Why:** FR-02 — TipTap CMS cannot store content without the DB table; blocks M-03 entirely
- **Files touched:** `supabase/migrations/20260416000001_create_articles.sql`, `src/types/index.ts`
- **Acceptance signal:** `articles` table visible in Supabase Dashboard with all 8 columns
- **Spec command:** `/create-spec 24 articles-table`
- **Status:** `[~]` In Progress — spec + migration written; pending `supabase db push`

---

### F-06-02 — Migrate Books + Videos Tables
- **What:** Creates `books` and `videos` tables per SRS §5.1 schema
- **Why:** FR-03/FR-04 — Library and Media modules are entirely blocked without their tables
- **Files touched:** `supabase/migrations/<timestamp>_create_books_videos.sql`, `src/types/index.ts`
- **Acceptance signal:** Both tables visible in Supabase Dashboard; `books.can_download` defaults to `TRUE`; `videos.youtube_id` is NOT NULL
- **Spec command:** `/create-spec 25 books-videos-tables`

---

### F-06-03 — Apply RLS Policies (Articles, Books, Videos)
- **What:** Enables RLS on `articles`, `books`, `videos` and creates all read/write/delete policies per SRS §5.2
- **Why:** NFR-03 Security — DB-layer defense in depth; app-layer RBAC alone is insufficient
- **Files touched:** `supabase/migrations/<timestamp>_rls_articles_books_videos.sql`
- **Acceptance signal:** Anon SELECT on unpublished article → 0 rows. Admin JWT DELETE → succeeds. Manager JWT DELETE → blocked at DB layer.
- **Spec command:** `/create-spec 26 rls-articles-books-videos`

---

### F-06-04 — Create Storage Bucket + Policies
- **What:** Creates the `books` Supabase Storage bucket (public=true) and its insert/select RLS policies per SRS §5.3
- **Why:** FR-03 — PDF upload form (F-04-02) and reader (F-04-03) both depend on this bucket existing
- **Files touched:** `supabase/migrations/<timestamp>_storage_books_bucket.sql`
- **Acceptance signal:** Unauthenticated GET on a bucket object returns the PDF; unauthenticated POST returns 403
- **Spec command:** `/create-spec 27 storage-books-bucket`

---

### F-06-05 — Articles Updated-At Trigger `[NEW]`
- **What:** Adds a `BEFORE UPDATE` trigger that automatically stamps `updated_at = NOW()` on every article edit
- **Why:** Editorial workflow requires accurate last-modified timestamps; without it `updated_at` is stale from insert time
- **Files touched:** Covered by `20260416000001_create_articles.sql` (trigger included in F-06-01 migration)
- **Acceptance signal:** Edit an article title → `updated_at` changes; `created_at` does not
- **Note:** Folded into F-06-01 migration — `set_updated_at()` function is reusable for books/videos in F-06-02

---

## Summary

```
Module: M-06 — Database
Features Found: 5
Already Specced: 1  (F-06-01)
Needs Spec:     4  (F-06-02 through F-06-05)
Next Step: Run /create-spec 25 books-videos-tables
```
