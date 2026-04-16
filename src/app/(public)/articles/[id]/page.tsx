import { getArticleById } from '@/lib/actions/articles';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';

interface ArticlePageProps {
  params: Promise<{ id: string }>;
}

export default async function ArticlePage({ params }: ArticlePageProps) {
  const { id } = await params;
  const result = await getArticleById(id);

  if ('error' in result) {
    notFound();
  }

  const article = result.data;

  return (
    <main className="mx-auto max-w-3xl px-4 py-8">
      <Link
        href="/articles"
        className="mb-6 inline-flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ChevronRight className="h-4 w-4" />
        تمام مضامین
      </Link>

      <article>
        <h1 className="mb-2 text-start text-3xl font-bold leading-snug text-foreground">
          {article.title}
        </h1>

        <p className="mb-8 text-start text-xs tabular-nums text-muted-foreground">
          {new Date(article.created_at).toLocaleDateString('ur-PK')}
        </p>

        {/* Rich text will be rendered by TipTap viewer component (F-03-05) */}
        <div className="text-start" dir="rtl">
          {article.content ? (
            <pre className="whitespace-pre-wrap rounded-lg border border-border bg-muted p-4 text-sm text-muted-foreground">
              {JSON.stringify(article.content, null, 2)}
            </pre>
          ) : (
            <p className="text-muted-foreground">مواد دستیاب نہیں۔</p>
          )}
        </div>
      </article>
    </main>
  );
}
