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

> Source: `srs.md §5` + `supabase/migrations/`. Applied migrations listed below.

**Applied migrations (all applied as of 2026-04-17):**

| File | Tables / Objects Created | Status |
|---|---|---|
| `20260416000000_create_profiles.sql` | `user_role` enum, `profiles`, profiles RLS policies, `handle_new_user` trigger | ✅ Applied |
| `20260416000001_create_articles.sql` | `articles` table | ✅ Applied |
| `20260416100000_create_books_table.sql` | `books` table | ✅ Applied |
| `20260416100001_create_videos_table.sql` | `videos` table | ✅ Applied |
| `20260416200000_apply_rls_policies.sql` | RLS policies for articles, books, videos | ✅ Applied |
| `20260417000000_create_books_bucket.sql` | Supabase Storage bucket `books` | ✅ Applied |

**Schema:**

| Table | Key Columns | Notes |
|---|---|---|
| `profiles` | `id UUID (PK, FK auth.users)`, `full_name TEXT`, `role user_role (admin\|manager)`, `created_at` | Auto-created by `on_auth_user_created` trigger |
| `articles` | `id UUID PK`, `title TEXT`, `content JSONB`, `language (ur\|fa)`, `status (draft\|published)`, `author_id FK profiles`, `created_at`, `updated_at` | `updated_at` auto-updated by trigger |
| `books` | `id UUID PK`, `title TEXT`, `pdf_url TEXT`, `thumbnail_url TEXT`, `language (ur\|fa)`, `can_download BOOL DEFAULT TRUE`, `author_id FK profiles`, `created_at` | PDF URL from Storage bucket `books` |
| `videos` | `id UUID PK`, `title TEXT`, `youtube_id TEXT NOT NULL`, `language (ur\|fa)`, `description TEXT`, `author_id FK profiles`, `created_at` | ID only — never full URL |

**RLS:** Enabled on all four tables. Delete policy: `(SELECT role FROM profiles WHERE id = auth.uid()) = 'admin'`

**Storage:** Bucket `books` — public read, authenticated insert.

---

## Frontend Layout System (added 2026-04-17)

### Design tokens (tailwind.config.ts)
| Token | Hex | Use |
|---|---|---|
| `paper` | `#F9F7F2` | Page background, card bg |
| `ink` | `#1C1917` | Body text |
| `oxford` | `#002147` | Header bg, nav bar, footer, CTA buttons |
| `burgundy` | `#800020` | Accent: active links, language badge, hover |

### Public shell
- **Header:** Two-row sticky — Row 1 (`bg-paper`, h-16): `PublicLogo` + `LanguageToggle`; Row 2 (`bg-oxford`, h-10): `PublicNav` (مضامین / کتب / ویڈیوز / بارے میں). Mobile: hamburger drawer.
- **Footer:** `bg-oxford`, brand tagline + nav links + copyright.
- **Homepage:** Oxford hero banner + `HomeTabs` (Articles | Books | Videos tabbed, top 3 items each).

### CMS shell
- **Header:** Sticky top nav (`CmsHeader`) — "Makhzan CMS" logo + `CmsNav` links + user display name + `LogoutButton`. Users link visible to admin only.

### Component locations
```
src/components/public/           — PublicHeader, PublicLogo, PublicNav, PublicFooter,
                                   HomeTabs, SectionHeader, LanguageBadge, YoutubeEmbed
src/components/public/cards/     — ArticleCard, BookCard, VideoCard
src/components/cms/              — CmsHeader, CmsNav, CmsPageHeader, ArticleForm
src/components/editor/           — TipTapEditor, TipTapViewer
```

---

## Spec Registry

| Step | Feature ID | Feature Name | Status | Spec File |
|---|---|---|---|---|
| 01 | F-01-01 | Next.js 15 App Router Scaffold | `[x]` Done | `.claude/specs/feature-specs/01-nextjs-scaffold.md` |
| 02 | F-01-02 | Tailwind RTL Configuration | `[x]` Done | `.claude/specs/feature-specs/02-tailwind-rtl.md` |
| 03 | F-01-03 | Font System (Noto Nastaliq + Vazirmatn) | `[x]` Done | `.claude/specs/feature-specs/03-font-system.md` |
| 04 | F-01-04 | Language Toggle Component | `[x]` Done | — |
| 05 | F-01-05 | Auth Middleware (Dashboard Protection) | `[ ]` Not Started | — |
| 06 | F-02-01 | Supabase Auth Setup (Email/Password) | `[x]` Done | — |
| 07 | F-02-02 | Profiles Table + Auto-Create Trigger | `[x]` Done | `.claude/specs/feature-specs/07-profile-table.md` |
| 08 | F-02-03 | Login & Logout Pages | `[x]` Done | — |
| 09 | F-02-04 | Admin Role Elevation | `[x]` Done | `.claude/specs/feature-specs/09-role-elevation.md` |
| 10 | F-03-01 | Build TipTap RTL Editor | `[x]` Done | `.claude/specs/feature-specs/10-build-tiptap-rtl-editor.md` |
| 11 | F-03-02 | Article Server Actions (CRUD + RBAC) | `[x]` Done | — |
| 12 | F-03-03 | Dashboard Article List & Edit Pages | `[x]` Done | — |
| 13 | F-03-04 | Public Article Listing Page | `[x]` Done | — |
| 14 | F-03-05 | Public Article Detail Page | `[x]` Done | — |
| 15 | F-04-01 | Supabase Storage Bucket (`books`) | `[x]` Done | — |
| 16 | F-04-02 | PDF Upload Form | `[ ]` Not Started | — |
| 17 | F-04-03 | react-pdf-viewer Reader Component | `[ ]` Not Started | — |
| 18 | F-04-04 | Book Server Actions (CRUD + RBAC) | `[x]` Done | — |
| 19 | F-04-05 | Public Book Listing + Reader Page | `[~]` Partial (listing done; PDF viewer placeholder) | — |
| 20 | F-05-01 | Video Entry Form (YouTube ID capture) | `[ ]` Not Started | — |
| 21 | F-05-02 | lite-youtube-embed RTL Gallery | `[x]` Done | — |
| 22 | F-05-03 | Video Server Actions (CRUD + RBAC) | `[x]` Done | — |
| 23 | F-05-04 | Public Video Gallery Page | `[x]` Done | — |
| 24 | F-06-01 | Migrate Articles Table | `[x]` Done | `.claude/specs/feature-specs/24-migrate-articles-table.md` |
| 25 | F-06-02 | Migrate Books + Videos Tables | `[x]` Done | `.claude/specs/feature-specs/25-migrate-books-videos-tables.md` |
| 26 | F-06-03 | Apply RLS Policies (Articles, Books, Videos) | `[x]` Done | `.claude/specs/feature-specs/26-apply-rsl-policies.md` |
| 27 | F-06-04 | Create Storage Bucket + Policies | `[x]` Done | `.claude/specs/feature-specs/27-create-storage-bucket.md` |
| 28 | F-06-05 | Articles Updated-At Trigger | `[x]` Done | `.claude/specs/feature-specs/28-article-updated-at-trigger.md` |

---

## Reusable Patterns Already in Codebase

| Pattern | Location | Notes |
|---|---|---|
| Font CSS variables | `src/app/(public)/layout.tsx` | `--font-nastaliq`, `--font-vazirmatn` via `next/font/google` |
| Font switching CSS | `src/app/globals.css` | `html[lang="fa"]` overrides `--font-body` to Vazirmatn |
| Tailwind font utilities | `tailwind.config.ts` | `font-nastaliq`, `font-vazirmatn` classes available |
| RTL plugin | `tailwind.config.ts` | `tailwindcss-rtl` installed; use `ps-*`, `pe-*`, `ms-*`, `me-*` |
| `Locale` type | `src/types/index.ts` | `'ur' \| 'fa'`; `LOCALES` const; `DEFAULT_LOCALE = 'ur'` |
| `GlobalContainer` | `src/components/GlobalContainer.tsx` | `max-w-6xl` + responsive padding — use on every public page |
| `SectionHeader` | `src/components/public/SectionHeader.tsx` | Section h2 + optional "view all" link |
| `LanguageBadge` | `src/components/public/LanguageBadge.tsx` | Burgundy pill, اردو / فارسی |
| `CmsPageHeader` | `src/components/cms/CmsPageHeader.tsx` | Page h1 + optional action button slot |
| Supabase server client | `src/lib/supabase/server.ts` | `createSupabaseServerClient()` — use in Server Components & actions |
| Supabase browser client | `src/lib/supabase/client.ts` | `createSupabaseBrowserClient()` — use in Client Components |
| Admin role check pattern | `src/lib/actions/articles.ts` | `profile.role !== 'admin'` → return `{ error: 'Forbidden', status: 403 }` |
| `getAdminArticles()` | `src/lib/actions/articles.ts` | Returns all articles (any status); requires auth; CMS use only |
