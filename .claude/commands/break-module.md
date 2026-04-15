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
1. Read `docs/roadmap/srs.md` to extract all functional requirements (FR-XX) that belong to this module
2. Read `docs/roadmap/roadmap.md` — find the module's feature table to check what's already listed
3. Read `.claude/specs/break-modules/` (Glob `*.md`) — check for any existing specs that overlap

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

## Step 6 — Report
Print:
```
Module: <module_id> — <module_name>
Features Found: <count>
Already Specced: <count>
Needs Spec:     <count>
Next Step: Run /create-spec <next_step_num> <first-unspecced-feature>
```
