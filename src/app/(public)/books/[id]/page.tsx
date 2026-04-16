import { getBookById } from '@/lib/actions/books';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ChevronRight, Download } from 'lucide-react';

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
        className="mb-6 inline-flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ChevronRight className="h-4 w-4" />
        تمام کتابیں
      </Link>

      <article>
        <h1 className="mb-2 text-start text-3xl font-bold leading-snug text-foreground">
          {book.title}
        </h1>

        <p className="mb-8 text-start text-xs tabular-nums text-muted-foreground">
          {new Date(book.created_at).toLocaleDateString('ur-PK')}
        </p>

        {/* PDF viewer will be rendered by react-pdf-viewer (F-04-03) */}
        <div className="rounded-lg border border-border bg-muted p-6 text-center text-sm text-muted-foreground">
          PDF ریڈر جلد آ رہا ہے۔
        </div>

        {book.can_download && (
          <a
            href={book.pdf_url}
            download
            className="mt-4 inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            <Download className="h-4 w-4" />
            ڈاؤن لوڈ کریں
          </a>
        )}
      </article>
    </main>
  );
}
