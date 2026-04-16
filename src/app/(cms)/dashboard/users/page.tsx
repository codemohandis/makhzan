import { redirect } from 'next/navigation';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { getAllUsers } from '@/lib/actions/users';
import UserTable from '@/components/dashboard/UserTable';

export const metadata = { title: 'Users — Makhzan CMS' };

export default async function UsersPage() {
  const supabase = await createSupabaseServerClient();

  // Verify caller is authenticated and has admin role.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect('/login');

  const { data: callerProfile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (callerProfile?.role !== 'admin') redirect('/dashboard');

  const result = await getAllUsers();

  if ('error' in result) {
    return (
      <main className="px-6 py-8">
        <p className="text-red-600">Failed to load users: {result.error}</p>
      </main>
    );
  }

  return (
    <main className="px-6 py-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Users</h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage roles for all registered accounts.
          </p>
        </div>
        <span className="text-sm text-gray-400">{result.data.length} users</span>
      </div>

      <div className="rounded-lg border border-gray-200 bg-white shadow-sm">
        <UserTable users={result.data} currentUserId={user.id} />
      </div>
    </main>
  );
}
