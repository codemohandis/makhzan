import { getVideoById } from '@/lib/actions/videos';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';

interface VideoPageProps {
  params: Promise<{ id: string }>;
}

export default async function VideoPage({ params }: VideoPageProps) {
  const { id } = await params;
  const result = await getVideoById(id);

  if ('error' in result) {
    notFound();
  }

  const video = result.data;

  return (
    <main className="mx-auto max-w-3xl px-4 py-8">
      <Link
        href="/videos"
        className="mb-6 inline-flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ChevronRight className="h-4 w-4" />
        تمام ویڈیوز
      </Link>

      <article>
        <h1 className="mb-4 text-start text-3xl font-bold leading-snug text-foreground">
          {video.title}
        </h1>

        {/* lite-youtube-embed component will replace this placeholder (F-05-02) */}
        <div className="flex aspect-video w-full items-center justify-center rounded-lg border border-border bg-muted text-sm text-muted-foreground">
          YouTube ID: {video.youtube_id}
        </div>

        {video.description && (
          <p className="mt-6 text-start text-sm leading-relaxed text-foreground">
            {video.description}
          </p>
        )}

        <p className="mt-4 text-start text-xs tabular-nums text-muted-foreground">
          {new Date(video.created_at).toLocaleDateString('ur-PK')}
        </p>
      </article>
    </main>
  );
}
