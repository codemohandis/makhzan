export default function UsersLoading() {
  return (
    <main className="px-6 py-8">
      {/* Header skeleton */}
      <div className="mb-6 flex items-center justify-between">
        <div className="space-y-2">
          <div className="h-6 w-24 animate-pulse rounded bg-muted" />
          <div className="h-4 w-56 animate-pulse rounded bg-muted/60" />
        </div>
        <div className="h-4 w-16 animate-pulse rounded bg-muted/60" />
      </div>

      {/* Table skeleton */}
      <div className="overflow-hidden rounded-lg border border-border bg-card shadow-sm">
        {/* Header row */}
        <div className="flex gap-4 border-b border-border bg-muted px-4 py-3">
          {['w-28', 'w-48', 'w-20', 'w-20', 'w-24'].map((w, i) => (
            <div key={i} className={`h-3 animate-pulse rounded bg-muted-foreground/20 ${w}`} />
          ))}
        </div>

        {/* Data rows */}
        {Array.from({ length: 5 }).map((_, row) => (
          <div
            key={row}
            className="flex items-center gap-4 border-b border-border px-4 py-4 last:border-0"
          >
            <div className="h-4 w-28 animate-pulse rounded bg-muted" />
            <div className="h-4 w-44 animate-pulse rounded bg-muted/60" />
            <div className="h-5 w-16 animate-pulse rounded-full bg-muted" />
            <div className="h-4 w-20 animate-pulse rounded bg-muted/60" />
            <div className="h-7 w-24 animate-pulse rounded bg-muted" />
          </div>
        ))}
      </div>
    </main>
  );
}
