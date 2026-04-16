import { redirect, notFound } from 'next/navigation';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { getUserById } from '@/lib/actions/users';

interface UserDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function UserDetailPage({ params }: UserDetailPageProps) {
  const { id } = await params;

  const supabase = await createSupabaseServerClient();
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

  const result = await getUserById(id);

  if ('error' in result) notFound();

  const { data: profile } = result;

  return (
    <main className="px-6 py-8">
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-gray-900">
          {profile.full_name ?? 'Unnamed User'}
        </h1>
        <p className="mt-1 text-sm text-gray-500">{profile.email}</p>
      </div>

      <dl className="divide-y divide-gray-100 rounded-lg border border-gray-200 bg-white shadow-sm">
        <div className="flex gap-4 px-6 py-4">
          <dt className="w-32 shrink-0 text-sm font-medium text-gray-500">Full name</dt>
          <dd className="text-sm text-gray-900">{profile.full_name ?? '—'}</dd>
        </div>
        <div className="flex gap-4 px-6 py-4">
          <dt className="w-32 shrink-0 text-sm font-medium text-gray-500">Email</dt>
          <dd className="text-sm text-gray-900">{profile.email}</dd>
        </div>
        <div className="flex gap-4 px-6 py-4">
          <dt className="w-32 shrink-0 text-sm font-medium text-gray-500">Role</dt>
          <dd className="text-sm text-gray-900 capitalize">{profile.role}</dd>
        </div>
        <div className="flex gap-4 px-6 py-4">
          <dt className="w-32 shrink-0 text-sm font-medium text-gray-500">Joined</dt>
          <dd className="text-sm text-gray-900">
            {new Date(profile.created_at).toLocaleDateString()}
          </dd>
        </div>
      </dl>
    </main>
  );
}
