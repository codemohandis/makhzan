# Makhzan — Software Requirements Specification (SRS)

**Version:** 1.1  
**Date:** 2026-04-15  
**Status:** Active  

---

## 1. Introduction

### 1.1 Purpose
This document defines the complete functional and non-functional requirements for **Makhzan** — a multilingual content management system for Urdu and Farsi articles, books, and videos. It also serves as the authoritative Claude Code agent briefing document.

### 1.2 Scope
Makhzan is a web application enabling authenticated editors (Admin, Manager) to publish and manage content in right-to-left (RTL) scripts. Public users browse content without authentication.

### 1.3 Audience
- Developers using Claude Code (agentic development)
- Project owner / Admin users

### 1.4 Definitions

| Term | Meaning |
|---|---|
| RTL | Right-to-left text direction (Urdu, Farsi) |
| RLS | Row-Level Security (Supabase Postgres policy layer) |
| RBAC | Role-Based Access Control |
| Admin | Full CRUD + user management |
| Manager | Create & edit only; no delete |
| SRS | Software Requirements Specification |

---

## 2. System Overview

### 2.1 Architecture

```
Browser
  └── Next.js 15 (App Router, Server Components)
        ├── /articles  ← TipTap rich-text editor (RTL)
        ├── /books     ← react-pdf-viewer + Supabase Storage
        ├── /videos    ← lite-youtube-embed gallery
        └── /dashboard ← Admin/Manager CRUD panel
              └── Supabase (Auth + Postgres + Storage)
                    ├── auth.users
                    ├── profiles (role: admin | manager)
                    ├── articles
                    ├── books
                    └── videos
```

### 2.2 Tech Stack

| Layer | Technology | Version |
|---|---|---|
| Framework | Next.js (App Router) | 15.x |
| Auth & DB | Supabase | latest |
| Styling | Tailwind CSS + tailwindcss-rtl | 3.x |
| Rich Text | TipTap | 2.x |
| PDF Viewer | react-pdf-viewer | latest |
| Video | lite-youtube-embed | latest |
| Language | TypeScript | 5.x |
| Fonts | Noto Nastaliq Urdu, Vazirmatn | Google Fonts |

---

## 3. Functional Requirements

### FR-01 — Authentication
- Users sign in via Supabase Auth (email/password)
- On first login, a `profiles` row is created via Supabase trigger
- Default role is `manager`; only admins can elevate to `admin`
- **Acceptance:** Unauthenticated requests to `/dashboard` redirect to `/login`

### FR-02 — Article Management
- Admins and Managers can create/edit articles using a TipTap RTL editor
- Articles have: `title`, `content` (JSONB), `language` (`ur` | `fa`), `status` (`draft` | `published`)
- Only Admins can delete articles
- **Acceptance:** Manager cannot see the Delete button; server action rejects delete if `role !== 'admin'`

### FR-03 — Book Library
- Upload PDF to Supabase Storage bucket `books`
- Store thumbnail URL and optional download flag
- Public users can read online via `react-pdf-viewer`
- Download is gated by `can_download` boolean
- **Acceptance:** PDF renders inline; download link absent when `can_download = false`

### FR-04 — Video Gallery
- Store only the YouTube video ID (not full URL or embed HTML)
- Render using `lite-youtube-embed` for performance
- Gallery uses RTL-aware CSS Grid
- **Acceptance:** Grid scrolls correctly in Urdu/Farsi layout; Lighthouse performance score ≥ 90

### FR-05 — Language Toggle
- Users can switch UI language between Urdu (`ur`) and Farsi (`fa`)
- `<html lang>` and `dir="rtl"` update on toggle
- Font switches: Noto Nastaliq Urdu ↔ Vazirmatn
- **Acceptance:** Toggle persists across page navigation (stored in cookie or localStorage)

### FR-06 — Role-Based Dashboard
- `/dashboard` lists all content with status badges
- Managers see Edit; Admins see Edit + Delete
- All delete operations require a confirmation dialog
- **Acceptance:** Deleting with Manager-level JWT returns 403

---

## 4. Non-Functional Requirements

### NFR-01 — RTL / Accessibility
- All layout uses logical CSS properties: `ps`, `pe`, `ms`, `me`, `text-start`, `text-end`
- No hardcoded `left` / `right` CSS classes anywhere in `src/`
- WCAG 2.1 AA contrast compliance

### NFR-02 — Performance
- Lighthouse Performance ≥ 90 on mobile (video pages)
- PDF viewer lazy-loads pages; only renders visible pages
- `lite-youtube-embed` defers iframe load until user interaction

### NFR-03 — Security
- All server actions validate `user.role` before mutating data
- Supabase RLS policies enforce access at the DB layer (defense in depth)
- No secrets in client-side code; use `NEXT_PUBLIC_` prefix only for safe values

### NFR-04 — Code Quality
- TypeScript strict mode enabled
- No `any` types in `src/types/`
- All new components have matching `.test.tsx` files

---

## 5. Database Schema

### 5.1 Tables

```sql
-- Role enum
CREATE TYPE user_role AS ENUM ('admin', 'manager');

-- Profiles (extends auth.users)
CREATE TABLE profiles (
  id          UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  full_name   TEXT,
  role        user_role DEFAULT 'manager',
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- Articles
CREATE TABLE articles (
  id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title       TEXT NOT NULL,
  content     JSONB,
  language    TEXT CHECK (language IN ('ur', 'fa')) NOT NULL,
  status      TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'published')),
  author_id   UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

-- Books
CREATE TABLE books (
  id              UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title           TEXT NOT NULL,
  pdf_url         TEXT NOT NULL,
  thumbnail_url   TEXT,
  language        TEXT CHECK (language IN ('ur', 'fa')) NOT NULL,
  can_download    BOOLEAN DEFAULT TRUE,
  author_id       UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- Videos
CREATE TABLE videos (
  id            UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title         TEXT NOT NULL,
  youtube_id    TEXT NOT NULL,           -- Store ID only, never full URL
  language      TEXT CHECK (language IN ('ur', 'fa')) NOT NULL,
  description   TEXT,
  author_id     UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);
```

### 5.2 Row-Level Security (RLS) Policies

```sql
-- Enable RLS on all tables
ALTER TABLE profiles  ENABLE ROW LEVEL SECURITY;
ALTER TABLE articles  ENABLE ROW LEVEL SECURITY;
ALTER TABLE books     ENABLE ROW LEVEL SECURITY;
ALTER TABLE videos    ENABLE ROW LEVEL SECURITY;

-- Profiles: users read their own; admins read all
CREATE POLICY "profiles_select" ON profiles FOR SELECT
  USING (auth.uid() = id OR (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin');

-- Articles: public can read published; authenticated can insert/update; admin can delete
CREATE POLICY "articles_public_read" ON articles FOR SELECT
  USING (status = 'published' OR auth.role() = 'authenticated');

CREATE POLICY "articles_insert" ON articles FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "articles_update" ON articles FOR UPDATE
  USING (auth.role() = 'authenticated');

CREATE POLICY "articles_delete" ON articles FOR DELETE
  USING ((SELECT role FROM profiles WHERE id = auth.uid()) = 'admin');

-- Apply same delete policy pattern to books and videos
CREATE POLICY "books_delete" ON books FOR DELETE
  USING ((SELECT role FROM profiles WHERE id = auth.uid()) = 'admin');

CREATE POLICY "videos_delete" ON videos FOR DELETE
  USING ((SELECT role FROM profiles WHERE id = auth.uid()) = 'admin');
```

### 5.3 Storage Buckets

```sql
-- Create books bucket (PDFs + thumbnails)
INSERT INTO storage.buckets (id, name, public) VALUES ('books', 'books', true);

-- RLS: only authenticated users can upload
CREATE POLICY "books_storage_insert" ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'books' AND auth.role() = 'authenticated');

-- Public read
CREATE POLICY "books_storage_select" ON storage.objects FOR SELECT
  USING (bucket_id = 'books');
```

---

## 6. Environment Variables

Create `.env.local` in the project root:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://<project-ref>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon-key>
SUPABASE_SERVICE_ROLE_KEY=<service-role-key>   # Server-only, never expose client-side

# App
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

> **Security rule:** `SUPABASE_SERVICE_ROLE_KEY` must never appear in any file prefixed `NEXT_PUBLIC_` or in any client component.

---

## 7. Claude Code Setup

### 7.1 File Structure

```
makhzan/
├── .claude/
│   ├── commands/
│   │   ├── init-module.md      # /init-module — scaffold a content module
│   │   ├── secure-action.md    # /secure-action — audit delete RBAC
│   │   ├── fix-rtl.md          # /fix-rtl — replace left/right CSS
│   │   └── db-migrate.md       # /db-migrate — generate migration SQL
│   └── settings.json           # Hooks, permissions, tool config
├── CLAUDE.md                   # Agent briefing (read at session start)
├── srs.md                      # This document
├── src/
│   ├── app/                    # Next.js App Router pages
│   ├── components/             # Shared UI (RTL-safe)
│   ├── lib/                    # Supabase client + server actions
│   └── types/                  # TypeScript definitions
└── supabase/
    └── migrations/             # SQL migration files
```

### 7.2 Slash Commands (`.claude/commands/`)

Each command is a Markdown file — Claude executes its content when the `/command` is invoked.

| Command | File | Purpose |
|---|---|---|
| `/init-module` | `init-module.md` | Scaffold new content module with page, skeleton, server action |
| `/secure-action` | `secure-action.md` | Audit current file for delete ops missing admin role check |
| `/fix-rtl` | `fix-rtl.md` | Replace hardcoded `left`/`right` CSS with `start`/`end` |
| `/db-migrate` | `db-migrate.md` | Generate timestamped Supabase migration SQL |

### 7.3 Memory System

Claude Code persists session knowledge at:
```
~/.claude/projects/<project-slug>/memory/
  MEMORY.md          ← index of all memory files
  user_*.md          ← user profile memories
  project_*.md       ← project state memories
  feedback_*.md      ← behavior corrections
```

This allows Claude to carry context (role, preferences, project decisions) across sessions without re-explaining every time.

### 7.4 MCP Servers (Recommended)

| MCP Server | Purpose |
|---|---|
| `@supabase/mcp-server-supabase` | Introspect DB schema, run SQL, manage migrations from Claude |
| `@modelcontextprotocol/server-playwright` | Browser automation for RTL layout testing |

---

## 8. Development Phases

### Phase 1 — Foundation
- [ ] Initialize Next.js 15 with App Router and TypeScript strict mode
- [ ] Configure Tailwind CSS with `tailwindcss-rtl` plugin
- [ ] Set up Supabase project; run profiles + auth migration
- [ ] Install and configure Noto Nastaliq Urdu + Vazirmatn fonts
- [ ] Implement language toggle (cookie-based, updates `<html lang dir>`)
- [ ] Create Next.js middleware for dashboard auth protection

**Verify:** `npm run dev` loads at `localhost:3000`; switching language updates font and direction

### Phase 2 — Editorial Suite (Articles)
- [ ] Build TipTap editor component with RTL toolbar
- [ ] Create `/dashboard/articles` list and edit pages
- [ ] Implement server actions: `createArticle`, `updateArticle`, `deleteArticle`
- [ ] Run `/secure-action` on `deleteArticle` to confirm role check
- [ ] Apply RLS policies to `articles` table

**Verify:** Manager cannot delete; Admin can; unauthenticated redirect works

### Phase 3 — Library & Media (Books + Videos)
- [ ] Set up Supabase Storage bucket `books`
- [ ] Build PDF upload form and `react-pdf-viewer` read page
- [ ] Build video upload form (YouTube ID only) and gallery with `lite-youtube-embed`
- [ ] Run `/fix-rtl` on gallery grid component
- [ ] Apply RLS policies to `books` and `videos` tables

**Verify:** Gallery renders RTL; PDF viewer lazy-loads; download blocked when `can_download = false`

---

## 9. Verification & Testing

| Check | Method |
|---|---|
| TypeScript compiles clean | `npx tsc --noEmit` |
| No hardcoded left/right CSS | `grep -r "text-left\|text-right\|left-\|right-" src/` (expect 0) |
| Delete RBAC enforced | POST delete endpoint with Manager JWT → expect 403 |
| RLS active on all tables | Supabase Dashboard → Table Editor → RLS column shows "Enabled" |
| Lighthouse performance | Chrome DevTools → Lighthouse → Mobile → Performance ≥ 90 |
| Language toggle persists | Switch to Farsi, navigate to `/articles`, confirm `lang="fa"` on `<html>` |
