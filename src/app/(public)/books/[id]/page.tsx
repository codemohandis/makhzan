import { getBookById } from '@/lib/actions/books';
import { notFound } from 'next/navigation';
import Link from 'next/link';

interface BookPageProps {
  params: Promise<{ id: string }>;
}

export default async function BookPage({ params }: BookPageProps) {
  const { id } = await params;
  const result = await getBookById(id);

  if ('error' in result) {
    notFound();
  }

  const book = result.data;

  return (
    <main className="mx-auto max-w-3xl px-4 py-8">
      <Link
        href="/books"
        className="mb-6 inline-block text-start text-sm text-blue-600 hover:underline"
      >
        ← تمام کتابیں
      </Link>

      <article>
        <h1 className="mb-2 text-start text-3xl font-bold leading-snug">
          {book.title}
        </h1>

        <p className="mb-8 text-start text-xs text-gray-400">
          {new Date(book.created_at).toLocaleDateString('ur-PK')}
        </p>

        {/* PDF viewer will be rendered by react-pdf-viewer (F-04-03) */}
        <div className="rounded-lg border border-gray-200 p-6 text-center text-sm text-gray-400">
          PDF ریڈر جلد آ رہا ہے۔
        </div>

        {book.can_download && (
          <a
            href={book.pdf_url}
            download
            className="mt-4 inline-block rounded-md bg-blue-600 px-4 py-2 text-start text-sm font-medium text-white hover:bg-blue-700"
          >
            ڈاؤن لوڈ کریں
          </a>
        )}
      </article>
    </main>
  );
}
