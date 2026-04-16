export default function ArticlesLoading() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-8">
      {/* Page title skeleton */}
      <div className="mb-6 h-7 w-24 animate-pulse rounded bg-muted" />

      <ul className="flex flex-col gap-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <li key={i} className="rounded-lg border border-border bg-card p-4 shadow-sm">
            {/* Title skeleton */}
            <div className="h-5 w-3/4 animate-pulse rounded bg-muted" />
            {/* Date skeleton */}
            <div className="mt-2 h-3 w-20 animate-pulse rounded bg-muted/60" />
          </li>
        ))}
      </ul>
    </main>
  );
}
