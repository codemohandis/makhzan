-- Migration: create_books_bucket
-- Created: 2026-04-17
-- Description: Creates the Supabase Storage bucket `books` (public read) and
--              attaches four storage-object RLS policies:
--                SELECT  — anyone (anon + auth)
--                INSERT  — authenticated users only
--                UPDATE  — authenticated users only
--                DELETE  — admin role only
--
-- Depends on:
--   20260416000000_create_profiles.sql  (user_role enum + profiles table)
--   20260416100000_create_books_table.sql (books table exists; pdf_url points here)
--
-- Idempotent: bucket insert uses ON CONFLICT DO NOTHING;
--             each policy is preceded by DROP POLICY IF EXISTS.
--
-- Rollback (manual — run only to undo on a non-production DB):
--   DROP POLICY IF EXISTS "books storage: anyone can select"    ON storage.objects;
--   DROP POLICY IF EXISTS "books storage: auth can insert"      ON storage.objects;
--   DROP POLICY IF EXISTS "books storage: auth can update own"  ON storage.objects;
--   DROP POLICY IF EXISTS "books storage: admin can delete"     ON storage.objects;
--   DELETE FROM storage.buckets WHERE id = 'books';


-- ════════════════════════════════════════════════════════════════════════════
-- BUCKET
-- ════════════════════════════════════════════════════════════════════════════

-- public = true means GET requests do not require a signed URL.
-- Supabase Storage still enforces object-level RLS policies below.
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'books',
  'books',
  true,
  52428800,                          -- 50 MB per file
  ARRAY['application/pdf']           -- PDFs only; reject other MIME types at bucket level
)
ON CONFLICT (id) DO NOTHING;


-- ════════════════════════════════════════════════════════════════════════════
-- STORAGE OBJECT POLICIES
-- ════════════════════════════════════════════════════════════════════════════

-- ── SELECT: everyone (anon + authenticated) may read / download ───────────
DROP POLICY IF EXISTS "books storage: anyone can select" ON storage.objects;
CREATE POLICY "books storage: anyone can select"
  ON storage.objects
  FOR SELECT
  USING (bucket_id = 'books');


-- ── INSERT: authenticated users only may upload ───────────────────────────
DROP POLICY IF EXISTS "books storage: auth can insert" ON storage.objects;
CREATE POLICY "books storage: auth can insert"
  ON storage.objects
  FOR INSERT
  WITH CHECK (
    bucket_id = 'books'
    AND auth.uid() IS NOT NULL
  );


-- ── UPDATE: authenticated users may overwrite (enables upsert uploads) ────
DROP POLICY IF EXISTS "books storage: auth can update own" ON storage.objects;
CREATE POLICY "books storage: auth can update own"
  ON storage.objects
  FOR UPDATE
  USING (
    bucket_id = 'books'
    AND auth.uid() IS NOT NULL
  )
  WITH CHECK (
    bucket_id = 'books'
    AND auth.uid() IS NOT NULL
  );


-- ── DELETE: admin role only ───────────────────────────────────────────────
DROP POLICY IF EXISTS "books storage: admin can delete" ON storage.objects;
CREATE POLICY "books storage: admin can delete"
  ON storage.objects
  FOR DELETE
  USING (
    bucket_id = 'books'
    AND (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'
  );
