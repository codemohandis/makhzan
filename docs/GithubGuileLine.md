# GitHub Workflow Guide

> A branch is NOT a separate repo. It is a separate line of work inside the same repo.
> You can see all branches at: https://github.com/codemohandis/makhzan (branch dropdown)

---

## 1. One-Time Setup (already done)

```bash
git init
git checkout -b main
git remote add origin https://github.com/codemohandis/makhzan

# If GitHub created a README on remote main, sync it first:
git pull origin main --allow-unrelated-histories
git push origin main
```

---

## 2. Before Starting Any Feature

```bash
git checkout main
git pull origin main        # always sync main before branching
```
as
---

## 3. Start a Feature Branch

```bash
# Replace <name> with the feature slug, e.g. tailwind-rtl
git checkout -b feature/<name>
```

---

## 4. During Development (save your work)

```bash
git status                              # see what changed
git add .                               # stage all changes
git commit -m "feat: describe change"   # commit
```

---

## 5. Push Branch to GitHub

```bash
# First push — sets upstream tracking
git push -u origin feature/<name>

# All later pushes (just this)
git push
```

---

## 6. Merge via Pull Request on GitHub (recommended)

1. Go to https://github.com/codemohandis/makhzan
2. GitHub will show a banner: **"Compare & pull request"** — click it
3. Set base: `main` ← compare: `feature/<name>`
4. Click **"Merge pull request"**

---

## 7. After PR is Merged — Clean Up Locally

```bash
git checkout main
git pull origin main                          # pull the merged changes down
git branch -d feature/<name>                  # delete local branch (safe)
git push origin --delete feature/<name>       # delete remote branch
```

---

## Quick Reference Card

| Task | Command |
|---|---|
| New feature branch | `git checkout -b feature/<name>` |
| Save progress | `git add . && git commit -m "message"` |
| First push to GitHub | `git push -u origin feature/<name>` |
| Subsequent pushes | `git push` |
| Switch branch | `git checkout <branch-name>` |
| List all branches | `git branch -a` |
| Pull remote changes | `git pull origin main` |
| Delete local branch | `git branch -d feature/<name>` |
| Delete remote branch | `git push origin --delete feature/<name>` |
| Force delete (unmerged) | `git branch -D feature/<name>` |

> Use `-d` (safe) when branch is already merged into main.
> Use `-D` (force) only to discard an unmerged branch intentionally.
