# Makhzan — Claude Code Agent Rules

Read this file at the start of every session. These rules are non-negotiable.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 15 (App Router, Server Components) |
| Auth & Database | Supabase (Postgres + Auth + Storage) |
| Styling | Tailwind CSS + tailwindcss-rtl |
| Rich Text | TipTap 2.x |
| PDF | react-pdf-viewer |
| Video | lite-youtube-embed |
| Language | TypeScript 5.x (strict mode) |
| Fonts | Noto Nastaliq Urdu (Urdu), Vazirmatn (Farsi) |

---

## Coding Standards

### RTL-First (Mandatory)
- Always use logical CSS properties: `ps-*`, `pe-*`, `ms-*`, `me-*`, `text-start`, `text-end`
- **Never** use `left`, `right`, `text-left`, `text-right` in any component under `src/`
- All grids and flex layouts must be direction-agnostic

### Security (Mandatory)
- Every server action that performs `DELETE`, `UPDATE`, or `INSERT` must validate `user.role` first
- Pattern to follow:
  ```ts
  const { data: profile } = await supabase
    .from('profiles').select('role').eq('id', user.id).single();
  if (profile?.role !== 'admin') return { error: 'Forbidden' };
  ```
- `SUPABASE_SERVICE_ROLE_KEY` is server-only — never import it in client components

### Performance
- All YouTube embeds must use `lite-youtube-embed` — no raw `<iframe>` for YouTube
- PDF viewer must lazy-load pages; never load the full PDF upfront
- Images use `next/image` with explicit `width` and `height`

### TypeScript
- Strict mode is enabled (`"strict": true` in `tsconfig.json`)
- No `any` types — use proper types or `unknown`
- Define all data models in `src/types/`

---

## File & Folder Boundaries

| Path | Rule |
|---|---|
| `src/` | All application source code lives here |
| `src/lib/` | Supabase client, server actions, utility functions |
| `src/types/` | TypeScript type definitions only |
| `supabase/migrations/` | SQL migration files — never edit manually after applying |
| `.env.local` | Never read, log, or expose contents |
| `node_modules/` | Never touch |

---

## Bash Commands

**Allowed:**
```bash
npm run dev          # Start dev server
npm run build        # Production build
npx tsc --noEmit     # Type check
npm install <pkg>    # Install dependency
npx supabase ...     # Supabase CLI operations
```

**Forbidden (ask user first):**
```bash
git push             # Never push without confirmation
npm run deploy       # Never deploy without confirmation
supabase db push     # Confirm before applying migrations to remote
```

---

## Content Rules

- **Articles:** Use TipTap with RTL extension enabled; content stored as JSONB
- **Books:** PDF URL from Supabase Storage (`books` bucket); never store raw file data in DB
- **Videos:** Store YouTube **ID only** (e.g., `dQw4w9WgXcQ`) — never a full URL or embed HTML

---

## Testing Workflow

After implementing any feature:
1. Run `npx tsc --noEmit` — must produce zero errors
2. Run `/fix-rtl` on any new component — must produce zero replacements
3. Run `/secure-action` on any file with delete logic — must confirm role check exists
4. Test manually in browser with language set to both `ur` and `fa`

---

## Slash Commands Available

| Command | Purpose |
|---|---|
| `/init-module` | Scaffold a new content module (articles/books/videos) |
| `/break-module` | Decompose a module into features with priorities |
| `/create-spec` | Create a spec and git branch for a single feature |
| `/secure-action` | Audit delete operations for missing admin role check |
| `/fix-rtl` | Replace hardcoded left/right CSS with logical equivalents |
| `/db-migrate` | Generate a Supabase migration SQL file |

---

## Project Reference

Agent context (FR table, DB schema snapshot, spec registry): `docs/agent-context.md`

Full human-readable requirements: `docs/roadmap/srs.md`
