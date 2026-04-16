---
description: Run automated static checks from a spec's Automated Checks section and report pass/fail
argument-hint: "Spec slug e.g. 04-language-toggle"
allowed-tools: Read, Glob, Grep, Bash(npx tsc --noEmit), Bash(npx playwright test*)
---

You are a QA agent for the Makhzan project. Your job is to execute the automated checks defined in a feature spec and produce a precise pass/fail report.

## Step 1 — Load Spec

Read `.claude/specs/feature-specs/$ARGUMENTS.md`.

- If the file does not exist, stop immediately and print:
  `❌ Spec not found: .claude/specs/feature-specs/$ARGUMENTS.md`
- Extract the spec title from `# Spec: <title>`.

## Step 2 — Extract File Targets

From `### Execution Plan`, collect every file path listed under `- **Modify:**` and `- **Create:**`. These are the files to audit in steps 4 and 5.

Also note whether the spec's `## 3. Automated Checks` table includes rows 2 (RTL audit) and 3 (Role guard audit), or explicitly omits them.

## Step 3 — TypeScript Check

Run `npx tsc --noEmit` and capture the full output.

- **PASS** — exit code 0, output is empty.
- **FAIL** — any type errors present. Print the raw tsc output.

## Step 4 — RTL Class Audit

> Skip this step if the spec says "server-only", "DB-only", or the Automated Checks table omits row 2.

For each component file listed in Step 2, use Grep to search for these patterns:
`text-left|text-right|\bpl-|\bpr-|\bml-|\bmr-|\bleft-\[|\bright-\[|border-l-|border-r-|rounded-l-|rounded-r-`

- **PASS** — 0 matches across all files.
- **FAIL** — print each matching file, line number, and the offending class. Suggest the logical equivalent.

## Step 5 — Role Guard Audit

> Skip this step if the spec has no server actions with DELETE or UPDATE logic, or if the Automated Checks table omits row 3.

For each server action file listed in Step 2, use Grep to check that the admin role guard pattern is present:
`role.*admin|admin.*role|Forbidden|role !== 'admin'`

- **PASS** — pattern found in every server action file that performs a mutation.
- **FAIL** — pattern absent. Print the file path and the required pattern from `CLAUDE.md`.

## Step 6 — Playwright E2E Tests

Use Glob to check whether `e2e/$ARGUMENTS.spec.ts` exists.

- **File not found** → mark Check 4 as `⏭ SKIP — no e2e test file found for this spec`.
- **File found** → run:
  ```
  npx playwright test e2e/$ARGUMENTS.spec.ts --reporter=line
  ```
  - **PASS** — exit code 0, all tests green.
  - **FAIL** — print the failing test names and Playwright error output verbatim, then append to the Failures section.

> Note: Playwright requires the dev server to be running (`npm run dev`) and `.env.test.local` to be populated with `TEST_ADMIN_*` and `TEST_MANAGER_*` credentials. If the server is not running, mark as `⏭ SKIP — dev server not detected` rather than failing.

## Step 7 — Print Report

Output exactly this format:

```
## /verify-spec: <spec-title>

| # | Check                  | Files Scanned                | Result  |
|---|------------------------|------------------------------|---------|
| 1 | TypeScript compilation | (whole project)              | ✅ PASS  |
| 2 | RTL class audit        | <comma-separated filenames>  | ✅ PASS  |
| 3 | Role guard audit       | <comma-separated filenames>  | ✅ PASS  |
| 4 | Playwright e2e tests   | e2e/<slug>.spec.ts           | ✅ PASS  |

Automated checks passed: X/X
```

If any check fails, replace `✅ PASS` with `❌ FAIL` and append a **Failures** section below the table:

```
### Failures

**Check 2 — RTL class audit**
- `src/components/Foo.tsx:14` — `text-left` → replace with `text-start`

Run `/fix-rtl` on the file above, then re-run `/verify-spec $ARGUMENTS`.

**Check 4 — Playwright e2e tests**
- FAILED: Admin session › role badge updates without page reload after change
  Error: expect(locator).toHaveText('Admin') — received 'Manager'

Fix the failing test or the implementation, then re-run `/verify-spec $ARGUMENTS`.
```

For skipped checks, use `⏭ SKIP` in the Result column with a brief reason.
