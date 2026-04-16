export default function BooksLoading() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-8">
      {/* Page title skeleton */}
      <div className="mb-6 h-7 w-28 animate-pulse rounded bg-gray-200" />

      <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {Array.from({ length: 6 }).map((_, i) => (
          <li key={i} className="rounded-lg border border-gray-200 p-4">
            {/* Title skeleton */}
            <div className="h-5 w-3/4 animate-pulse rounded bg-gray-200" />
            {/* Date skeleton */}
            <div className="mt-2 h-3 w-20 animate-pulse rounded bg-gray-100" />
          </li>
        ))}
      </ul>
    </main>
  );
}
