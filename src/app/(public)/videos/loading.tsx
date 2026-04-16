export default function VideosLoading() {
  return (
    <main className="mx-auto max-w-5xl px-4 py-8">
      {/* Page title skeleton */}
      <div className="mb-6 h-7 w-20 animate-pulse rounded bg-muted" />

      <ul className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <li key={i} className="overflow-hidden rounded-lg border border-border bg-card shadow-sm">
            {/* Thumbnail skeleton */}
            <div className="aspect-video w-full animate-pulse bg-muted" />
            <div className="p-3">
              {/* Title skeleton */}
              <div className="h-4 w-3/4 animate-pulse rounded bg-muted" />
              {/* Date skeleton */}
              <div className="mt-2 h-3 w-16 animate-pulse rounded bg-muted/60" />
            </div>
          </li>
        ))}
      </ul>
    </main>
  );
}
