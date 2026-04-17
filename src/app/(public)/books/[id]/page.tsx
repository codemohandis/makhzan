import { getBookById } from '@/lib/actions/books';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { ChevronRight, Download } from 'lucide-react';
import { GlobalContainer } from '@/components/GlobalContainer';
import LanguageBadge from '@/components/public/LanguageBadge';
import PdfReader from '@/components/public/PdfReader';

interface BookPageProps {
  params: Promise<{ id: string }>;
}

export default async function BookPage({ params }: BookPageProps) {
  const { id } = await params;
  const result = await getBookById(id);

  if ('error' in result) notFound();

  const book = result.data;

  const formattedDate = new Date(book.created_at).toLocaleDateString('ur-PK', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <GlobalContainer className="py-10 sm:py-14">
      <Link
        href="/books"
        className="mb-8 inline-flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ChevronRight className="h-4 w-4" />
        تمام کتابیں
      </Link>

      <div className="flex flex-col gap-8 sm:flex-row sm:items-start">
        {/* Cover thumbnail */}
        {book.thumbnail_url && (
          <div className="relative aspect-[3/4] w-full shrink-0 overflow-hidden rounded-lg border border-border sm:w-48">
            <Image
              src={book.thumbnail_url}
              alt={book.title}
              fill
              className="object-cover"
              sizes="(max-width: 640px) 100vw, 192px"
              priority
            />
          </div>
        )}

        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <LanguageBadge lang={book.language} />
            <span className="text-xs text-muted-foreground">{formattedDate}</span>
          </div>

          <h1 className="font-nastaliq text-3xl font-bold leading-relaxed text-foreground sm:text-4xl" dir="rtl">
            {book.title}
          </h1>

          {book.can_download && (
            <a
              href={book.pdf_url}
              download
              className="inline-flex w-fit items-center gap-2 rounded-md bg-accent px-5 py-2 text-sm font-medium text-white transition-colors hover:bg-accent/90"
            >
              <Download className="h-4 w-4" />
              ڈاؤن لوڈ کریں
            </a>
          )}
        </div>
      </div>

      <div className="mt-10">
        <PdfReader pdfUrl={book.pdf_url} />
      </div>
    </GlobalContainer>
  );
}
