-- Migration: apply_rls_policies
-- Created: 2026-04-16
-- Description: Adds RLS SELECT/INSERT/UPDATE/DELETE policies for the
--              articles, books, and videos tables.
--              RLS was enabled on all three tables in earlier migrations
--              (F-06-01 and F-06-02); this migration adds the actual policy rows.
--
-- Depends on:
--   20260416000000_create_profiles.sql  (user_role enum + profiles table)
--   20260416000001_create_articles.sql  (articles table, RLS enabled)
--   20260416100000_create_books_table.sql (books table, RLS enabled)
--   20260416100001_create_videos_table.sql (videos table, RLS enabled)
--
-- Rollback (manual — run only to undo on a non-production DB):
--   DROP POLICY IF EXISTS "articles: anon can select published"   ON public.articles;
--   DROP POLICY IF EXISTS "articles: auth can select all"         ON public.articles;
--   DROP POLICY IF EXISTS "articles: auth can insert own"         ON public.articles;
--   DROP POLICY IF EXISTS "articles: author or admin can update"  ON public.articles;
--   DROP POLICY IF EXISTS "articles: admin can delete"            ON public.articles;
--   DROP POLICY IF EXISTS "books: anyone can select"              ON public.books;
--   DROP POLICY IF EXISTS "books: auth can insert own"            ON public.books;
--   DROP POLICY IF EXISTS "books: author or admin can update"     ON public.books;
--   DROP POLICY IF EXISTS "books: admin can delete"               ON public.books;
--   DROP POLICY IF EXISTS "videos: anyone can select"             ON public.videos;
--   DROP POLICY IF EXISTS "videos: auth can insert own"           ON public.videos;
--   DROP POLICY IF EXISTS "videos: author or admin can update"    ON public.videos;
--   DROP POLICY IF EXISTS "videos: admin can delete"              ON public.videos;


-- ════════════════════════════════════════════════════════════════════════════
-- ARTICLES
-- ════════════════════════════════════════════════════════════════════════════

-- ── SELECT: anonymous users see published rows only ───────────────────────
DROP POLICY IF EXISTS "articles: anon can select published" ON public.articles;
CREATE POLICY "articles: anon can select published"
  ON public.articles
  FOR SELECT
  USING (
    auth.uid() IS NULL
    AND status = 'published'
  );

-- ── SELECT: authenticated users (any role) see all rows ───────────────────
DROP POLICY IF EXISTS "articles: auth can select all" ON public.articles;
CREATE POLICY "articles: auth can select all"
  ON public.articles
  FOR SELECT
  USING (
    auth.uid() IS NOT NULL
  );

-- ── INSERT: authenticated users may only set themselves as author ──────────
DROP POLICY IF EXISTS "articles: auth can insert own" ON public.articles;
CREATE POLICY "articles: auth can insert own"
  ON public.articles
  FOR INSERT
  WITH CHECK (
    auth.uid() IS NOT NULL
    AND author_id = auth.uid()
  );

-- ── UPDATE: the row's author, or any admin ────────────────────────────────
DROP POLICY IF EXISTS "articles: author or admin can update" ON public.articles;
CREATE POLICY "articles: author or admin can update"
  ON public.articles
  FOR UPDATE
  USING (
    author_id = auth.uid()
    OR (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'
  )
  WITH CHECK (
    author_id = auth.uid()
    OR (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'
  );

-- ── DELETE: admin only ────────────────────────────────────────────────────
DROP POLICY IF EXISTS "articles: admin can delete" ON public.articles;
CREATE POLICY "articles: admin can delete"
  ON public.articles
  FOR DELETE
  USING (
    (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'
  );


-- ════════════════════════════════════════════════════════════════════════════
-- BOOKS
-- ════════════════════════════════════════════════════════════════════════════

-- ── SELECT: everyone (no draft concept for books) ─────────────────────────
DROP POLICY IF EXISTS "books: anyone can select" ON public.books;
CREATE POLICY "books: anyone can select"
  ON public.books
  FOR SELECT
  USING (true);

-- ── INSERT: authenticated users may only set themselves as author ──────────
DROP POLICY IF EXISTS "books: auth can insert own" ON public.books;
CREATE POLICY "books: auth can insert own"
  ON public.books
  FOR INSERT
  WITH CHECK (
    auth.uid() IS NOT NULL
    AND author_id = auth.uid()
  );

-- ── UPDATE: the row's author, or any admin ────────────────────────────────
DROP POLICY IF EXISTS "books: author or admin can update" ON public.books;
CREATE POLICY "books: author or admin can update"
  ON public.books
  FOR UPDATE
  USING (
    author_id = auth.uid()
    OR (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'
  )
  WITH CHECK (
    author_id = auth.uid()
    OR (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'
  );

-- ── DELETE: admin only ────────────────────────────────────────────────────
DROP POLICY IF EXISTS "books: admin can delete" ON public.books;
CREATE POLICY "books: admin can delete"
  ON public.books
  FOR DELETE
  USING (
    (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'
  );


-- ════════════════════════════════════════════════════════════════════════════
-- VIDEOS
-- ════════════════════════════════════════════════════════════════════════════

-- ── SELECT: everyone (no draft concept for videos) ────────────────────────
DROP POLICY IF EXISTS "videos: anyone can select" ON public.videos;
CREATE POLICY "videos: anyone can select"
  ON public.videos
  FOR SELECT
  USING (true);

-- ── INSERT: authenticated users may only set themselves as author ──────────
DROP POLICY IF EXISTS "videos: auth can insert own" ON public.videos;
CREATE POLICY "videos: auth can insert own"
  ON public.videos
  FOR INSERT
  WITH CHECK (
    auth.uid() IS NOT NULL
    AND author_id = auth.uid()
  );

-- ── UPDATE: the row's author, or any admin ────────────────────────────────
DROP POLICY IF EXISTS "videos: author or admin can update" ON public.videos;
CREATE POLICY "videos: author or admin can update"
  ON public.videos
  FOR UPDATE
  USING (
    author_id = auth.uid()
    OR (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'
  )
  WITH CHECK (
    author_id = auth.uid()
    OR (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'
  );

-- ── DELETE: admin only ────────────────────────────────────────────────────
DROP POLICY IF EXISTS "videos: admin can delete" ON public.videos;
CREATE POLICY "videos: admin can delete"
  ON public.videos
  FOR DELETE
  USING (
    (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'
  );
