'use client';

import { useTransition, useState } from 'react';
import { setUserRole } from '@/lib/actions/users';
import type { ProfileWithEmail, UserRole } from '@/types';

interface UserTableProps {
  users: ProfileWithEmail[];
  currentUserId: string;
}

const ROLE_LABELS: Record<UserRole, string> = {
  admin: 'Admin',
  manager: 'Manager',
};

const ROLE_BADGE: Record<UserRole, string> = {
  admin: 'bg-primary/10 text-primary',
  manager: 'bg-accent/10 text-accent',
};

export default function UserTable({ users, currentUserId }: UserTableProps) {
  // Controlled role state so badges update immediately on success — no reload needed.
  const [roles, setRoles] = useState<Record<string, UserRole>>(
    () => Object.fromEntries(users.map((u) => [u.id, u.role]))
  );
  const [isPending, startTransition] = useTransition();
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  function buildConfirmMessage(
    isSelf: boolean,
    isLastAdmin: boolean,
    newRole: UserRole
  ): string {
    if (isSelf && newRole === 'manager' && isLastAdmin) {
      return (
        'You are the last admin — demoting yourself will lock admin features for all users. ' +
        'Are you sure you want to continue?'
      );
    }
    if (isSelf && newRole === 'manager') {
      return 'You are demoting yourself. You will lose admin access on your next request. Continue?';
    }
    return `Change this user's role to ${ROLE_LABELS[newRole]}?`;
  }

  function handleRoleChange(userId: string, newRole: UserRole) {
    const isSelf = userId === currentUserId;
    const currentAdminCount = Object.values(roles).filter((r) => r === 'admin').length;
    const isLastAdmin = isSelf && roles[userId] === 'admin' && currentAdminCount === 1;

    const message = buildConfirmMessage(isSelf, isLastAdmin, newRole);
    if (!window.confirm(message)) {
      // Reset the select back to the current role without mutating state.
      return;
    }

    setError(null);
    setPendingId(userId);
    startTransition(async () => {
      const result = await setUserRole(userId, newRole);
      if ('error' in result) {
        setError(result.error);
      } else {
        // Optimistic update confirmed — update badge without page reload.
        setRoles((prev) => ({ ...prev, [userId]: newRole }));
      }
      setPendingId(null);
    });
  }

  return (
    <div className="overflow-x-auto">
      {error && (
        <p className="mb-4 rounded-lg border border-destructive/20 bg-destructive/10 px-4 py-2 text-sm text-destructive">
          {error}
        </p>
      )}
      <table className="min-w-full divide-y divide-border text-sm">
        <thead className="bg-muted">
          <tr>
            <th className="px-4 py-3 text-start text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Name
            </th>
            <th className="px-4 py-3 text-start text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Email
            </th>
            <th className="px-4 py-3 text-start text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Role
            </th>
            <th className="px-4 py-3 text-start text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Joined
            </th>
            <th className="px-4 py-3 text-start text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Change Role
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border bg-card">
          {users.map((user) => {
            const isSelf = user.id === currentUserId;
            const isLoading = isPending && pendingId === user.id;
            const currentRole = roles[user.id] ?? user.role;

            return (
              <tr key={user.id} className={isSelf ? 'bg-primary/5' : undefined}>
                <td className="px-4 py-3 font-medium text-foreground">
                  {user.full_name ?? '—'}
                  {isSelf && (
                    <span className="ms-2 text-xs text-muted-foreground">(you)</span>
                  )}
                </td>
                <td className="px-4 py-3 text-muted-foreground">{user.email}</td>
                <td className="px-4 py-3">
                  <span
                    className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${ROLE_BADGE[currentRole]}`}
                  >
                    {ROLE_LABELS[currentRole]}
                  </span>
                </td>
                <td className="px-4 py-3 tabular-nums text-muted-foreground">
                  {new Date(user.created_at).toLocaleDateString()}
                </td>
                <td className="px-4 py-3">
                  <select
                    value={currentRole}
                    disabled={isLoading}
                    onChange={(e) =>
                      handleRoleChange(user.id, e.target.value as UserRole)
                    }
                    className="rounded-md border border-border bg-background px-2 py-1 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50"
                    aria-label={`Change role for ${user.full_name ?? user.email}`}
                  >
                    <option value="manager">Manager</option>
                    <option value="admin">Admin</option>
                  </select>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
