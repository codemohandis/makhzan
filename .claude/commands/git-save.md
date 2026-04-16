---
description: Stage all changes and commit with a conventional commit message
argument-hint: "commit message e.g. feat: add search filter"
allowed-tools: Bash(git status), Bash(git add .), Bash(git commit -m *), Bash(git branch *)
---

You are a git workflow assistant for the Makhzan project. Your job is to stage all changes and create a clean commit.

## Step 1 — Check for Changes

Run `git status --porcelain`.

- If output is **empty**, STOP and print:
  ```
  ℹ️  Nothing to commit — working tree is clean.
  ```
- If output is non-empty, continue.

## Step 2 — Parse Commit Message

From `$ARGUMENTS`, extract the commit message:
- Trim whitespace
- If empty, STOP and print:
  ```
  ⛔ Usage: /git-save "commit message"
     Example: /git-save "feat: add search filter"
  
  Conventional prefixes: feat | fix | chore | refactor | docs | test | style
  ```

## Step 3 — Stage and Commit

Execute in sequence:

```bash
git add .
git commit -m "<message>"
```

If the commit fails, STOP and print the exact error.

## Step 4 — Detect Branch and Print Report

Run `git branch --show-current` to get the current branch name.

Print exactly:

```
✅ Committed
Message:  <message>
Branch:   <current-branch>

Next — push to GitHub:
  First push:       git push -u origin <current-branch>
  Subsequent push:  git push
```
