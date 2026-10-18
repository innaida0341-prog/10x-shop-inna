export function ProductCardSkeleton() {
  return (
    <div className="card animate-pulse overflow-hidden" aria-hidden="true">
      <div className="aspect-square bg-gray-200 dark:bg-gray-700" />
      <div className="space-y-3 p-4">
        <div className="h-4 w-3/4 rounded bg-gray-200 dark:bg-gray-700" />
        <div className="h-3 w-1/2 rounded bg-gray-200 dark:bg-gray-700" />
        <div className="h-5 w-1/3 rounded bg-gray-200 dark:bg-gray-700" />
      </div>
    </div>
  );
}

export function ProductDetailsSkeleton() {
  return (
    <div className="grid animate-pulse gap-8 md:grid-cols-2" aria-hidden="true">
      <div className="aspect-square rounded-xl bg-gray-200 dark:bg-gray-700" />
      <div className="space-y-4">
        <div className="h-8 w-3/4 rounded bg-gray-200 dark:bg-gray-700" />
        <div className="h-4 w-1/3 rounded bg-gray-200 dark:bg-gray-700" />
        <div className="h-24 rounded bg-gray-200 dark:bg-gray-700" />
        <div className="h-11 w-40 rounded bg-gray-200 dark:bg-gray-700" />
      </div>
    </div>
  );
}
