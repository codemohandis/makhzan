'use client';

import { signOut } from '@/lib/actions/auth';
import { LogOut } from 'lucide-react';

export default function LogoutButton() {
  return (
    <form action={signOut}>
      <button
        type="submit"
        className="inline-flex items-center gap-2 rounded-md border border-border px-3 py-1.5 text-sm font-medium text-foreground transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <LogOut className="h-4 w-4" />
        Sign out
      </button>
    </form>
  );
}
