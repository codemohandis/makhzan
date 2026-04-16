import { getVideoById } from '@/lib/actions/videos';
import { notFound } from 'next/navigation';
import Link from 'next/link';

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
        className="mb-6 inline-block text-start text-sm text-blue-600 hover:underline"
      >
        ← تمام ویڈیوز
      </Link>

      <article>
        <h1 className="mb-4 text-start text-3xl font-bold leading-snug">
          {video.title}
        </h1>

        {/* lite-youtube-embed component will replace this placeholder (F-05-02) */}
        <div className="aspect-video w-full rounded-lg bg-gray-100 flex items-center justify-center text-sm text-gray-400">
          YouTube ID: {video.youtube_id}
        </div>

        {video.description && (
          <p className="mt-6 text-start text-sm leading-relaxed text-gray-700">
            {video.description}
          </p>
        )}

        <p className="mt-4 text-start text-xs text-gray-400">
          {new Date(video.created_at).toLocaleDateString('ur-PK')}
        </p>
      </article>
    </main>
  );
}
