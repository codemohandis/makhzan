export default function UsersLoading() {
  return (
    <main className="px-6 py-8">
      {/* Header skeleton */}
      <div className="mb-6 flex items-center justify-between">
        <div className="space-y-2">
          <div className="h-6 w-24 animate-pulse rounded bg-gray-200" />
          <div className="h-4 w-56 animate-pulse rounded bg-gray-100" />
        </div>
        <div className="h-4 w-16 animate-pulse rounded bg-gray-100" />
      </div>

      {/* Table skeleton */}
      <div className="rounded-lg border border-gray-200 bg-white shadow-sm overflow-hidden">
        {/* Header row */}
        <div className="flex gap-4 bg-gray-50 px-4 py-3 border-b border-gray-200">
          {[120, 200, 80, 80, 100].map((w, i) => (
            <div
              key={i}
              className="h-3 animate-pulse rounded bg-gray-200"
              style={{ width: w }}
            />
          ))}
        </div>

        {/* Data rows */}
        {Array.from({ length: 5 }).map((_, row) => (
          <div
            key={row}
            className="flex items-center gap-4 px-4 py-4 border-b border-gray-100 last:border-0"
          >
            <div className="h-4 w-28 animate-pulse rounded bg-gray-200" />
            <div className="h-4 w-44 animate-pulse rounded bg-gray-100" />
            <div className="h-5 w-16 animate-pulse rounded-full bg-gray-200" />
            <div className="h-4 w-20 animate-pulse rounded bg-gray-100" />
            <div className="h-7 w-24 animate-pulse rounded bg-gray-200" />
          </div>
        ))}
      </div>
    </main>
  );
}
