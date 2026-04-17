# M-03 · Articles — Feature Breakdown

**Generated:** 2026-04-17  
**Module FR:** FR-02  
**Status at generation:** 0 Done · 3 In Progress (partial code exists) · 2 Not Started

---

## Feature Table

| Step | Feature ID | Feature Name | Priority | Depends On | Spec File |
|---|---|---|---|---|---|
| 10 | F-03-01 | Build TipTap RTL Editor | P0 | F-01-02, F-06-01 | — |
| 11 | F-03-02 | Implement Article Server Actions | P0 | F-06-01, F-02-02 | — |
| 12 | F-03-03 | Build Dashboard Article Manager | P0 | F-03-01, F-03-02 | — |
| 13 | F-03-04 | Render Public Article Listing | P1 | F-03-02 | — |
| 14 | F-03-05 | Render Public Article Detail | P1 | F-03-01, F-03-02 | — |

---

## Per-Feature Summaries

### F-03-01 — Build TipTap RTL Editor
- **What:** A reusable TipTap 2.x editor component with RTL enabled, writing to TipTap JSONB, plus a companion read-only viewer component.
- **Why:** FR-02 requires rich-text authoring in Urdu/Farsi (RTL). The editor is a hard dependency for create/edit flows; the viewer is a dependency for the public detail page.
- **Files touched:**
  - `src/components/editor/TipTapEditor.tsx` — writable editor (used in CMS forms)
  - `src/components/editor/TipTapViewer.tsx` — read-only renderer (used on public detail page)
  - `package.json` — ensure `@tiptap/react`, `@tiptap/starter-kit`, `@tiptap/extension-rtl` are installed
- **Acceptance signal:** Typing Urdu text in the editor produces a `{ type: "doc", content: [...] }` JSONB blob; the viewer renders it with correct RTL layout (no raw JSON shown).
- **Spec command:** `/create-spec 10 build-tiptap-rtl-editor`

---

### F-03-02 — Implement Article Server Actions
- **What:** Complete, type-safe server actions for article CRUD — create, read (list + single), update, delete — with RBAC enforced at the server-action layer (delete = admin only).
- **Why:** FR-02 mandates admin-only delete and authenticated-user create/edit. A skeleton `src/lib/actions/articles.ts` already exists with all five actions; this feature validates correctness (role check, types, error handling) and marks it production-ready.
- **Files touched:**
  - `src/lib/actions/articles.ts` — already exists; verify and harden
  - `src/types/index.ts` — `Article`, `ArticleStatus`, `ArticleInput` types already present
- **Acceptance signal:** Calling `deleteArticle()` with a manager JWT returns `{ error: 'Forbidden', status: 403 }`; admin JWT returns `{ success: true }`.
- **Spec command:** `/create-spec 11 implement-article-server-actions`

---

### F-03-03 — Build Dashboard Article Manager
- **What:** CMS-side pages for listing all articles (draft + published), creating new articles, and editing existing ones — with status badges and an admin-only delete button with confirmation dialog.
- **Why:** FR-02 and FR-06 require the dashboard to show status badges and conditionally render Edit (Manager) vs Edit + Delete (Admin).
- **Files touched:**
  - `src/app/(cms)/dashboard/articles/page.tsx` — article list with status badges
  - `src/app/(cms)/dashboard/articles/new/page.tsx` — create form with TipTap editor
  - `src/app/(cms)/dashboard/articles/[id]/edit/page.tsx` — edit form with TipTap editor
  - `src/components/dashboard/ArticleTable.tsx` — table/card list component
  - `src/app/(cms)/dashboard/page.tsx` — add "Articles" card to dashboard home
- **Acceptance signal:** Manager sees Edit button only; Admin sees Edit + Delete; deleting an article removes it from the list without page reload errors.
- **Spec command:** `/create-spec 12 build-dashboard-article-manager`

---

### F-03-04 — Render Public Article Listing
- **What:** A polished public `/articles` page that lists published articles with title, language badge, and date — paginated or fully loaded — in RTL layout for both `ur` and `fa`.
- **Why:** FR-02 public read requirement. A skeleton `src/app/(public)/articles/page.tsx` exists but only renders a basic `<ul>` with no language badge, no empty-state illustration, and no RTL validation.
- **Files touched:**
  - `src/app/(public)/articles/page.tsx` — enhance existing page
  - `src/app/(public)/articles/loading.tsx` — skeleton loader (already exists, verify)
- **Acceptance signal:** `/articles` renders at least one published article card with title and language badge; layout is RTL-correct in both `ur` and `fa` locales.
- **Spec command:** `/create-spec 13 render-public-article-listing`

---

### F-03-05 — Render Public Article Detail
- **What:** A polished public `/articles/[id]` page that renders TipTap JSONB content via `TipTapViewer`, with RTL typography and a breadcrumb back to the listing.
- **Why:** FR-02 requires rich-text display on the public site. The existing `src/app/(public)/articles/[id]/page.tsx` currently shows raw `JSON.stringify` output as a placeholder, explicitly noting it awaits the TipTap viewer (F-03-01).
- **Files touched:**
  - `src/app/(public)/articles/[id]/page.tsx` — replace JSON dump with `TipTapViewer`
  - `src/components/editor/TipTapViewer.tsx` — consumed here (built in F-03-01)
- **Acceptance signal:** Navigating to a published article URL renders formatted RTL prose, not raw JSON; `notFound()` fires for unknown/draft IDs.
- **Spec command:** `/create-spec 14 render-public-article-detail`

---

## Current Code Reality (snapshot 2026-04-17)

| File | Exists? | State |
|---|---|---|
| `src/lib/actions/articles.ts` | Yes | Full CRUD skeleton — needs hardening |
| `src/app/(public)/articles/page.tsx` | Yes | Basic listing — no language badge, RTL unverified |
| `src/app/(public)/articles/[id]/page.tsx` | Yes | Placeholder — raw JSON, awaits TipTap viewer |
| `src/components/editor/TipTapEditor.tsx` | No | Must create |
| `src/components/editor/TipTapViewer.tsx` | No | Must create |
| `src/app/(cms)/dashboard/articles/` | No | Must create |
