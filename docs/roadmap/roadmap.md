# Makhzan — Modular Roadmap (Level-of-Detail)

**Generated from:** `srs.md` v1.1  
**Date:** 2026-04-15  
**Tracking:** Each feature maps to a spec in `.claude/specs/`

---

## How to Use This Roadmap

| Action | Command | Output |
|---|---|---|
| Decompose a module into features | `/break-module <module-id>` | Feature list with priorities |
| Generate a deep-dive spec for a feature | `/create-spec <step_num> <feature-name>` | `.claude/specs/<step_num>-<slug>.md` |

**Status Legend:** `[ ]` Not started · `[~]` In Progress · `[x]` Done

---

## Phase 1 — Modules (High Level)

| ID | Module | Description | SRS Reference |
|---|---|---|---|
| M-01 | Foundation | Next.js scaffold, Tailwind RTL, fonts, language toggle, auth middleware | SRS §2, §8 Phase 1 |
| M-02 | Auth | Supabase Auth, profiles table, login/logout, RBAC role management | SRS §3 FR-01, FR-06 |
| M-03 | Articles | TipTap RTL editor, CRUD server actions, dashboard, public pages | SRS §3 FR-02 |
| M-04 | Library | PDF upload, Supabase Storage, react-pdf-viewer, download gating | SRS §3 FR-03 |
| M-05 | Media | YouTube ID storage, lite-youtube-embed RTL gallery | SRS §3 FR-04 |
| M-06 | Database | All SQL migrations, RLS policies, storage buckets | SRS §5 |

---

## Phase 2 — Features (Detailed Breakdown)

### M-01 · Foundation

| Step | Feature ID | Feature Name | Priority | Spec |
|---|---|---|---|---|
| [~] 01 | F-01-01 | Next.js 15 App Router Scaffold | P0 | `.claude/specs/feature-specs/01-nextjs-scaffold.md` |
| [~] 02 | F-01-02 | Tailwind RTL Configuration | P0 | `.claude/specs/feature-specs/02-tailwind-rtl.md` |
| [x] 03 | F-01-03 | Font System (Noto Nastaliq + Vazirmatn) | P0 | `.claude/specs/feature-specs/03-font-system.md` |
| [~] 04 | F-01-04 | Language Toggle Component | P0 | `.claude/specs/feature-specs/04-language-toggle.md` |
| [~] 05 | F-01-05 | Auth Middleware (Dashboard Protection) | P0 | `.claude/specs/feature-specs/05-auth-middleware.md` |

### M-02 · Auth

| Step | Feature ID | Feature Name | Priority | Spec |
|---|---|---|---|---|
| [~] 06 | F-02-01 | Supabase Auth Setup (Email/Password) | P0 | `.claude/specs/feature-specs/06-supabase-auth.md` |
| 07 | F-02-02 | Profiles Table + Auto-Create Trigger | P0 | `.claude/specs/07-profiles-trigger.md` |
| 08 | F-02-03 | Login & Logout Pages | P0 | `.claude/specs/08-login-logout.md` |
| 09 | F-02-04 | Admin Role Elevation (Manager → Admin) | P1 | `.claude/specs/09-role-elevation.md` |

### M-03 · Articles

| Step | Feature ID | Feature Name | Priority | Spec |
|---|---|---|---|---|
| 10 | F-03-01 | TipTap RTL Editor Component | P0 | `.claude/specs/10-tiptap-rtl-editor.md` |
| 11 | F-03-02 | Article Server Actions (CRUD + RBAC) | P0 | `.claude/specs/11-article-server-actions.md` |
| 12 | F-03-03 | Dashboard Article List & Edit Pages | P0 | `.claude/specs/12-dashboard-articles.md` |
| 13 | F-03-04 | Public Article Listing Page | P1 | `.claude/specs/13-public-articles.md` |
| 14 | F-03-05 | Public Article Detail Page | P1 | `.claude/specs/14-article-detail.md` |

### M-04 · Library (Books)

| Step | Feature ID | Feature Name | Priority | Spec |
|---|---|---|---|---|
| 15 | F-04-01 | Supabase Storage Bucket (`books`) | P0 | `.claude/specs/15-books-storage.md` |
| 16 | F-04-02 | PDF Upload Form | P0 | `.claude/specs/16-pdf-upload.md` |
| 17 | F-04-03 | react-pdf-viewer Reader Component | P0 | `.claude/specs/17-pdf-reader.md` |
| 18 | F-04-04 | Book Server Actions (CRUD + RBAC) | P0 | `.claude/specs/18-book-server-actions.md` |
| 19 | F-04-05 | Public Book Listing + Reader Page | P1 | `.claude/specs/19-public-books.md` |

### M-05 · Media (Videos)

| Step | Feature ID | Feature Name | Priority | Spec |
|---|---|---|---|---|
| 20 | F-05-01 | Video Entry Form (YouTube ID capture) | P0 | `.claude/specs/20-video-form.md` |
| 21 | F-05-02 | lite-youtube-embed RTL Gallery | P0 | `.claude/specs/21-video-gallery.md` |
| 22 | F-05-03 | Video Server Actions (CRUD + RBAC) | P0 | `.claude/specs/22-video-server-actions.md` |
| 23 | F-05-04 | Public Video Gallery Page | P1 | `.claude/specs/23-public-videos.md` |

### M-06 · Database

| Step | Feature ID | Feature Name | Priority | Spec |
|---|---|---|---|---|
| 24 | F-06-01 | Initial Migration (profiles + articles) | P0 | `.claude/specs/24-migration-initial.md` |
| 25 | F-06-02 | Books + Videos Migration | P0 | `.claude/specs/25-migration-books-videos.md` |
| 26 | F-06-03 | RLS Policies for All Tables | P0 | `.claude/specs/26-rls-policies.md` |
| 27 | F-06-04 | Storage Bucket Policies | P0 | `.claude/specs/27-storage-policies.md` |

---

## Dependency Graph

```
M-01 Foundation
  └── M-02 Auth
        ├── M-03 Articles
        ├── M-04 Library
        └── M-05 Media
M-06 Database (runs in parallel with M-01 setup)
```

**Build order:** M-01 → M-06 → M-02 → M-03 → M-04 → M-05

---

## Progress Tracker

| Module | Total Features | Done | In Progress | Remaining |
|---|---|---|---|---|
| M-01 Foundation | 5 | 1 | 4 | 0 |
| M-02 Auth | 4 | 0 | 1 | 3 |
| M-03 Articles | 5 | 0 | 0 | 5 |
| M-04 Library | 5 | 0 | 0 | 5 |
| M-05 Media | 4 | 0 | 0 | 4 |
| M-06 Database | 4 | 0 | 0 | 4 |
| **Total** | **27** | **0** | **2** | **25** |
