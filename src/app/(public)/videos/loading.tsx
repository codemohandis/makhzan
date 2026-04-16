export default function VideosLoading() {
  return (
    <main className="mx-auto max-w-5xl px-4 py-8">
      {/* Page title skeleton */}
      <div className="mb-6 h-7 w-20 animate-pulse rounded bg-gray-200" />

      <ul className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <li key={i} className="rounded-lg border border-gray-200 overflow-hidden">
            {/* Thumbnail skeleton */}
            <div className="aspect-video w-full animate-pulse bg-gray-200" />
            <div className="p-3">
              {/* Title skeleton */}
              <div className="h-4 w-3/4 animate-pulse rounded bg-gray-200" />
              {/* Date skeleton */}
              <div className="mt-2 h-3 w-16 animate-pulse rounded bg-gray-100" />
            </div>
          </li>
        ))}
      </ul>
    </main>
  );
}
