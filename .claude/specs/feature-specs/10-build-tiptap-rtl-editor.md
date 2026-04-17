# Spec: Build TipTap RTL Editor

## 1. Context & User Story (Human Layer)

- **SRS Reference:** FR-02
- **Overview:** Provide a reusable TipTap 2.x rich-text editor for authoring articles in Urdu and Farsi (both RTL), and a companion read-only viewer that renders stored TipTap JSONB as formatted RTL prose on public pages.
- **User Story:** "As an Admin or Manager, I want to write and edit article content in a right-to-left rich-text editor so that Urdu and Farsi text is authored and displayed with correct typography and directionality."
- **Depends on:**
  - Step 02 — Tailwind RTL Configuration (`tailwindcss-rtl` plugin active; `ps-*`/`pe-*` utilities available)
  - Step 03 — Font System (`--font-nastaliq` and `--font-vazirmatn` CSS variables live)
  - Step 24 — Migrate Articles Table (`articles.content JSONB` column must exist)

---

## 2. Technical Blueprint (Agent Layer)

### Interface & Contract

| Interface | Method | Path / Export | Access | Behaviour |
| :--- | :--- | :--- | :--- | :--- |
| React Component | Props | `<TipTapEditor value onChange language />` | CMS only (Auth) | Controlled editor; calls `onChange(json)` on every content change |
| React Component | Props | `<TipTapViewer content language />` | Public + CMS | Read-only; renders TipTap JSONB as RTL HTML prose |

**TipTapEditor props:**
```ts
interface TipTapEditorProps {
  value:    Record<string, unknown> | null; // initial TipTap JSON doc
  onChange: (json: Record<string, unknown>) => void;
  language: 'ur' | 'fa';
  disabled?: boolean;
}
```

**TipTapViewer props:**
```ts
interface TipTapViewerProps {
  content:  Record<string, unknown> | null;
  language: 'ur' | 'fa';
}
```

---

### Execution Plan

**Database:** Schema stable — no changes. `articles.content` is already `JSONB` (per agent-context DB snapshot).

**Install packages (if not present):**
```bash
npm install @tiptap/react @tiptap/pm @tiptap/starter-kit @tiptap/extension-text-direction
```

**Create:**
- `src/components/editor/TipTapEditor.tsx` — Writable, controlled TipTap editor with RTL extension
- `src/components/editor/TipTapViewer.tsx` — Read-only TipTap renderer (`editable: false`)
- `src/components/editor/editor.css` — Minimal prose styles scoped to `.tiptap-prose` (RTL-safe, uses `text-start`)

**Modify:** None — these are net-new components.

---

### RTL Checklist

- [ ] All layout classes use logical properties (`ps-*`, `pe-*`, `ms-*`, `me-*`, `text-start`, `text-end`)
- [ ] No `left-*`, `right-*`, `text-left`, `text-right` in new files
- [ ] Component tested with `lang="ur"` and `lang="fa"` on `<html>`
- [ ] TipTap editor itself has `dir="rtl"` on its root element (via `TextDirection` extension or explicit `HTMLAttributes`)
- [ ] Custom prose CSS uses `text-align: start` (not `right`) for paragraph alignment

---

### Logic Scenarios (Gherkin-style)

**Scenario:** Editor initialises with existing content
- **Given:** `value` prop contains a valid TipTap JSON doc `{ type: "doc", content: [...] }`
- **When:** `<TipTapEditor>` mounts
- **Then:** Editor displays the hydrated document; cursor is placed at end; layout is RTL

**Scenario:** Editor emits updated JSON on change
- **Given:** Editor is mounted with `language="ur"`
- **When:** User types Urdu characters
- **Then:** `onChange` is called with the updated `{ type: "doc", content: [...] }` object on every keystroke/transaction

**Scenario:** Viewer renders JSONB as prose
- **Given:** `content` is a valid TipTap JSON doc saved in the DB
- **When:** `<TipTapViewer content={doc} language="ur" />` renders
- **Then:** Formatted RTL prose is shown; no raw JSON or `<pre>` block visible

**Scenario:** Viewer handles null content gracefully
- **Given:** `content` prop is `null` (article was created with empty body)
- **When:** `<TipTapViewer>` renders
- **Then:** Component renders a fallback empty paragraph or nothing — no crash, no JSON.stringify output

**Scenario:** Language switch changes font
- **Given:** `language` prop is `"fa"`
- **When:** Component renders
- **Then:** The editor/viewer root element carries `lang="fa"`, causing CSS variable `--font-body` to resolve to Vazirmatn

---

### Edge Cases

- **Edge:** Malformed / partial JSONB stored in DB
  - **Given:** `content` is a plain object that is not a valid TipTap document (e.g. `{}`, `{ foo: "bar" }`)
  - **When:** `<TipTapViewer>` receives it
  - **Then:** TipTap's `generateHTML` falls back gracefully — renders empty doc without throwing; no unhandled exception propagates to the page

- **Edge:** `onChange` called during SSR or before mount
  - **Given:** TipTap is a client-only library; `TipTapEditor` is used in a Server Component tree
  - **When:** The file is imported
  - **Then:** File must be marked `'use client'`; if accidentally used in a Server Component, Next.js will throw a clear boundary error (expected — do not suppress)

- **Edge:** Very large JSONB content (100+ paragraphs)
  - **Given:** An article with hundreds of paragraphs is loaded into the viewer
  - **When:** `<TipTapViewer>` renders
  - **Then:** All content renders; no truncation; no JS error (TipTap handles this natively)

---

### Hard Constraints

> Inherited from `CLAUDE.md — Coding Standards`. No exceptions.

- `'use client'` directive required on both `TipTapEditor` and `TipTapViewer` (TipTap uses browser APIs)
- All Tailwind classes must use logical properties — `ps-*`, `pe-*`, `text-start`, `text-end` only
- No `<iframe>` for any reason in these components
- `SUPABASE_SERVICE_ROLE_KEY` must not appear in client components — these components do not touch Supabase directly; data is passed via props

---

## 3. Automated Checks

> Run `/verify-spec 10-build-tiptap-rtl-editor` immediately after implementation.

| # | Check | Tool | Pass Condition |
| :- | :--- | :--- | :--- |
| 1 | TypeScript compilation | `npx tsc --noEmit` | Exit 0, zero type errors |
| 2 | RTL class audit | `/fix-rtl` on `src/components/editor/TipTapEditor.tsx` | 0 directional replacements needed |
| 3 | RTL class audit | `/fix-rtl` on `src/components/editor/TipTapViewer.tsx` | 0 directional replacements needed |

---

## 4. Definition of Done

- [ ] `npx tsc --noEmit` exits with 0 errors
- [ ] `<TipTapEditor>` mounts in the browser with RTL cursor behaviour for Urdu text
- [ ] `<TipTapViewer>` renders TipTap JSONB as formatted RTL prose (no raw JSON visible)
- [ ] `<TipTapViewer content={null}>` renders empty/fallback without crashing
- [ ] Both components carry `'use client'` directive
- [ ] Both components render correctly with `lang="ur"` (Noto Nastaliq, RTL)
- [ ] Both components render correctly with `lang="fa"` (Vazirmatn, RTL)
- [ ] `/fix-rtl` run on both new component files — 0 replacements needed
