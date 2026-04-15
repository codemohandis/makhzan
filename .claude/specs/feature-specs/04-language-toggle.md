# Spec: Language Toggle Component

## 1. Context & User Story (Human Layer)

- **SRS Reference:** FR-05 (Language Toggle — UI component and persistence layer)
- **Overview:** Implement the runtime language-switching component and cookie-persistence layer that connects the font infrastructure (Step 03) to the user. The toggle updates `<html lang>` between `ur` and `fa`; the existing CSS var `--font-body` then switches fonts automatically.
- **User Story:** "As a public user, I want to switch the site language between Urdu and Farsi so that I can read content in my preferred language, with my choice remembered across all pages."
- **Depends on:** Step 01 — Next.js 15 App Router Scaffold, Step 03 — Font System (Noto Nastaliq + Vazirmatn)

---

## 2. Technical Blueprint (Agent Layer)

### Interface & Contract

| Interface | Method | Location | Access | Behaviour |
| :--- | :--- | :--- | :--- | :--- |
| `setLocale` | Server Action | `src/lib/actions/locale.ts` | Public | Validates `locale` against `LOCALES`; sets `locale` cookie (`path=/`, `maxAge` 1 year, `SameSite: Lax`) via `cookies().set()` from `next/headers` |
| `LanguageToggle` | Client Component | `src/components/LanguageToggle.tsx` | Public | `'use client'`; renders اردو / فارسی buttons; highlights the active locale; calls `setLocale` then `router.refresh()` on click |
| Root Layout | Server Component | `src/app/layout.tsx` | Public | Reads `locale` cookie via `cookies()` from `next/headers`; falls back to `DEFAULT_LOCALE = 'ur'`; passes value to `<html lang>`; `dir` stays `rtl` (both locales are RTL) |

### Execution Plan

- **Database:** Schema stable — no changes.

- **Modify:**
  - `src/app/layout.tsx` — import `cookies` from `next/headers`; read `locale` cookie; replace hardcoded `lang="ur"` with the dynamic locale value. `dir="rtl"` remains fixed.

- **Create:**
  - `src/lib/actions/locale.ts` — `'use server'` module; exports `setLocale(locale: Locale)` server action that validates input and sets the cookie.
  - `src/components/LanguageToggle.tsx` — `'use client'` component; two buttons labeled اردو and فارسی; active button visually distinct; triggers locale switch.

### RTL Checklist

- [ ] All layout classes use logical properties (`ps-*`, `pe-*`, `ms-*`, `me-*`, `text-start`, `text-end`)
- [ ] No `left-*`, `right-*`, `text-left`, `text-right` in new files
- [ ] Component tested with `lang="ur"` and `lang="fa"` on `<html>`

### Logic Scenarios (Gherkin-style)

- **Scenario:** Success — User switches to Farsi
  - **Given:** Page loads with `<html lang="ur">` and Nastaliq font active
  - **When:** User clicks the فارسی button in `LanguageToggle`
  - **Then:** `setLocale('fa')` sets cookie `locale=fa`; `router.refresh()` triggers server re-render; `<html lang="fa">` is applied; `--font-body` resolves to Vazirmatn; `line-height` becomes 1.8

- **Scenario:** Persistence — Cookie survives navigation
  - **Given:** Cookie `locale=fa` is set
  - **When:** User navigates to any route
  - **Then:** Layout reads cookie server-side and renders `<html lang="fa">` immediately — no hydration flash

- **Scenario:** Default fallback — No cookie present
  - **Given:** New visitor with no `locale` cookie
  - **When:** Any page renders
  - **Then:** `DEFAULT_LOCALE = 'ur'` is used; Nastaliq font applies; `line-height: 2`

- **Scenario:** Invalid locale rejected
  - **Given:** A caller passes an arbitrary string (e.g. `'en'`) to `setLocale`
  - **When:** Server action validates against `LOCALES`
  - **Then:** Action returns early without setting the cookie; no side effects

### Hard Constraints
> Inherited from `CLAUDE.md — Coding Standards`. No exceptions.

---

## 3. Definition of Done

- [ ] `npx tsc --noEmit` exits with 0 errors
- [ ] `LanguageToggle` renders اردو and فارسی buttons; active locale is visually highlighted
- [ ] Clicking فارسی → `<html lang="fa">` in DevTools → Vazirmatn font active → `line-height: 1.8`
- [ ] Clicking اردو → `<html lang="ur">` → Nastaliq font active → `line-height: 2`
- [ ] Navigating to a new page preserves the selected locale (cookie persists)
- [ ] DevTools Application → Cookies: `locale` cookie present with `path=/`, expiry ~1 year
- [ ] No locale cookie → site defaults to `ur` (Urdu / Nastaliq)
- [ ] `/fix-rtl` run on `LanguageToggle.tsx` — 0 replacements needed
