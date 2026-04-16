import Link from 'next/link';
import { redirect } from 'next/navigation';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import LogoutButton from '@/components/auth/LogoutButton';

export default async function DashboardPage() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect('/login');

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  const isAdmin = profile?.role === 'admin';

  return (
    <main>
      <header className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
        <h1 className="text-lg font-semibold text-gray-900">Makhzan</h1>
        <LogoutButton />
      </header>
      <section className="px-6 py-8">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {isAdmin && (
            <Link
              href="/dashboard/users"
              className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm transition hover:border-purple-300 hover:shadow-md"
            >
              <p className="text-sm font-medium text-purple-700">Admin</p>
              <p className="mt-1 text-lg font-semibold text-gray-900">User Management</p>
              <p className="mt-1 text-sm text-gray-500">
                View all accounts and change roles.
              </p>
            </Link>
          )}
        </div>
      </section>
    </main>
  );
}
