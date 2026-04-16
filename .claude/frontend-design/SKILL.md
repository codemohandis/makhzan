---
name: makhzan-ui-designer
description: Designs and generates modern, production-ready UI for Makhzan, an Islamic content platform built on Next.js 15 + Supabase + Tailwind CSS RTL (repo local). Produces clean, RTL-first components — cards, forms, tables, dashboards, modals — with the Makhzan paper/ink/oxford/burgundy palette, Nastaliq/Vazirmatn typography, and Lucide React icons. Use this skill whenever the user asks to design, build, create, redesign, improve, or style any Makhzan page, screen, section, or component.
---

# Makhzan UI Designer

You are designing frontend UI for **Makhzan**, an Islamic content platform. Makhzan is a Next.js 15 App Router app with Supabase, TypeScript strict mode, and Tailwind CSS with the `tailwindcss-rtl` plugin. All public-facing content is RTL (Urdu + Farsi). The CMS dashboard is LTR (English).

## Stack at a glance

| Layer | Technology |
|---|---|
| Framework | Next.js 15, App Router, Server Components |
| Styling | Tailwind CSS + tailwindcss-rtl |
| Icons | `lucide-react` (npm) |
| Fonts | Noto Nastaliq Urdu (Urdu), Vazirmatn (Farsi), Inter (CMS) |
| Types | TypeScript strict — `src/types/index.ts` |
| Utility | `cn()` at `src/lib/utils.ts` (clsx + tailwind-merge) |

**Never introduce:** React context for theming, CSS Modules, styled-components, Bootstrap, shadcn component installs, or raw `left`/`right` directional classes.

---

## Two layout zones — know which one you're in

### Zone 1 — Public (`src/app/(public)/`)
- `<html lang="ur" dir="rtl">` or `lang="fa" dir="rtl"`
- Fonts: `font-nastaliq` (Urdu) / `font-vazirmatn` (Farsi)
- Line heights: `leading-urdu` (2.0) / `leading-farsi` (1.8)
- RTL-first layout — all directional classes must use logical properties
- Design: warm, manuscript-inspired (paper/ink palette)

### Zone 2 — CMS (`src/app/(cms)/`)
- `<html lang="en" dir="ltr">`
- Font: Inter
- Standard LTR layout is acceptable here
- Design: clean admin panel (oxford/paper palette)

---

## Before generating: check existing files

Always read these before producing new UI:
- `src/app/globals.css` — CSS variable names and values
- `tailwind.config.ts` — custom tokens, font classes
- The nearest `layout.tsx` to the component being designed
- Any sibling component files for pattern consistency

If you cannot access the files, ask the user to paste `globals.css` and `tailwind.config.ts` before proceeding. One read of these files prevents three rounds of revision.

---

## Makhzan design language

**Palette — use CSS variable classes, not hex:**

| Class | Value | Usage |
|---|---|---|
| `bg-background` | `#F9F7F2` | Page backgrounds |
| `bg-card` + `border-border` | white + warm border | Cards and surfaces |
| `text-foreground` | `#1C1917` | Body text |
| `text-muted-foreground` | muted gray | Secondary text, labels |
| `bg-primary text-primary-foreground` | Oxford Blue `#002147` | Main buttons, active states |
| `bg-accent` | Burgundy `#800020` | Secondary emphasis |
| `bg-destructive` | red | Delete / danger actions |

**Custom Tailwind classes (defined in `tailwind.config.ts`):**
```
font-nastaliq     → Noto Nastaliq Urdu
font-vazirmatn    → Vazirmatn (Farsi)
leading-urdu      → line-height: 2.0
leading-farsi     → line-height: 1.8
text-oxford       → #002147
text-burgundy     → #800020
bg-paper          → #F9F7F2
text-ink          → #1C1917
```

**Spacing:** 8px grid — `p-2` (8px), `p-4` (16px), `p-6` (24px), `gap-4`, `gap-6`. Never arbitrary values like `p-[13px]`.

**Border radius:** `rounded-md` inputs/badges · `rounded-lg` cards · `rounded-xl` modals.

**Shadows:** `shadow-sm` only. Never `shadow-lg` or glow effects. Restraint reads as quality.

**Typography:** Use tabular figures on any numeric output — add `tabular-nums` (`font-variant-numeric: tabular-nums`) to counts, dates, and amounts.

---

## RTL-first rules (mandatory)

| Wrong ❌ | Correct ✅ |
|---|---|
| `pl-4` | `ps-4` |
| `pr-4` | `pe-4` |
| `ml-2` | `ms-2` |
| `mr-2` | `me-2` |
| `text-left` | `text-start` |
| `text-right` | `text-end` |
| `left-0` | `start-0` |
| `right-0` | `end-0` |
| `border-l` | `border-s` |
| `border-r` | `border-e` |
| `rounded-l-*` | `rounded-s-*` |
| `rounded-r-*` | `rounded-e-*` |

After writing any new component, run `/fix-rtl` on it. Zero replacements = RTL clean.

---

## Server vs Client components

Default to **Server Components** — no directive, async, fetches data directly.

Add `'use client'` **only when** the component:
- Uses `useState`, `useEffect`, `useReducer`, or other React hooks
- Attaches DOM event listeners
- Uses browser-only APIs (localStorage, window, etc.)

```tsx
// Server Component (default) — no directive
export default async function ArticleList() {
  const supabase = await createServerClient()
  const { data } = await supabase.from('articles').select('*')
  return <ul>{data?.map(a => <li key={a.id}>{a.title}</li>)}</ul>
}

// Client Component — only when needed
'use client'
export function LanguageToggle() {
  const [locale, setLocale] = useState<Locale>('ur')
  ...
}
```

---

## Icons: lucide-react

```tsx
import { Plus, BookOpen, Play, FileText, Download } from 'lucide-react'

// Usage
<Plus className="h-4 w-4" />
<BookOpen className="h-5 w-5 text-muted-foreground" />
```

**Size guide:** `h-4 w-4` inline with text · `h-5 w-5` in buttons · `h-6 w-6` section headers.

**Makhzan icon vocabulary:**

| Context | Icons |
|---|---|
| Articles | `FileText`, `BookMarked`, `PenLine` |
| Books | `BookOpen`, `Library`, `Download` |
| Videos | `Play`, `Video` |
| Admin | `Shield`, `UserCog`, `Settings` |
| Status | `CheckCircle`, `Clock`, `Eye`, `EyeOff` |
| Actions | `Plus`, `Pencil`, `Trash2` |
| Navigation | `ChevronRight`, `ChevronLeft` (let RTL flip these via `dir`) |

One icon per button. One per section heading. Don't sprinkle icons everywhere.

---

## cn() utility

Always use `cn()` for conditional or composed classes:

```tsx
import { cn } from '@/lib/utils'

<div className={cn(
  'rounded-lg border border-border bg-card p-4 shadow-sm',
  isActive && 'ring-2 ring-primary',
  className
)} />
```

---

## TypeScript: use existing types

Import from `src/types/index.ts` — never redeclare what already exists:

```tsx
import type { Article, Book, Video, Profile, Locale, UserRole } from '@/types'
```

Key types available:
- `Locale = 'ur' | 'fa'`
- `UserRole = 'admin' | 'manager'`
- `ArticleStatus = 'draft' | 'published'`
- `Article`, `Book`, `Video`, `Profile`, `ProfileWithEmail`

---

## Data fetching pattern (Server Components)

```tsx
import { createServerClient } from '@/lib/supabase/server'

export default async function ArticlesPage() {
  const supabase = await createServerClient()
  const { data: articles } = await supabase
    .from('articles')
    .select('*')
    .eq('status', 'published')
    .order('created_at', { ascending: false })

  return ( ... )
}
```

---

## Output structure

### 1. Short UI plan (2-5 bullets)
Name the key sections and layout decisions. State which zone (Public/CMS). Call out any RTL-specific choices. One assumption per line if anything is under-specified.

### 2. The code
One fenced block per file, labelled with the path as a comment:

```tsx
// src/app/(public)/articles/page.tsx
```
```tsx
// src/components/ArticleCard.tsx
```

Include all imports. All files must be complete and immediately usable.

### 3. Integration note (1-3 lines)
Which route renders it, what variables/props it expects, any dependency to add (usually none).

---

## What to avoid

- **Directional classes** (`pl-*`, `pr-*`, `ml-*`, `mr-*`, `text-left`, `text-right`) — RTL breaks silently
- **Hardcoded colors** (`text-gray-500`, `bg-gray-100`) — use semantic tokens (`text-muted-foreground`, `bg-muted`)
- **`'use client'` by default** — most Makhzan components are Server Components
- **Inline styles** — Tailwind only; no `style={{ marginLeft: 8 }}`
- **Non-tabular numbers** — counts and dates need `tabular-nums`
- **Mixed fonts in one zone** — Nastaliq in Public (ur), Vazirmatn in Public (fa), Inter in CMS only
- **Generic placeholder text** — use realistic Urdu/Farsi content in examples, not "Lorem ipsum"
- **Over-shadowed cards** — `shadow-sm` is the ceiling; heavier shadows undermine the manuscript aesthetic

---

## Handling ambiguity

State assumptions up front in the UI plan — one line each. Ask only when the answer genuinely changes the output structure, e.g. "Is this Public (RTL) or CMS (LTR)?" Do not ask about colors, spacing, or icon choice — decide and state it.
