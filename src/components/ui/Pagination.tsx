interface PaginationProps {
  page: number;
  totalPages: number;
  onChange: (page: number) => void;
}

function pageItems(page: number, total: number): (number | 'gap-l' | 'gap-r')[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const items: (number | 'gap-l' | 'gap-r')[] = [1];
  const start = Math.max(2, page - 1);
  const end = Math.min(total - 1, page + 1);
  if (start > 2) items.push('gap-l');
  for (let p = start; p <= end; p++) items.push(p);
  if (end < total - 1) items.push('gap-r');
  items.push(total);
  return items;
}

const base =
  'inline-flex min-h-11 min-w-11 items-center justify-center rounded-lg border px-3 text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-40';

export function Pagination({ page, totalPages, onChange }: PaginationProps) {
  if (totalPages <= 1) return null;
  return (
    <nav aria-label="Pagination" className="flex flex-wrap items-center justify-center gap-2">
      <button
        type="button"
        aria-label="Previous page"
        disabled={page <= 1}
        onClick={() => onChange(page - 1)}
        className={`${base} border-gray-300 hover:bg-gray-100 dark:border-gray-600 dark:hover:bg-gray-700`}
      >
        ‹
      </button>
      {pageItems(page, totalPages).map((item) =>
        typeof item === 'string' ? (
          <span key={item} className="px-1 text-gray-500">
            …
          </span>
        ) : (
          <button
            key={item}
            type="button"
            aria-current={item === page ? 'page' : undefined}
            onClick={() => onChange(item)}
            className={`${base} ${
              item === page
                ? 'border-primary bg-primary text-white'
                : 'border-gray-300 hover:bg-gray-100 dark:border-gray-600 dark:hover:bg-gray-700'
            }`}
          >
            {item}
          </button>
        ),
      )}
      <button
        type="button"
        aria-label="Next page"
        disabled={page >= totalPages}
        onClick={() => onChange(page + 1)}
        className={`${base} border-gray-300 hover:bg-gray-100 dark:border-gray-600 dark:hover:bg-gray-700`}
      >
        ›
      </button>
    </nav>
  );
}
