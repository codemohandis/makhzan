---
description: Decompose a Makhzan module into its individual features with priorities and spec stubs
argument-hint: "Module ID e.g. M-03 or module name e.g. Articles"
allowed-tools: Read, Write, Glob
---

You are a Senior Systems Architect for the Makhzan project. Your goal is to decompose a single module into a precise, actionable list of features — ready to be handed to `/create-spec` one by one.

## Step 1 — Parse Input
From `$ARGUMENTS`, extract:
- `module_id`: e.g., "M-03" or derive from the name
- `module_name`: Title Case (e.g., "Articles")

## Step 2 — Research (Read Before Writing)
Read `docs/agent-context.md` — it contains the FR reference table, full spec registry (with statuses), and reusable patterns. Use it to identify which FR-XX items belong to this module and which features are already listed or specced. No other reads required before Step 3.

## Step 3 — Generate Feature Breakdown
For each feature in the module, output a table row with:

| Step | Feature ID | Feature Name | Priority | Depends On | Spec File |
|---|---|---|---|---|---|

**Priority rules:**
- **P0** = Blocks other features (must ship first)
- **P1** = Core user-facing feature
- **P2** = Enhancement or edge case

**Feature naming convention:** `<Verb> <Noun>` (e.g., "Upload PDF", "Render RTL Gallery")

## Step 4 — Per-Feature Summary
For each feature, print a brief block:

```
### F-<module_num>-<feature_num> — <Feature Name>
- **What:** 1-sentence description of the user-visible outcome
- **Why:** Why this feature is needed (links to FR-XX in SRS)
- **Files touched:** Likely files in src/ that will be created or modified
- **Acceptance signal:** One binary test that confirms it works
- **Spec command:** /create-spec <step_num> <feature-name>
```

## Step 5 — Update Roadmap
Append any new features discovered (not already in `docs/roadmap/roadmap.md`) to the correct module table in that file. Mark newly added rows with `[NEW]`.

## Step 5a — Save Break-Module File
Write the full feature breakdown (Steps 3 + 4 output) to:
`.claude/specs/break-modules/<module_id_lowercase>-<module_name_slug>.md`

Example: `M-06 · Database` → `.claude/specs/break-modules/M-06-database.md`

This file is the persistent record of the decomposition. Future `/break-module` runs on the same module should overwrite it.

## Step 5b — Regenerate Agent Context
Update `docs/agent-context.md` to reflect the current state of the project:
1. **Spec Registry** — sync all rows from `docs/roadmap/roadmap.md` (status + spec file path)
2. **DB Schema Snapshot** — if new migrations exist in `supabase/migrations/`, update the table list to reflect actual applied schema
3. **Reusable Patterns** — add any new utilities, hooks, or components discovered during this break-module run

Do not rewrite sections that haven't changed. This file is the single read target for `/create-spec` Step 3.

## Step 6 — Report
Print:
```
Module: <module_id> — <module_name>
Features Found: <count>
Already Specced: <count>
Needs Spec:     <count>
Next Step: Run /create-spec <next_step_num> <first-unspecced-feature>
```
