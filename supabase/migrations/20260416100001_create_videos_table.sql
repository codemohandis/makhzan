-- Migration: create_videos_table
-- Created: 2026-04-16
-- Description: Creates the videos table, enables RLS (policies deferred to
--              F-06-03 migration), and creates indexes on language and author_id.
--
-- Depends on: 20260416000000_create_profiles.sql
--   (profiles table must exist before this runs — author_id FK)
--
-- NOTE: youtube_id stores a bare YouTube video ID only (e.g. "dQw4w9WgXcQ").
--       Full URLs must never be stored here; enforcement is at the server-action layer.
--
-- Rollback (manual — run only to undo on a non-production DB):
--   DROP INDEX IF EXISTS videos_language_idx;
--   DROP INDEX IF EXISTS videos_author_idx;
--   DROP TABLE IF EXISTS public.videos;

-- ── 1. Table ──────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.videos (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  title       TEXT        NOT NULL,
  youtube_id  TEXT        NOT NULL,
  language    TEXT        NOT NULL CHECK (language IN ('ur', 'fa')),
  description TEXT,
  author_id   UUID        REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── 2. RLS (enable now; SELECT/INSERT/UPDATE/DELETE policies added in F-06-03) ─

ALTER TABLE public.videos ENABLE ROW LEVEL SECURITY;

-- ── 3. Indexes ────────────────────────────────────────────────────────────────

CREATE INDEX IF NOT EXISTS videos_language_idx ON public.videos (language);
CREATE INDEX IF NOT EXISTS videos_author_idx   ON public.videos (author_id);
