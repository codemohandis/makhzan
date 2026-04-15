# Spec: Next.js App Router Scaffold

## 1. Context & User Story (Human Layer)

- **SRS Reference:** SRS §2.1 Architecture, §7.1 File Structure, §8 Phase 1 (item 1)
- **Overview:** Bootstrap the Next.js 15 project with App Router, TypeScript strict mode, and the canonical folder layout that every subsequent feature will build upon. This is the root dependency for all other modules.
- **User Story:** "As a developer, I want a running Next.js 15 App Router project with strict TypeScript and the correct `src/` layout so that all subsequent features have a stable, consistent base to build on."
- **Depends on:** Nothing — this is the root feature.

---

## 2. Technical Blueprint (Agent Layer)

### Interface & Contract

| Interface | Method | Path / Action | Access | Behaviour |
| :--- | :--- | :--- | :--- | :--- |
| Page | GET | `/` | Public | Renders placeholder home page confirming the app is running |
| Page | GET | `/dashboard` | Auth (guard added in Step 05) | Placeholder dashboard page — no auth guard yet |

### Execution Plan

- **Database:** Schema stable — no changes (database migration is Step 24, M-06).

- **Create:** All files below are new (green-field scaffold):

  | File | Purpose |
  |---|---|
  | `next.config.ts` | Next.js 15 config with App Router enabled |
  | `tsconfig.json` | TypeScript 5.x strict mode (`"strict": true`) |
  | `package.json` | Dependencies: `next`, `react`, `react-dom`, `typescript`, `@types/react`, `@types/node` |
  | `src/app/layout.tsx` | Root layout — `<html>` shell with `lang` and `dir` attributes (RTL placeholders for Step 03/04) |
  | `src/app/page.tsx` | Public home page — minimal placeholder |
  | `src/app/dashboard/page.tsx` | Dashboard placeholder — full auth guard added in Step 05 |
  | `src/app/globals.css` | Global styles reset — Tailwind directives added in Step 02 |
  | `src/components/.gitkeep` | Reserves folder for shared components |
  | `src/lib/.gitkeep` | Reserves folder for Supabase client + server actions |
  | `src/types/index.ts` | Root type export barrel — empty stub, populated by later steps |
  | `.env.local.example` | Template for required env vars (never `.env.local` itself) |

- **Modify:** Nothing — no prior files exist.

### RTL Checklist
- [ ] `src/app/layout.tsx` uses `dir="rtl"` as the default direction attribute on `<html>`
- [ ] No `left-*`, `right-*`, `text-left`, `text-right` in any scaffolded file
- [ ] `<html>` element includes both `lang` and `dir` attributes as props (ready for Step 04 dynamic switching)

### Logic Scenarios (Gherkin-style)

- **Scenario:** Dev server starts successfully
  - **Given:** Dependencies are installed (`npm install`)
  - **When:** `npm run dev` is run
  - **Then:** Browser opens `localhost:3000` and renders the home page without errors

- **Scenario:** TypeScript compiles clean
  - **Given:** Scaffold files are written with strict types
  - **When:** `npx tsc --noEmit` is run
  - **Then:** Zero errors, zero warnings

- **Scenario:** Production build passes
  - **Given:** No type errors in any scaffold file
  - **When:** `npm run build` is run
  - **Then:** Build completes without errors; `.next/` directory is generated

### Hard Constraints (The Guardrails)

- Use **Next.js 15** with App Router — Pages Router must not be initialised
- `tsconfig.json` must include `"strict": true` — never relax this
- Folder structure must match SRS §7.1 exactly: `src/app/`, `src/components/`, `src/lib/`, `src/types/`
- `.env.local` must **never** be created or committed — only `.env.local.example`
- No Tailwind config yet — that is Step 02
- No Supabase client yet — that is Step 06
- No font loading yet — that is Step 03
- RTL-first CSS — see RTL Checklist above

---

## 3. Definition of Done

- [ ] `npm run dev` serves a page at `localhost:3000` with no console errors
- [ ] `npm run build` completes with 0 errors
- [ ] `npx tsc --noEmit` exits with 0 errors
- [ ] Folder structure matches SRS §7.1: `src/app/`, `src/components/`, `src/lib/`, `src/types/` all exist
- [ ] `tsconfig.json` contains `"strict": true`
- [ ] `<html>` element in `layout.tsx` has both `lang` and `dir` attributes
- [ ] `.env.local` does NOT exist in the repository; `.env.local.example` does
- [ ] `/fix-rtl` run on `src/app/layout.tsx` — 0 replacements needed
