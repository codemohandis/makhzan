'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import TipTapEditor from '@/components/editor/TipTapEditor';
import type { Article, ArticleStatus, Locale } from '@/types';
import { createArticle, updateArticle } from '@/lib/actions/articles';

interface ArticleFormProps {
  article?: Article; // undefined = create mode
}

export default function ArticleForm({ article }: ArticleFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [title, setTitle] = useState(article?.title ?? '');
  const [language, setLanguage] = useState<Locale>(article?.language ?? 'ur');
  const [status, setStatus] = useState<ArticleStatus>(article?.status ?? 'draft');
  const [content, setContent] = useState<Record<string, unknown> | null>(
    article?.content ?? null
  );
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) {
      setError('عنوان درج کریں');
      return;
    }

    setError(null);

    startTransition(async () => {
      const input = {
        title: title.trim(),
        language,
        status,
        content: content ?? { type: 'doc', content: [] },
      };

      const result = article
        ? await updateArticle(article.id, input)
        : await createArticle(input);

      if ('error' in result) {
        setError(result.error);
        return;
      }

      router.push('/dashboard/articles');
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
          placeholder="مضمون کا عنوان"
          className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          disabled={isPending}
        />
      </div>

      {/* Language + Status row */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <label htmlFor="language" className="block text-sm font-medium text-foreground">
            زبان
          </label>
          <select
            id="language"
            value={language}
            onChange={(e) => setLanguage(e.target.value as Locale)}
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            disabled={isPending}
          >
            <option value="ur">اردو</option>
            <option value="fa">فارسی</option>
          </select>
        </div>

        <div className="space-y-1.5">
          <label htmlFor="status" className="block text-sm font-medium text-foreground">
            Status
          </label>
          <select
            id="status"
            value={status}
            onChange={(e) => setStatus(e.target.value as ArticleStatus)}
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            disabled={isPending}
          >
            <option value="draft">Draft</option>
            <option value="published">Published</option>
          </select>
        </div>
      </div>

      {/* Content */}
      <div className="space-y-1.5">
        <label className="block text-sm font-medium text-foreground">مواد</label>
        <TipTapEditor
          value={content}
          onChange={setContent}
          language={language}
          disabled={isPending}
          placeholder="مضمون یہاں لکھیں…"
        />
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={isPending}
          className="rounded-md bg-primary px-5 py-2 text-sm font-medium text-white transition-colors hover:bg-primary/90 disabled:opacity-60"
        >
          {isPending ? 'محفوظ ہو رہا ہے…' : article ? 'تبدیلیاں محفوظ کریں' : 'مضمون شائع کریں'}
        </button>
        <button
          type="button"
          onClick={() => router.push('/dashboard/articles')}
          disabled={isPending}
          className="rounded-md px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
        >
          منسوخ
        </button>
      </div>
    </form>
  );
}
