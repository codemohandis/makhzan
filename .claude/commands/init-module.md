Scaffold a new content module for the Makhzan project.

The module name is provided as an argument (articles, books, or videos).

Create the following files under `src/app/[module]/`:
1. `page.tsx` — Server Component listing all published items for the module, with RTL-safe Tailwind layout (use `text-start`, `ps-*`, `pe-*`). Fetch data from Supabase using the server client from `src/lib/supabase/server.ts`.
2. `loading.tsx` — Loading skeleton that mirrors the layout of `page.tsx` using `animate-pulse` Tailwind classes.
3. `[id]/page.tsx` — Detail page for a single item.

Also create `src/lib/actions/[module].ts` with stub server actions:
- `getAll[Module]()` — fetch all published items
- `get[Module]ById(id: string)` — fetch a single item
- `create[Module](data)` — insert (authenticated users only)
- `update[Module](id, data)` — update (authenticated users only)
- `delete[Module](id)` — delete with admin role check (see CLAUDE.md security pattern)

Use TypeScript strict types. Import types from `src/types/index.ts`.
