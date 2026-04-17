'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import type { Video, VideoInput, Locale } from '@/types';
import { createVideo, updateVideo } from '@/lib/actions/videos';

interface VideoFormProps {
  video?: Video;
}

export default function VideoForm({ video }: VideoFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [title, setTitle] = useState(video?.title ?? '');
  const [language, setLanguage] = useState<Locale>(video?.language ?? 'ur');
  const [youtubeId, setYoutubeId] = useState(video?.youtube_id ?? '');
  const [description, setDescription] = useState(video?.description ?? '');
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) { setError('عنوان درج کریں'); return; }
    if (!youtubeId.trim()) { setError('YouTube ID درج کریں'); return; }

    setError(null);

    startTransition(async () => {
      const input: VideoInput = {
        title: title.trim(),
        language,
        youtube_id: youtubeId.trim(),
        description: description.trim() || undefined,
      };

      const result = video
        ? await updateVideo(video.id, input)
        : await createVideo(input);

      if ('error' in result) { setError(result.error); return; }

      router.push('/dashboard/videos');
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
          placeholder="ویڈیو کا عنوان"
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

      {/* YouTube ID */}
      <div className="space-y-1.5">
        <label htmlFor="youtube_id" className="block text-sm font-medium text-foreground">
          YouTube ID <span className="text-destructive">*</span>
        </label>
        <input
          id="youtube_id"
          type="text"
          value={youtubeId}
          onChange={(e) => setYoutubeId(e.target.value)}
          placeholder="e.g. dQw4w9WgXcQ"
          disabled={isPending}
          className="w-full rounded-md border border-input bg-background px-3 py-2 font-mono text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
        />
        <p className="text-xs text-muted-foreground">
          Paste only the ID from the YouTube URL, not the full link.
        </p>
      </div>

      {/* Description */}
      <div className="space-y-1.5">
        <label htmlFor="description" className="block text-sm font-medium text-foreground">
          تفصیل <span className="text-muted-foreground">(اختیاری)</span>
        </label>
        <textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          dir="rtl"
          rows={4}
          placeholder="ویڈیو کی مختصر تفصیل…"
          disabled={isPending}
          className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
        />
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={isPending}
          className="rounded-md bg-primary px-5 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-60"
        >
          {isPending ? 'Saving…' : video ? 'Save Changes' : 'Add Video'}
        </button>
        <button
          type="button"
          onClick={() => router.push('/dashboard/videos')}
          disabled={isPending}
          className="rounded-md px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
