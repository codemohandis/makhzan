import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Plus } from 'lucide-react';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { getAllBooks } from '@/lib/actions/books';
import CmsPageHeader from '@/components/cms/CmsPageHeader';

export default async function DashboardBooksPage() {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const result = await getAllBooks();
  const books = 'data' in result ? result.data : [];

  return (
    <main className="px-6 py-8">
      <CmsPageHeader
        title="Books"
        action={
          <Link
            href="/dashboard/books/new"
            className="inline-flex items-center gap-1.5 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            <Plus className="h-4 w-4" />
            Add Book
          </Link>
        }
      />

      {books.length === 0 ? (
        <p className="py-12 text-center text-sm text-muted-foreground">
          No books yet.{' '}
          <Link href="/dashboard/books/new" className="text-primary underline">
            Add the first one.
          </Link>
        </p>
      ) : (
        <div className="overflow-hidden rounded-lg border border-border bg-card">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/40">
                <th className="px-4 py-3 text-start font-medium text-muted-foreground">Title</th>
                <th className="px-4 py-3 text-start font-medium text-muted-foreground">Lang</th>
                <th className="px-4 py-3 text-start font-medium text-muted-foreground">Download</th>
                <th className="px-4 py-3 text-start font-medium text-muted-foreground">Added</th>
                <th className="px-4 py-3 text-start font-medium text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {books.map((book) => (
                <tr key={book.id} className="hover:bg-muted/20">
                  <td className="max-w-xs truncate px-4 py-3 font-medium text-foreground" dir="rtl">
                    {book.title}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {book.language === 'ur' ? 'اردو' : 'فارسی'}
                  </td>
                  <td className="px-4 py-3">
                    <span className={[
                      'inline-block rounded-full px-2 py-0.5 text-xs font-medium',
                      book.can_download
                        ? 'bg-green-100 text-green-700'
                        : 'bg-muted text-muted-foreground',
                    ].join(' ')}>
                      {book.can_download ? 'Yes' : 'No'}
                    </span>
                  </td>
                  <td className="tabular-nums px-4 py-3 text-muted-foreground">
                    {new Date(book.created_at).toLocaleDateString('en-GB')}
                  </td>
                  <td className="px-4 py-3">
                    <Link
                      href={`/dashboard/books/${book.id}/edit`}
                      className="text-primary underline-offset-2 hover:underline"
                    >
                      Edit
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </main>
  );
}
