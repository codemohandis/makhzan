-- Migration: create_profiles
-- Created: 2026-04-16
-- Description: Creates user_role enum, profiles table, RLS policies, and
--              the on_auth_user_created trigger that auto-populates profiles
--              whenever a new auth.users row is inserted.

-- ── 1. Enum ──────────────────────────────────────────────────────────────────

DO $$ BEGIN
  CREATE TYPE user_role AS ENUM ('admin', 'manager');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- ── 2. Table ─────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.profiles (
  id          UUID        PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name   TEXT,
  role        user_role   NOT NULL DEFAULT 'manager',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── 3. Row-Level Security ────────────────────────────────────────────────────

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Users can read their own profile
DROP POLICY IF EXISTS "profiles: owner can select" ON public.profiles;
CREATE POLICY "profiles: owner can select"
  ON public.profiles
  FOR SELECT
  USING (auth.uid() = id);

-- Admins can read all profiles
DROP POLICY IF EXISTS "profiles: admin can select all" ON public.profiles;
CREATE POLICY "profiles: admin can select all"
  ON public.profiles
  FOR SELECT
  USING (
    (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'
  );

-- Users can update their own profile (full_name only; role is server-managed)
DROP POLICY IF EXISTS "profiles: owner can update" ON public.profiles;
CREATE POLICY "profiles: owner can update"
  ON public.profiles
  FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- No INSERT policy for users — the trigger handles all inserts.
-- No DELETE policy for users — cascade from auth.users handles deletion.

-- ── 4. Trigger function ───────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, role)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data ->> 'full_name',
    'manager'
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

-- ── 5. Trigger ────────────────────────────────────────────────────────────────

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- ── 6. Permissions ────────────────────────────────────────────────────────────

GRANT EXECUTE ON FUNCTION public.handle_new_user() TO supabase_auth_admin;
