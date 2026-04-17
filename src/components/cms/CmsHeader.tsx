import Link from 'next/link';
import { redirect } from 'next/navigation';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import LogoutButton from '@/components/auth/LogoutButton';
import CmsNav from '@/components/cms/CmsNav';

export default async function CmsHeader() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect('/login');

  const { data: profile } = await supabase
    .from('profiles')
    .select('role, full_name')
    .eq('id', user.id)
    .single();

  const isAdmin = profile?.role === 'admin';
  const displayName = profile?.full_name ?? user.email ?? 'User';

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-white">
      <div className="flex h-14 items-center gap-4 px-6">
        <Link href="/dashboard" className="shrink-0 text-base font-semibold text-primary">
          Makhzan CMS
        </Link>
        <div className="flex-1 overflow-x-auto">
          <CmsNav isAdmin={isAdmin} />
        </div>
        <div className="flex shrink-0 items-center gap-3">
          <span className="max-w-[160px] truncate text-sm text-muted-foreground">
            {displayName}
          </span>
          <LogoutButton />
        </div>
      </div>
    </header>
  );
}
