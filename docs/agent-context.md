# Makhzan — Agent Context

> **Auto-maintained by `/break-module`.** Read this single file instead of scanning `srs.md`, `roadmap.md`, and migrations separately. Always prefer this over those sources — if a conflict exists, this file is more current.

---

## Functional Requirements

| FR | Title | Key Rule | Acceptance Signal |
|---|---|---|---|
| FR-01 | Authentication | Supabase Auth email/password; trigger creates `profiles` row; default role `manager` | Unauthenticated `/dashboard` → redirect to `/login` |
| FR-02 | Article Management | TipTap RTL editor; `language: ur\|fa`; `status: draft\|published`; Admin-only delete | Manager cannot delete; server action rejects if `role !== 'admin'` |
| FR-03 | Book Library | PDF → Supabase Storage bucket `books`; `can_download` boolean gates download link | PDF renders inline; download link absent when `can_download = false` |
| FR-04 | Video Gallery | Store YouTube ID only (never URL/embed); render via `lite-youtube-embed`; RTL CSS Grid | Grid correct in ur/fa; Lighthouse perf ≥ 90 |
| FR-05 | Language Toggle | Toggle `<html lang dir>` between `ur`/`fa`; font switches automatically via CSS var | Toggle persists across navigation (cookie or localStorage) |
| FR-06 | Role-Based Dashboard | `/dashboard` shows status badges; Manager sees Edit; Admin sees Edit + Delete + confirm dialog | Manager JWT → 403 on delete |

---

## Database Schema Snapshot

> Source: `srs.md §5`. No migrations applied yet — schema lives in SRS only.

| Table | Key Columns | Notes |
|---|---|---|
| `profiles` | `id UUID (PK, FK auth.users)`, `full_name TEXT`, `role user_role (admin\|manager)`, `created_at` | Extends `auth.users`; auto-created by trigger |
| `articles` | `id UUID PK`, `title TEXT`, `content JSONB`, `language (ur\|fa)`, `status (draft\|published)`, `author_id FK profiles` | Rich text stored as JSONB (TipTap) |
| `books` | `id UUID PK`, `title TEXT`, `pdf_url TEXT`, `thumbnail_url TEXT`, `language (ur\|fa)`, `can_download BOOL`, `author_id FK profiles` | PDF URL from Storage bucket `books` |
| `videos` | `id UUID PK`, `title TEXT`, `youtube_id TEXT`, `language (ur\|fa)`, `description TEXT`, `author_id FK profiles` | ID only — never full URL |

**RLS:** Enabled on all four tables. Delete policy pattern: `(SELECT role FROM profiles WHERE id = auth.uid()) = 'admin'`

**Storage:** Bucket `books` — public read, authenticated insert.

---

## Spec Registry

| Step | Feature ID | Feature Name | Status | Spec File |
|---|---|---|---|---|
| 01 | F-01-01 | Next.js 15 App Router Scaffold | `[~]` In Progress | `.claude/specs/feature-specs/01-nextjs-scaffold.md` |
| 02 | F-01-02 | Tailwind RTL Configuration | `[~]` In Progress | `.claude/specs/feature-specs/02-tailwind-rtl.md` |
| 03 | F-01-03 | Font System (Noto Nastaliq + Vazirmatn) | `[x]` Done | `.claude/specs/feature-specs/03-font-system.md` |
| 04 | F-01-04 | Language Toggle Component | `[ ]` Not Started | — |
| 05 | F-01-05 | Auth Middleware (Dashboard Protection) | `[ ]` Not Started | — |
| 06 | F-02-01 | Supabase Auth Setup (Email/Password) | `[ ]` Not Started | — |
| 07 | F-02-02 | Profiles Table + Auto-Create Trigger | `[x]` Done | `.claude/specs/feature-specs/07-profile-table.md` |
| 08 | F-02-03 | Login & Logout Pages | `[ ]` Not Started | — |
| 09 | F-02-04 | Admin Role Elevation | `[ ]` Not Started | — |
| 10 | F-03-01 | TipTap RTL Editor Component | `[ ]` Not Started | — |
| 11 | F-03-02 | Article Server Actions (CRUD + RBAC) | `[ ]` Not Started | — |
| 12 | F-03-03 | Dashboard Article List & Edit Pages | `[ ]` Not Started | — |
| 13 | F-03-04 | Public Article Listing Page | `[ ]` Not Started | — |
| 14 | F-03-05 | Public Article Detail Page | `[ ]` Not Started | — |
| 15 | F-04-01 | Supabase Storage Bucket (`books`) | `[ ]` Not Started | — |
| 16 | F-04-02 | PDF Upload Form | `[ ]` Not Started | — |
| 17 | F-04-03 | react-pdf-viewer Reader Component | `[ ]` Not Started | — |
| 18 | F-04-04 | Book Server Actions (CRUD + RBAC) | `[ ]` Not Started | — |
| 19 | F-04-05 | Public Book Listing + Reader Page | `[ ]` Not Started | — |
| 20 | F-05-01 | Video Entry Form (YouTube ID capture) | `[ ]` Not Started | — |
| 21 | F-05-02 | lite-youtube-embed RTL Gallery | `[ ]` Not Started | — |
| 22 | F-05-03 | Video Server Actions (CRUD + RBAC) | `[ ]` Not Started | — |
| 23 | F-05-04 | Public Video Gallery Page | `[ ]` Not Started | — |
| 24 | F-06-01 | Initial Migration (profiles + articles) | `[ ]` Not Started | — |
| 25 | F-06-02 | Books + Videos Migration | `[ ]` Not Started | — |
| 26 | F-06-03 | RLS Policies for All Tables | `[ ]` Not Started | — |
| 27 | F-06-04 | Storage Bucket Policies | `[ ]` Not Started | — |

---

## Reusable Patterns Already in Codebase

| Pattern | Location | Notes |
|---|---|---|
| Supabase font variables | `src/app/layout.tsx` | `--font-nastaliq`, `--font-vazirmatn` via `next/font/google` |
| Font switching CSS | `src/app/globals.css` | `html[lang="fa"]` overrides `--font-body` to Vazirmatn |
| Tailwind font utilities | `tailwind.config.ts` | `font-nastaliq`, `font-vazirmatn` classes available |
| RTL plugin | `tailwind.config.ts` | `tailwindcss-rtl` installed; use `ps-*`, `pe-*`, `ms-*`, `me-*` |
| `Locale` type | `src/types/index.ts` | `'ur' \| 'fa'`; `LOCALES` const; `DEFAULT_LOCALE = 'ur'` |
