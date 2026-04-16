# Spec: Role Elevation

## 1. Context & User Story (Human Layer)
- **SRS Reference:** FR-01 (profiles default role `manager`), FR-06 (Admin sees full controls)
- **Overview:** New users are created with role `manager` by default. An Admin must be able to elevate any Manager to `admin` (or demote back to `manager`) from a dashboard Users page. This is the only mechanism to grant admin access after initial setup.
- **User Story:** "As an Admin, I want to view all registered users and change their role so that I can grant or revoke admin privileges without touching the database directly."
- **Depends on:** Step 06 — Supabase Auth Setup, Step 07 — Profiles Table + Auto-Create Trigger.

---

## 2. Technical Blueprint (Agent Layer)

### Interface & Contract

| Interface | Method | Path / Action | Access | Behaviour |
| :--- | :--- | :--- | :--- | :--- |
| Page | GET | `/dashboard/users` | Admin only | Lists all profiles (name, email, role, joined date) with role badge and change control |
| Server Action | POST | `setUserRole(userId, role)` | Admin only | Validates caller is admin, uses service-role client to update `profiles.role`, returns updated row |
| Redirect Guard | Middleware | `/dashboard/users` | Admin only | Non-admin authenticated users redirected to `/dashboard`; unauthenticated to `/login` |

### Execution Plan

- **Database:** Schema stable — `profiles.role user_role (admin|manager)` already defined. No new columns or migrations needed.
- **Modify:**
  - `src/middleware.ts` — add `/dashboard/users` to admin-only route list (if middleware exists; otherwise note to implement route guard in the page itself via server-side auth check)
- **Create:**
  - `src/lib/actions/users.ts` — `setUserRole(userId: string, role: 'admin' | 'manager')` server action with:
    1. Verify caller session via `createServerClient`
    2. Fetch caller's `profiles.role`; return `{ error: 'Forbidden', status: 403 }` if not `admin`
    3. Use `createServiceRoleClient` (server-only, never imported client-side) to update target user's `profiles.role`
    4. Return `{ data: updatedProfile }` on success
  - `src/app/dashboard/users/page.tsx` — Server Component; fetches all profiles using service-role client after verifying caller is admin; renders `<UserTable />`
  - `src/components/dashboard/UserTable.tsx` — Client Component; displays users table with inline role selector and confirm dialog before submission

### RTL Checklist
- [ ] All layout classes use logical properties (`ps-*`, `pe-*`, `ms-*`, `me-*`, `text-start`, `text-end`)
- [ ] No `left-*`, `right-*`, `text-left`, `text-right` in new files
- [ ] Component tested with `lang="ur"` and `lang="fa"` on `<html>`

### Logic Scenarios (Gherkin-style)

- **Scenario:** Success — Admin elevates a Manager to Admin
  - **Given:** Caller has role `admin`, target user has role `manager`
  - **When:** `setUserRole(targetId, 'admin')` is called
  - **Then:** `profiles.role` for the target is updated to `admin`; server action returns `{ data: { id, role: 'admin' } }`; UI reflects new badge without page reload

- **Scenario:** Failure — Manager attempts to elevate another user
  - **Given:** Caller has role `manager`
  - **When:** `setUserRole(anyId, 'admin')` is called
  - **Then:** Server action returns `{ error: 'Forbidden', status: 403 }`; `profiles` table is untouched

- **Scenario:** Success — Admin demotes themselves (edge — not blocked, but UI should warn)
  - **Given:** Caller has role `admin`, `targetId === caller.id`
  - **When:** `setUserRole(callerId, 'manager')` is called
  - **Then:** Role is updated; caller's next server request will see `manager` role; UI should show a confirm dialog with a self-demotion warning before submitting

### Edge Cases

- **Edge:** Target user ID does not exist in `profiles`
  - **Given:** `userId` is a valid UUID but has no corresponding row in `profiles`
  - **When:** `setUserRole` is called with that ID
  - **Then:** Service-role update affects 0 rows; action returns `{ error: 'User not found', status: 404 }`; no crash, no silent no-op

- **Edge:** Invalid role enum value submitted
  - **Given:** Caller crafts a request with `role = 'superadmin'` or any value outside `('admin', 'manager')`
  - **When:** `setUserRole` is called
  - **Then:** TypeScript union type `'admin' | 'manager'` rejects at compile time; runtime guard throws before DB call returns `{ error: 'Invalid role', status: 400 }`

- **Edge:** Concurrent role changes (race condition)
  - **Given:** Two admin sessions simultaneously call `setUserRole` for the same user with different roles
  - **When:** Both requests land near-simultaneously
  - **Then:** Postgres `UPDATE` is atomic; last write wins; both responses return the role they wrote; no partial or corrupted state

- **Edge:** Last admin demotes themselves, leaving no admins
  - **Given:** Only one user has `role = 'admin'`
  - **When:** That user calls `setUserRole(self.id, 'manager')`
  - **Then:** Action succeeds (no DB-level block); UI displays a warning: "You are the last admin — demoting yourself will lock admin features." Self-demotion is not prevented at DB level, but the confirm dialog makes it explicit.

### Hard Constraints
> Inherited from `CLAUDE.md — Coding Standards`. No exceptions.
- `SUPABASE_SERVICE_ROLE_KEY` used only in a server-only file (never imported by a Client Component)
- Admin role check performed before every `profiles` mutation
- All UI classes must use logical CSS properties (RTL-first)

---

## 3. Automated Checks
> Run `/verify-spec 09-role-elevation` immediately after implementation.

| # | Check | Tool | Pass Condition |
| :- | :--- | :--- | :--- |
| 1 | TypeScript compilation | `npx tsc --noEmit` | Exit 0, zero type errors |
| 2 | RTL class audit | `/fix-rtl` on `UserTable.tsx` and `users/page.tsx` | 0 directional replacements needed |
| 3 | Role guard audit | `/secure-action` on `src/lib/actions/users.ts` | Admin role check confirmed present |

---

## 4. Definition of Done
- [ ] `npx tsc --noEmit` exits with 0 errors
- [ ] Manager JWT calling `setUserRole` receives `{ error: 'Forbidden', status: 403 }`
- [ ] Admin JWT calling `setUserRole('valid-id', 'admin')` returns updated profile
- [ ] `setUserRole` with unknown `userId` returns `{ error: 'User not found', status: 404 }`
- [ ] `/dashboard/users` page redirects unauthenticated users to `/login`
- [ ] `/dashboard/users` page redirects Manager-role users to `/dashboard`
- [ ] `SUPABASE_SERVICE_ROLE_KEY` is never imported in any Client Component (`grep` confirms)
- [ ] `/fix-rtl` run on `UserTable.tsx` and `users/page.tsx` — 0 replacements needed
- [ ] `/secure-action` run on `src/lib/actions/users.ts` — role check confirmed present
- [ ] UI renders correctly with `lang="ur"` (Noto Nastaliq, RTL layout)
- [ ] UI renders correctly with `lang="fa"` (Vazirmatn, RTL layout)
