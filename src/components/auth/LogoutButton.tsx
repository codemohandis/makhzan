'use client';

import { signOut } from '@/lib/actions/auth';

export default function LogoutButton() {
  return (
    <form action={signOut}>
      <button
        type="submit"
        className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-300/50 transition-colors"
      >
        خروج
      </button>
    </form>
  );
}
