import { getAllArticles } from '@/lib/actions/articles';
import type { Article } from '@/types';
import Link from 'next/link';

export default async function ArticlesPage() {
  const result = await getAllArticles();

  if ('error' in result) {
    return (
      <main className="px-4 py-8">
        <p className="text-start text-sm text-red-500">{result.error}</p>
      </main>
    );
  }

  const articles: Article[] = result.data;

  return (
    <main className="mx-auto max-w-3xl px-4 py-8">
      <h1 className="mb-6 text-start text-2xl font-bold">مضامین</h1>

      {articles.length === 0 ? (
        <p className="text-start text-sm text-gray-500">کوئی مضمون دستیاب نہیں۔</p>
      ) : (
        <ul className="flex flex-col gap-4">
          {articles.map((article) => (
            <li key={article.id}>
              <Link
                href={`/articles/${article.id}`}
                className="block rounded-lg border border-gray-200 p-4 hover:bg-gray-50"
              >
                <h2 className="text-start text-lg font-semibold leading-snug">
                  {article.title}
                </h2>
                <p className="mt-1 text-start text-xs text-gray-400">
                  {new Date(article.created_at).toLocaleDateString('ur-PK')}
                </p>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
