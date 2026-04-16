import { getAllVideos } from '@/lib/actions/videos';
import type { Video } from '@/types';
import Link from 'next/link';

export default async function VideosPage() {
  const result = await getAllVideos();

  if ('error' in result) {
    return (
      <main className="px-4 py-8">
        <p className="text-start text-sm text-destructive">{result.error}</p>
      </main>
    );
  }

  const videos: Video[] = result.data;

  return (
    <main className="mx-auto max-w-5xl px-4 py-8">
      <h1 className="mb-6 text-start text-2xl font-bold text-foreground">ویڈیوز</h1>

      {videos.length === 0 ? (
        <p className="text-start text-sm text-muted-foreground">کوئی ویڈیو دستیاب نہیں۔</p>
      ) : (
        <ul className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {videos.map((video) => (
            <li key={video.id}>
              <Link
                href={`/videos/${video.id}`}
                className="block overflow-hidden rounded-lg border border-border bg-card shadow-sm transition-colors hover:border-primary/30 hover:bg-muted/40"
              >
                {/* Thumbnail placeholder — lite-youtube-embed renders in detail page (F-05-02) */}
                <div className="aspect-video w-full bg-muted" />
                <div className="p-3">
                  <h2 className="text-start text-base font-semibold leading-snug text-foreground">
                    {video.title}
                  </h2>
                  <p className="mt-1 text-start text-xs tabular-nums text-muted-foreground">
                    {new Date(video.created_at).toLocaleDateString('ur-PK')}
                  </p>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
