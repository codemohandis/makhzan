'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import type { Book, BookInput, Locale } from '@/types';
import { createBook, updateBook } from '@/lib/actions/books';

interface BookFormProps {
  book?: Book;
}

export default function BookForm({ book }: BookFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [title, setTitle] = useState(book?.title ?? '');
  const [language, setLanguage] = useState<Locale>(book?.language ?? 'ur');
  const [pdfUrl, setPdfUrl] = useState(book?.pdf_url ?? '');
  const [thumbnailUrl, setThumbnailUrl] = useState(book?.thumbnail_url ?? '');
  const [canDownload, setCanDownload] = useState(book?.can_download ?? true);
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) { setError('عنوان درج کریں'); return; }
    if (!pdfUrl.trim()) { setError('PDF URL درج کریں'); return; }

    setError(null);

    startTransition(async () => {
      const input: BookInput = {
        title: title.trim(),
        language,
        pdf_url: pdfUrl.trim(),
        thumbnail_url: thumbnailUrl.trim() || undefined,
        can_download: canDownload,
      };

      const result = book
        ? await updateBook(book.id, input)
        : await createBook(input);

      if ('error' in result) { setError(result.error); return; }

      router.push('/dashboard/books');
      router.refresh();
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <p className="rounded-md border border-destructive/30 bg-destructive/10 px-4 py-2 text-sm text-destructive">
          {error}
        </p>
      )}

      {/* Title */}
      <div className="space-y-1.5">
        <label htmlFor="title" className="block text-sm font-medium text-foreground">
          عنوان <span className="text-destructive">*</span>
        </label>
        <input
          id="title"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          dir="rtl"
          placeholder="کتاب کا نام"
          disabled={isPending}
          className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
        />
      </div>

      {/* Language */}
      <div className="space-y-1.5">
        <label htmlFor="language" className="block text-sm font-medium text-foreground">
          زبان
        </label>
        <select
          id="language"
          value={language}
          onChange={(e) => setLanguage(e.target.value as Locale)}
          disabled={isPending}
          className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
        >
          <option value="ur">اردو</option>
          <option value="fa">فارسی</option>
        </select>
      </div>

      {/* PDF URL */}
      <div className="space-y-1.5">
        <label htmlFor="pdf_url" className="block text-sm font-medium text-foreground">
          PDF URL <span className="text-destructive">*</span>
        </label>
        <input
          id="pdf_url"
          type="url"
          value={pdfUrl}
          onChange={(e) => setPdfUrl(e.target.value)}
          placeholder="https://…/book.pdf"
          disabled={isPending}
          className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
        />
        <p className="text-xs text-muted-foreground">
          Upload the PDF to Supabase Storage and paste the public URL here.
        </p>
      </div>

      {/* Thumbnail URL */}
      <div className="space-y-1.5">
        <label htmlFor="thumbnail_url" className="block text-sm font-medium text-foreground">
          Thumbnail URL <span className="text-muted-foreground">(optional)</span>
        </label>
        <input
          id="thumbnail_url"
          type="url"
          value={thumbnailUrl}
          onChange={(e) => setThumbnailUrl(e.target.value)}
          placeholder="https://…/cover.jpg"
          disabled={isPending}
          className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
        />
      </div>

      {/* Can download */}
      <div className="flex items-center gap-3">
        <input
          id="can_download"
          type="checkbox"
          checked={canDownload}
          onChange={(e) => setCanDownload(e.target.checked)}
          disabled={isPending}
          className="h-4 w-4 rounded border-input accent-primary"
        />
        <label htmlFor="can_download" className="text-sm font-medium text-foreground">
          Allow download
        </label>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={isPending}
          className="rounded-md bg-primary px-5 py-2 text-sm font-medium text-white transition-colors hover:bg-primary/90 disabled:opacity-60"
        >
          {isPending ? 'Saving…' : book ? 'Save Changes' : 'Add Book'}
        </button>
        <button
          type="button"
          onClick={() => router.push('/dashboard/books')}
          disabled={isPending}
          className="rounded-md px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
