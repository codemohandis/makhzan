import { redirect } from 'next/navigation';
import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import CmsPageHeader from '@/components/cms/CmsPageHeader';
import ArticleForm from '@/components/cms/ArticleForm';

export default async function NewArticlePage() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect('/login');

  return (
    <main className="mx-auto max-w-4xl px-6 py-8">
      <Link
        href="/dashboard/articles"
        className="mb-6 inline-flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ChevronLeft className="h-4 w-4" />
        Back to Articles
      </Link>

      <CmsPageHeader title="New Article" />

      <ArticleForm />
    </main>
  );
}
