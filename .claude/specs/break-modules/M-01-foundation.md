---
module_id: M-01
module_name: Foundation
srs_refs: FR-01, FR-05, FR-06, NFR-01, NFR-02, NFR-03
generated: 2026-04-15
---

# M-01 — Foundation: Feature Breakdown

## Feature Table

| Step | Feature ID | Feature Name | Priority | Depends On | Spec File |
|---|---|---|---|---|---|
| 01 | F-01-01 | Scaffold Next.js App Router | P0 | — | `.claude/specs/features/01-nextjs-scaffold.md` |
| 02 | F-01-02 | Configure Tailwind RTL | P0 | F-01-01 | `.claude/specs/features/02-tailwind-rtl.md` |
| 03 | F-01-03 | Install Font System | P0 | F-01-01 | `.claude/specs/features/03-font-system.md` |
| 04 | F-01-04 | Build Language Toggle | P0 | F-01-02, F-01-03 | `.claude/specs/features/04-language-toggle.md` |
| 05 | F-01-05 | Implement Auth Middleware | P0 | F-01-01 | `.claude/specs/features/05-auth-middleware.md` |

---

## Per-Feature Summaries

### F-01-01 — Scaffold Next.js App Router
- **What:** A clean Next.js 15 project with App Router, TypeScript strict mode, and the correct folder structure (`src/app/`, `src/components/`, `src/lib/`, `src/types/`) runs on `localhost:3000`.
- **Why:** Every other feature depends on this scaffold. Maps to SRS §2.1, §7.1, §8 Phase 1 item 1.
- **Files touched:** `next.config.ts`, `tsconfig.json`, `src/app/layout.tsx`, `src/app/page.tsx`, `src/types/index.ts`
- **Acceptance signal:** `npm run dev` serves at `localhost:3000`; `npx tsc --noEmit` exits 0.
- **Spec command:** `/create-spec 01 nextjs-scaffold`

---

### F-01-02 — Configure Tailwind RTL
- **What:** Install Tailwind CSS with `tailwindcss-rtl` plugin and initialize Shadcn/UI (New York style, Stone base, CSS variables). Configure a "Digital Manuscript" theme — soft paper (`#F9F7F2`) background, Oxford Blue / Burgundy / Forest Green accents — via Shadcn CSS variable overrides at `:root`. Load `Noto Nastaliq Urdu` and `Vazirmatn` via `next/font/google` and switch between them using a `--font-body` CSS variable keyed on `html[lang]`. Create a `GlobalContainer` layout primitive that enforces `dir="rtl"`, applies the paper background, and uses only logical padding classes (`ps-*`, `pe-*`).
- **Why:** NFR-01 mandates logical CSS everywhere; the RTL plugin enforces the rule at the utility layer. Shadcn/UI is chosen over MUI/Bootstrap because we own the component source — the only way to apply `line-height: 2.0` (required for Nastaliq legibility) without fighting third-party specificity. Maps to SRS §4 NFR-01, NFR-02, CLAUDE.md RTL-First and Typography rules.
- **Files touched:** `postcss.config.mjs`, `tailwind.config.ts`, `components.json`, `src/app/globals.css`, `src/app/layout.tsx`, `src/components/GlobalContainer.tsx`, `src/lib/utils.ts`
- **Acceptance signal:** `npm run dev` shows soft paper background at `localhost:3000`; DevTools shows Noto Nastaliq Urdu when `lang="ur"` and Vazirmatn when `lang="fa"`; `grep -r "text-left\|ml-\|mr-\|pl-\|pr-" src/` returns 0 results; `npx tsc --noEmit` exits 0.
- **Spec command:** `/create-spec 02 tailwind-rtl`

---

### F-01-03 — Install Font System
- **What:** Noto Nastaliq Urdu and Vazirmatn fonts are loaded via `next/font/google` and applied to the root layout, ready to swap on language toggle.
- **Why:** FR-05 requires fonts to switch with language; both fonts must be declared before the toggle can reference them. Maps to SRS §3 FR-05, §2.2.
- **Files touched:** `src/app/layout.tsx`, `src/lib/fonts.ts`, `src/app/globals.css`
- **Acceptance signal:** With `lang="ur"` on `<html>`, DevTools Computed panel shows Noto Nastaliq Urdu; with `lang="fa"` it shows Vazirmatn.
- **Spec command:** `/create-spec 03 font-system`

---

### F-01-04 — Build Language Toggle
- **What:** A UI control lets users switch between Urdu (`ur`) and Farsi (`fa`); choice persists via cookie and sets `<html lang dir>` plus the correct font class on every page load.
- **Why:** FR-05 is a core UX requirement with an explicit persistence acceptance criterion. Maps to SRS §3 FR-05, §8 Phase 1 item 5.
- **Files touched:** `src/components/LanguageToggle.tsx`, `src/app/layout.tsx`, `src/lib/language.ts`
- **Acceptance signal:** Switch to Farsi, navigate to `/`, confirm `<html lang="fa" dir="rtl">` and Vazirmatn font are still active.
- **Spec command:** `/create-spec 04 language-toggle`

---

### F-01-05 — Implement Auth Middleware
- **What:** `middleware.ts` intercepts all `/dashboard/**` requests and redirects unauthenticated users to `/login`.
- **Why:** FR-01 and FR-06 require dashboard protection; middleware is the only server-side gate before render. Maps to SRS §3 FR-01, FR-06, §8 Phase 1 item 6.
- **Files touched:** `src/middleware.ts`, `src/lib/supabase/middleware.ts`
- **Acceptance signal:** Visiting `/dashboard` while logged out returns a 307 redirect to `/login`; logged-in users pass through.
- **Spec command:** `/create-spec 05 auth-middleware`

---

## Status

```
Module: M-01 — Foundation
Features Found: 5
Already Specced: 0
Needs Spec:     5
Next Step: Run /create-spec 01 nextjs-scaffold
```
