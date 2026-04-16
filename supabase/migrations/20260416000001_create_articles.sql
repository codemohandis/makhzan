-- Migration: create_articles
-- Created: 2026-04-16
-- Description: Creates the articles table, enables RLS (policies deferred to
--              F-06-03 migration), adds an updated_at auto-stamp trigger, and
--              creates indexes on language, status, and author_id.
--
-- Depends on: 20260416000000_create_profiles.sql
--   (user_role enum + profiles table must exist before this runs)
--
-- Rollback (manual — run only to undo on a non-production DB):
--   DROP TRIGGER  IF EXISTS articles_set_updated_at ON public.articles;
--   DROP FUNCTION IF EXISTS public.set_updated_at();
--   DROP INDEX    IF EXISTS articles_language_idx;
--   DROP INDEX    IF EXISTS articles_status_idx;
--   DROP INDEX    IF EXISTS articles_author_idx;
--   DROP TABLE    IF EXISTS public.articles;

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

-- ── 2. RLS (enable now; SELECT/INSERT/UPDATE/DELETE policies added in F-06-03) ─

ALTER TABLE public.articles ENABLE ROW LEVEL SECURITY;

-- ── 3. Updated-at trigger ─────────────────────────────────────────────────────
-- set_updated_at() is a reusable function — F-06-02 (books, videos) will attach
-- the same trigger pattern without redefining the function.

CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
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
