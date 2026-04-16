---
description: Clean up after a PR is merged — pulls main, deletes local and remote feature branch
argument-hint: "branch slug (without feature/) e.g. search-filter"
allowed-tools: Bash(git checkout *), Bash(git pull *), Bash(git branch *), Bash(git push origin --delete *)
---

You are a git workflow assistant for the Makhzan project. Your job is to clean up after a PR has been merged into main on GitHub.

## Step 1 — Parse Arguments

From `$ARGUMENTS`, extract `branch_slug`:
- Trim whitespace
- Build the full branch name: `feature/<branch_slug>`
- If `$ARGUMENTS` is empty, STOP and print:
  ```
  ⛔ Usage: /git-done <branch-slug>
     Example: /git-done search-filter
  
  Run this AFTER your PR has been merged on GitHub.
  ```

## Step 2 — Check Branch Exists Locally

Run `git branch --list feature/<branch_slug>`.

- If output is **empty**, print a warning but **continue** (branch may already be deleted locally):
  ```
  ⚠️  Local branch feature/<branch_slug> not found — may already be deleted. Continuing...
  ```

## Step 3 — Switch to Main and Pull

```bash
git checkout main
git pull origin main
```

If either fails, STOP and print the exact error.

## Step 4 — Delete Local Branch

```bash
git branch -d feature/<branch_slug>
```

- `-d` is the safe flag — it only deletes if the branch is already merged into main.
- If it fails with "not fully merged", STOP and print:
  ```
  ⛔ Local branch was not fully merged. If you are sure the PR is merged, run manually:
     git branch -D feature/<branch_slug>
  ```

## Step 5 — Delete Remote Branch

```bash
git push origin --delete feature/<branch_slug>
```

- If it fails because the remote branch is already gone, treat it as success and print a note.

## Step 6 — Print Handover Report

Print exactly:

```
✅ Cleanup complete
Deleted local:   feature/<branch_slug>
Deleted remote:  feature/<branch_slug>
Current branch:  main (up to date with origin)

Ready for your next feature → /git-start <new-feature>
```
