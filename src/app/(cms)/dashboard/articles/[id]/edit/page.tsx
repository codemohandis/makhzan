import { redirect, notFound } from 'next/navigation';
import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { getArticleById } from '@/lib/actions/articles';
import CmsPageHeader from '@/components/cms/CmsPageHeader';
import ArticleForm from '@/components/cms/ArticleForm';

interface EditArticlePageProps {
  params: Promise<{ id: string }>;
}

export default async function EditArticlePage({ params }: EditArticlePageProps) {
  const { id } = await params;

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect('/login');

  // Fetch without status filter so drafts are editable
  const { data: article, error } = await supabase
    .from('articles')
    .select('id, title, content, language, status, author_id, created_at, updated_at')
    .eq('id', id)
    .single();

  if (error || !article) notFound();

  return (
    <main className="mx-auto max-w-4xl px-6 py-8">
      <Link
        href="/dashboard/articles"
        className="mb-6 inline-flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ChevronLeft className="h-4 w-4" />
        Back to Articles
      </Link>

      <CmsPageHeader title="Edit Article" />

      <ArticleForm article={article} />
    </main>
  );
}
