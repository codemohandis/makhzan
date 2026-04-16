-- Migration: create_books_table
-- Created: 2026-04-16
-- Description: Creates the books table, enables RLS (policies deferred to
--              F-06-03 migration), and creates indexes on language and author_id.
--
-- Depends on: 20260416000000_create_profiles.sql
--   (profiles table must exist before this runs — author_id FK)
--
-- Rollback (manual — run only to undo on a non-production DB):
--   DROP INDEX IF EXISTS books_language_idx;
--   DROP INDEX IF EXISTS books_author_idx;
--   DROP TABLE IF EXISTS public.books;

-- ── 1. Table ──────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.books (
  id            UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  title         TEXT        NOT NULL,
  pdf_url       TEXT        NOT NULL,
  thumbnail_url TEXT,
  language      TEXT        NOT NULL CHECK (language IN ('ur', 'fa')),
  can_download  BOOLEAN     NOT NULL DEFAULT TRUE,
  author_id     UUID        REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── 2. RLS (enable now; SELECT/INSERT/UPDATE/DELETE policies added in F-06-03) ─

ALTER TABLE public.books ENABLE ROW LEVEL SECURITY;

-- ── 3. Indexes ────────────────────────────────────────────────────────────────

CREATE INDEX IF NOT EXISTS books_language_idx ON public.books (language);
CREATE INDEX IF NOT EXISTS books_author_idx   ON public.books (author_id);
