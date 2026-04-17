import Link from 'next/link';
import { redirect } from 'next/navigation';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { Shield, FileText, BookOpen, Play } from 'lucide-react';

const contentCards = [
  {
    href: '/dashboard/articles',
    icon: FileText,
    label: 'Content',
    title: 'Articles',
    description: 'Write and manage RTL articles in Urdu and Farsi.',
  },
  {
    href: '/dashboard/books',
    icon: BookOpen,
    label: 'Content',
    title: 'Books',
    description: 'Upload PDF books to the library.',
  },
  {
    href: '/dashboard/videos',
    icon: Play,
    label: 'Content',
    title: 'Videos',
    description: 'Add YouTube videos to the gallery.',
  },
];

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
    <main className="px-6 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-foreground">Dashboard</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Welcome back{user.email ? `, ${user.email}` : ''}.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {contentCards.map(({ href, icon: Icon, label, title, description }) => (
          <Link
            key={href}
            href={href}
            className="group rounded-lg border border-border bg-card p-5 shadow-sm transition-colors hover:border-primary/30 hover:bg-muted/40"
          >
            <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-md bg-primary/10">
              <Icon className="h-5 w-5 text-primary" />
            </div>
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              {label}
            </p>
            <p className="mt-0.5 text-base font-semibold text-foreground">{title}</p>
            <p className="mt-1 text-sm text-muted-foreground">{description}</p>
          </Link>
        ))}

        {isAdmin && (
          <Link
            href="/dashboard/users"
            className="group rounded-lg border border-border bg-card p-5 shadow-sm transition-colors hover:border-primary/30 hover:bg-muted/40"
          >
            <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-md bg-accent/10">
              <Shield className="h-5 w-5 text-accent" />
            </div>
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Admin
            </p>
            <p className="mt-0.5 text-base font-semibold text-foreground">User Management</p>
            <p className="mt-1 text-sm text-muted-foreground">
              View all accounts and manage roles.
            </p>
          </Link>
        )}
      </div>
    </main>
  );
}
