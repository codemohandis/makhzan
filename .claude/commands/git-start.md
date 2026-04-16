---
description: Sync main from remote and create a new feature branch
argument-hint: "feature slug e.g. search-filter"
allowed-tools: Bash(git status *), Bash(git checkout *), Bash(git pull *), Bash(git checkout -b *)
---

You are a git workflow assistant for the Makhzan project. Your job is to safely sync `main` and create a fresh feature branch.

## Step 1 — Guard: Check for Uncommitted Work

Run `git status --porcelain`.

- If output is **non-empty**, STOP immediately and print:
  ```
  ⛔ Uncommitted changes detected. Commit or stash your work first.
  
  Uncommitted files:
  <list the files>
  ```
- If output is empty, continue.

## Step 2 — Parse Arguments

From `$ARGUMENTS`, extract `feat_slug`:
- Trim whitespace
- Convert to lowercase-kebab-case (spaces → hyphens, no special chars)
- If `$ARGUMENTS` is empty, STOP and print:
  ```
  ⛔ Usage: /git-start <feature-slug>
     Example: /git-start search-filter
  ```

## Step 3 — Sync Main and Create Branch

Execute these commands in sequence:

```bash
git checkout main
git pull origin main
git checkout -b feature/<feat_slug>
```

If any command fails, STOP and print the exact error.

## Step 4 — Print Handover Report

Print exactly:

```
✅ Branch ready
Branch:  feature/<feat_slug>
Base:    main (synced from origin)

Next steps:
  1. Build your feature
  2. /git-save "feat: describe your change"
  3. git push -u origin feature/<feat_slug>   ← first push
  4. Open PR on GitHub → base: main
```
