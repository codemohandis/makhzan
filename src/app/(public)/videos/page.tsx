import { getAllVideos } from '@/lib/actions/videos';
import type { Video } from '@/types';
import Link from 'next/link';

export default async function VideosPage() {
  const result = await getAllVideos();

  if ('error' in result) {
    return (
      <main className="px-4 py-8">
        <p className="text-start text-sm text-red-500">{result.error}</p>
      </main>
    );
  }

  const videos: Video[] = result.data;

  return (
    <main className="mx-auto max-w-5xl px-4 py-8">
      <h1 className="mb-6 text-start text-2xl font-bold">ویڈیوز</h1>

      {videos.length === 0 ? (
        <p className="text-start text-sm text-gray-500">کوئی ویڈیو دستیاب نہیں۔</p>
      ) : (
        <ul className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {videos.map((video) => (
            <li key={video.id}>
              <Link
                href={`/videos/${video.id}`}
                className="block rounded-lg border border-gray-200 overflow-hidden hover:bg-gray-50"
              >
                {/* Thumbnail placeholder — lite-youtube-embed renders in detail page (F-05-02) */}
                <div className="aspect-video w-full bg-gray-100" />
                <div className="p-3">
                  <h2 className="text-start text-base font-semibold leading-snug">
                    {video.title}
                  </h2>
                  <p className="mt-1 text-start text-xs text-gray-400">
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
