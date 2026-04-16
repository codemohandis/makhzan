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
  admin: 'bg-purple-100 text-purple-800',
  manager: 'bg-blue-100 text-blue-800',
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
        <p className="mb-4 rounded border border-red-300 bg-red-50 px-4 py-2 text-sm text-red-700">
          {error}
        </p>
      )}
      <table className="min-w-full divide-y divide-gray-200 text-sm">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-4 py-3 text-start font-medium uppercase tracking-wider text-gray-500">
              Name
            </th>
            <th className="px-4 py-3 text-start font-medium uppercase tracking-wider text-gray-500">
              Email
            </th>
            <th className="px-4 py-3 text-start font-medium uppercase tracking-wider text-gray-500">
              Role
            </th>
            <th className="px-4 py-3 text-start font-medium uppercase tracking-wider text-gray-500">
              Joined
            </th>
            <th className="px-4 py-3 text-start font-medium uppercase tracking-wider text-gray-500">
              Change Role
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 bg-white">
          {users.map((user) => {
            const isSelf = user.id === currentUserId;
            const isLoading = isPending && pendingId === user.id;
            const currentRole = roles[user.id] ?? user.role;

            return (
              <tr key={user.id} className={isSelf ? 'bg-yellow-50' : undefined}>
                <td className="px-4 py-3 font-medium text-gray-900">
                  {user.full_name ?? '—'}
                  {isSelf && (
                    <span className="ms-2 text-xs text-gray-400">(you)</span>
                  )}
                </td>
                <td className="px-4 py-3 text-gray-600">{user.email}</td>
                <td className="px-4 py-3">
                  <span
                    className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${ROLE_BADGE[currentRole]}`}
                  >
                    {ROLE_LABELS[currentRole]}
                  </span>
                </td>
                <td className="px-4 py-3 text-gray-500">
                  {new Date(user.created_at).toLocaleDateString()}
                </td>
                <td className="px-4 py-3">
                  <select
                    value={currentRole}
                    disabled={isLoading}
                    onChange={(e) =>
                      handleRoleChange(user.id, e.target.value as UserRole)
                    }
                    className="rounded border border-gray-300 bg-white px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-50"
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
