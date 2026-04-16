import Link from 'next/link';
import { redirect, notFound } from 'next/navigation';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { getUserById } from '@/lib/actions/users';
import { ChevronLeft } from 'lucide-react';

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
        <Link
          href="/dashboard/users"
          className="mb-4 inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ChevronLeft className="h-4 w-4" />
          Back to Users
        </Link>
        <h1 className="text-xl font-semibold text-foreground">
          {profile.full_name ?? 'Unnamed User'}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">{profile.email}</p>
      </div>

      <dl className="divide-y divide-border overflow-hidden rounded-lg border border-border bg-card shadow-sm">
        <div className="flex gap-4 px-6 py-4">
          <dt className="w-32 shrink-0 text-sm font-medium text-muted-foreground">Full name</dt>
          <dd className="text-sm text-foreground">{profile.full_name ?? '—'}</dd>
        </div>
        <div className="flex gap-4 px-6 py-4">
          <dt className="w-32 shrink-0 text-sm font-medium text-muted-foreground">Email</dt>
          <dd className="text-sm text-foreground">{profile.email}</dd>
        </div>
        <div className="flex gap-4 px-6 py-4">
          <dt className="w-32 shrink-0 text-sm font-medium text-muted-foreground">Role</dt>
          <dd className="text-sm text-foreground capitalize">{profile.role}</dd>
        </div>
        <div className="flex gap-4 px-6 py-4">
          <dt className="w-32 shrink-0 text-sm font-medium text-muted-foreground">Joined</dt>
          <dd className="tabular-nums text-sm text-foreground">
            {new Date(profile.created_at).toLocaleDateString()}
          </dd>
        </div>
      </dl>
    </main>
  );
}
