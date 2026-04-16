import { getAllBooks } from '@/lib/actions/books';
import type { Book } from '@/types';
import Link from 'next/link';

export default async function BooksPage() {
  const result = await getAllBooks();

  if ('error' in result) {
    return (
      <main className="px-4 py-8">
        <p className="text-start text-sm text-red-500">{result.error}</p>
      </main>
    );
  }

  const books: Book[] = result.data;

  return (
    <main className="mx-auto max-w-3xl px-4 py-8">
      <h1 className="mb-6 text-start text-2xl font-bold">کتب خانہ</h1>

      {books.length === 0 ? (
        <p className="text-start text-sm text-gray-500">کوئی کتاب دستیاب نہیں۔</p>
      ) : (
        <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {books.map((book) => (
            <li key={book.id}>
              <Link
                href={`/books/${book.id}`}
                className="block rounded-lg border border-gray-200 p-4 hover:bg-gray-50"
              >
                <h2 className="text-start text-lg font-semibold leading-snug">
                  {book.title}
                </h2>
                <p className="mt-1 text-start text-xs text-gray-400">
                  {new Date(book.created_at).toLocaleDateString('ur-PK')}
                </p>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
