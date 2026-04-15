# GitHub Workflow Guide

## 1. One-Time Setup

```bash
# Initialize local repo
git init

# Create and switch to main branch
git checkout -b main

# Link to GitHub remote
git remote add origin https://github.com/codemohandis/makhzan
```

---

## 2. Before Starting Any Feature

```bash
# Make sure you're on main and it's clean
git checkout main
git pull origin main
```

---

## 3. Start a Feature Branch

```bash
# Create and switch to a new branch
git checkout -b feature/nextjs-scaffold
```

---

## 4. During Development (save your work)

```bash
# See what changed
git status

# Stage all changed files
git add .

# Commit with a message
git commit -m "feat: scaffold Next.js 15 App Router"
```

---

## 5. Push Branch to GitHub

```bash
# First push (sets upstream)
git push -u origin feature/nextjs-scaffold

# Subsequent pushes
git push
```

---

## 6. After Feature is Merged — Clean Up

```bash
# Switch back to main
git checkout main

# Pull the merged changes
git pull origin main

# Delete the local branch
git branch -d feature/nextjs-scaffold

# Delete the remote branch
git push origin --delete feature/nextjs-scaffold
```

---

## Quick Reference Card

| Task | Command |
|---|---|
| New feature branch | `git checkout -b feature/<name>` |
| Save progress | `git add . && git commit -m "message"` |
| Push to GitHub | `git push -u origin feature/<name>` |
| Switch branch | `git checkout <branch-name>` |
| List all branches | `git branch -a` |
| Delete local branch | `git branch -d feature/<name>` |
| Delete remote branch | `git push origin --delete feature/<name>` |
| Force delete local (unmerged) | `git branch -D feature/<name>` |

> Use `-d` (safe) when the branch is already merged. Use `-D` (force) only if you want to discard an unmerged branch.
