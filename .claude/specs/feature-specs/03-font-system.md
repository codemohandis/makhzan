# Spec: Font System

## 1. Context & User Story (Human Layer)

- **SRS Reference:** FR-05 (Language Toggle — font infrastructure subset)
- **Overview:** Establish the complete font loading and switching infrastructure for Urdu (Noto Nastaliq) and Farsi (Vazirmatn). This step formalises what was partially scaffolded in Step 02 and adds the TypeScript `Locale` type that all subsequent features depend on.
- **User Story:** "As a developer, I want a typed `Locale` system and verified font infrastructure so that every component can reference `ur`/`fa` safely and fonts switch automatically via the `html[lang]` attribute."
- **Depends on:** Step 01 — Next.js Scaffold, Step 02 — Tailwind RTL Configuration

---

## 2. Technical Blueprint (Agent Layer)

### Interface & Contract

| Interface | Type | Location | Behaviour |
| :--- | :--- | :--- | :--- |
| `Locale` | TS type | `src/types/index.ts` | `'ur' \| 'fa'` — the only valid locale values |
| `LOCALES` | TS const | `src/types/index.ts` | `['ur', 'fa'] as const` — iterable for selects/toggles |
| `DEFAULT_LOCALE` | TS const | `src/types/index.ts` | `'ur'` — applied when no preference is stored |
| `--font-body` | CSS var | `src/app/globals.css` | Resolves to `--font-nastaliq` when `html[lang="ur"]`; resolves to `--font-vazirmatn` when `html[lang="fa"]` |
| `font-nastaliq` | Tailwind class | `tailwind.config.ts` | Maps to `var(--font-nastaliq)` — use for Urdu-specific overrides |
| `font-vazirmatn` | Tailwind class | `tailwind.config.ts` | Maps to `var(--font-vazirmatn)` — use for Farsi-specific overrides |

### Execution Plan

- **Database:** Schema stable — no changes.

- **Modify:**
  - `src/types/index.ts` — add `Locale` type, `LOCALES` const, `DEFAULT_LOCALE` const. This file is currently empty (`export {}`).

- **Verify (already done in Step 02 — no changes needed):**
  - `src/app/layout.tsx` — `Noto_Nastaliq_Urdu` + `Vazirmatn` loaded via `next/font/google`; CSS variables `--font-nastaliq` + `--font-vazirmatn` applied to `<html>`
  - `src/app/globals.css` — `:root { --font-body: var(--font-nastaliq) }` + `html[lang="fa"] { --font-body: var(--font-vazirmatn) }` switching logic present
  - `tailwind.config.ts` — `fontFamily: { nastaliq: [...], vazirmatn: [...] }` defined

### RTL Checklist
> This step creates no UI layout files — checklist applies only to the type file, which has no CSS.

- [ ] No directional CSS classes in `src/types/index.ts`

### Logic Scenarios (Gherkin-style)

- **Scenario:** Urdu font renders correctly
  - **Given:** `<html lang="ur">` is set in layout
  - **When:** Browser renders any page
  - **Then:** DevTools Computed panel shows `font-family` resolving to Noto Nastaliq Urdu; `line-height` = 2

- **Scenario:** Farsi font switches via lang attribute
  - **Given:** Developer sets `<html lang="fa">` (simulating Step 04 toggle)
  - **When:** Page renders
  - **Then:** DevTools shows Vazirmatn; `line-height` = 1.8; layout remains `dir="rtl"`

- **Scenario:** Invalid locale rejected at compile time
  - **Given:** A component imports `Locale` from `src/types/`
  - **When:** Developer passes `lang="en"` where `Locale` is expected
  - **Then:** `npx tsc --noEmit` reports a type error

### Hard Constraints
> Inherited from `CLAUDE.md — Coding Standards`. No exceptions.

---

## 3. Definition of Done

- [ ] `src/types/index.ts` exports `Locale`, `LOCALES`, and `DEFAULT_LOCALE`
- [ ] `npx tsc --noEmit` exits with 0 errors
- [ ] DevTools: `html[lang="ur"]` → `font-family` resolves to Noto Nastaliq Urdu, `line-height` = 2
- [ ] DevTools: manually set `lang="fa"` → Vazirmatn loads, `line-height` = 1.8
- [ ] `Locale` type rejects `"en"` at compile time (verified by intentional type error test)
- [ ] No font loaded via `<link>` tag or CDN — only `next/font/google` (verified in page source)
- [ ] `/fix-rtl` run on any modified files — 0 replacements needed
