import { redirect, notFound } from 'next/navigation';
import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import CmsPageHeader from '@/components/cms/CmsPageHeader';
import BookForm from '@/components/cms/BookForm';

interface EditBookPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditBookPage({ params }: EditBookPageProps) {
  const { id } = await params;

  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: book, error } = await supabase
    .from('books')
    .select('id, title, pdf_url, thumbnail_url, language, can_download, author_id, created_at')
    .eq('id', id)
    .single();

  if (error || !book) notFound();

  return (
    <main className="mx-auto max-w-2xl px-6 py-8">
      <Link
        href="/dashboard/books"
        className="mb-6 inline-flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ChevronLeft className="h-4 w-4" />
        Back to Books
      </Link>

      <CmsPageHeader title="Edit Book" />

      <BookForm book={book} />
    </main>
  );
}
