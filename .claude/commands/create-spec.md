---
description: Create a hybrid context/blueprint spec and git branch for a new Makhzan feature
argument-hint: "Step number and feature name e.g. 10 tiptap-rtl-editor"
allowed-tools: Read, Write, Glob, Bash(git:*)
---

You are a Senior Systems Architect for the Makhzan project (Next.js 15 + Supabase + Tailwind RTL). Your goal is to initialize a feature development environment by creating a "Contract of Truth" (the Spec) and a clean git workspace.

Follow these steps with precision.

## Step 1 — Integrity & Argument Parsing
1. Execute `git status --porcelain`. If output is NOT empty, STOP and notify the user to commit or stash changes first.
2. From `$ARGUMENTS`, extract:
   - `step_num`: Zero-pad to 2 digits (e.g., 3 → "03").
   - `feat_title`: Title Case (e.g., "TipTap RTL Editor").
   - `feat_slug`: lowercase-kebab-case, max 40 chars (e.g., `tiptap-rtl-editor`).
   - `branch_name`: `feature/<feat_slug>`.

**Collision Logic:** If `git branch --list <branch_name>` is non-empty, append `-v2`, `-v3`, etc.

## Step 2 — Workspace Synchronization
Execute in sequence:
```bash
git checkout main
git pull origin main
git checkout -b <branch_name>
```

## Step 3 — Context Research
Read `docs/agent-context.md` — it contains the FR reference table, DB schema snapshot, spec registry, and reusable patterns. This replaces reading `srs.md`, `roadmap.md`, migrations, and existing specs individually.

- If this feature's step is already marked `[x]` in the registry, STOP and warn the user.
- Only read additional source files (e.g. a specific file in `src/lib/`) if you need implementation detail specific to this feature that the context file does not cover.

## Step 4 — Generate Hybrid Spec
Create `.claude/specs/feature-specs/<step_num>-<feat_slug>.md` with this exact structure:

---
# Spec: <feat_title>

## 1. Context & User Story (Human Layer)
- **SRS Reference:** FR-XX
- **Overview:** 1-2 sentences on the functional goal.
- **User Story:** "As a [Admin/Manager/Public User], I want to [action] so that [value]."
- **Depends on:** List previous Step IDs (e.g., Step 06 — Supabase Auth).

## 2. Technical Blueprint (Agent Layer)

### Interface & Contract
| Interface | Method | Path / Action | Access | Behaviour |
| :--- | :--- | :--- | :--- | :--- |
| Page | GET | `/dashboard/[module]` | Auth (Admin\|Manager) | Lists all items with status badge |
| Server Action | POST | `createArticle(data)` | Auth | Inserts row, returns new ID |
| Server Action | DELETE | `deleteArticle(id)` | Admin only | Checks role, then deletes |

### Execution Plan
- **Database:** List SQL changes (new columns, indexes) or write "Schema stable — no changes".
- **Modify:** List existing files and the specific logic to add/change.
  - `src/lib/actions/articles.ts` — add `deleteArticle` with admin role guard
- **Create:** List new files and their purpose.
  - `src/components/editor/TipTapEditor.tsx` — RTL-enabled rich text editor component

### RTL Checklist
> Skip this section for DB migrations and server-only features (no UI files created).

- [ ] All layout classes use logical properties (`ps-*`, `pe-*`, `ms-*`, `me-*`, `text-start`, `text-end`)
- [ ] No `left-*`, `right-*`, `text-left`, `text-right` in new files
- [ ] Component tested with `lang="ur"` and `lang="fa"` on `<html>`

### Logic Scenarios (Gherkin-style)
- **Scenario:** Success — Admin deletes an article
  - **Given:** User has role `admin` and is authenticated
  - **When:** `deleteArticle(id)` is called
  - **Then:** Row is removed from `articles` table; RLS policy allows the operation

- **Scenario:** Failure — Manager attempts delete
  - **Given:** User has role `manager`
  - **When:** `deleteArticle(id)` is called
  - **Then:** Server action returns `{ error: 'Forbidden', status: 403 }`; DB is untouched

### Hard Constraints
> Inherited from `CLAUDE.md — Coding Standards`. No exceptions.

## 3. Definition of Done
List 5-8 binary, testable requirements:
- [ ] `npx tsc --noEmit` exits with 0 errors
- [ ] Manager JWT calling the delete action receives HTTP 403
- [ ] Admin JWT calling the delete action returns success
- [ ] Supabase RLS policy for this table is enabled and verified in Dashboard
- [ ] Component renders correctly with `lang="ur"` (Noto Nastaliq font, RTL layout)
- [ ] Component renders correctly with `lang="fa"` (Vazirmatn font, RTL layout)
- [ ] `/fix-rtl` run on all new components — 0 replacements needed
- [ ] `/secure-action` run on all server actions — role checks confirmed present
---

## Step 5 — Save & Update Roadmap
1. Write the spec file to `.claude/specs/feature-specs/<step_num>-<feat_slug>.md`
2. In `docs/roadmap/roadmap.md`, find the row for this feature and update its status to `[~]` (In Progress)
3. Update the Progress Tracker table in `docs/roadmap/roadmap.md` accordingly

## Step 6 — Handover Report
Print exactly:
```
✅ Workspace Initialized
Branch:    <branch_name>
Spec:      .claude/specs/feature-specs/<step_num>-<feat_slug>.md
SRS Ref:   FR-XX — <requirement title>
Status:    Sync'd with main. Roadmap updated to [~] In Progress.
Next:      Implement using the blueprint in the spec above.
```
