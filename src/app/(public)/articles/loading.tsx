export default function ArticlesLoading() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-8">
      {/* Page title skeleton */}
      <div className="mb-6 h-7 w-24 animate-pulse rounded bg-gray-200" />

      <ul className="flex flex-col gap-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <li
            key={i}
            className="rounded-lg border border-gray-200 p-4"
          >
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
