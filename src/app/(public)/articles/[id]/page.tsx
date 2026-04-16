import { getArticleById } from '@/lib/actions/articles';
import { notFound } from 'next/navigation';
import Link from 'next/link';

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
        className="mb-6 inline-block text-start text-sm text-blue-600 hover:underline"
      >
        ← تمام مضامین
      </Link>

      <article>
        <h1 className="mb-2 text-start text-3xl font-bold leading-snug">
          {article.title}
        </h1>

        <p className="mb-8 text-start text-xs text-gray-400">
          {new Date(article.created_at).toLocaleDateString('ur-PK')}
        </p>

        {/* Rich text will be rendered by TipTap viewer component (F-03-05) */}
        <div className="prose prose-lg text-start" dir="rtl">
          {article.content ? (
            <pre className="whitespace-pre-wrap text-sm text-gray-600">
              {JSON.stringify(article.content, null, 2)}
            </pre>
          ) : (
            <p className="text-gray-400">مواد دستیاب نہیں۔</p>
          )}
        </div>
      </article>
    </main>
  );
}
