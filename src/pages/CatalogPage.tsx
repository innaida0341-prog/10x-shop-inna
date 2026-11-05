import { useCallback, useEffect, useMemo, useState, type ChangeEvent } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { fetchCategories, fetchProducts } from '../api/products.api';
import { ProductGrid } from '../components/product/ProductGrid';
import { ErrorMessage } from '../components/ui/ErrorMessage';
import { Pagination } from '../components/ui/Pagination';
import { ProductCardSkeleton } from '../components/ui/Skeleton';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';
import { useDebounce } from '../hooks/useDebounce';
import { useFetch } from '../hooks/useFetch';
import type { CatalogParams, Product, SortOption } from '../types/product';
import { toCartItem } from '../utils/cart';
import { PAGE_SIZE } from '../utils/url';

/**
 * Sort options per P2.6
 * Default | Price: low to high | Price: high to low | Rating: high to low | Name A→Z
 */
const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: '', label: 'Default' },
  { value: 'price-asc', label: 'Price: low to high' },
  { value: 'price-desc', label: 'Price: high to low' },
  { value: 'rating-desc', label: 'Rating: high to low' },
  { value: 'title-asc', label: 'Name A → Z' },
];

/** Parse URL sort param into a valid SortOption; fallback to '' if invalid. */
function parseSort(value: string | null): SortOption {
  return SORT_OPTIONS.some((o) => o.value === value) ? (value as SortOption) : '';
}

export default function CatalogPage() {
  // Contexs
  const { addItem } = useCart();
  const { showToast } = useToast();

  // ── URL is the single source of truth (P2.8) ────────────────────────
  const [searchParams, setSearchParams] = useSearchParams();
  const q = searchParams.get('q') ?? '';
  const category = searchParams.get('category') ?? '';
  const sort = parseSort(searchParams.get('sort'));
  const pageParam = Number(searchParams.get('page'));
  const page = Number.isInteger(pageParam) && pageParam >= 1 ? pageParam : 1;

  /**
   * Update URL params atomically.
   * - null value removes the param
   * - resetPage=true resets to page 1 (P2.6: filter change resets pagination)
   */
  const updateParams = useCallback(
    (changes: Record<string, string | null>, resetPage = true) => {
      setSearchParams((prev) => {
        const next = new URLSearchParams(prev);
        for (const [key, value] of Object.entries(changes)) {
          if (value) next.set(key, value);
          else next.delete(key);
        }
        if (resetPage) next.delete('page');
        return next;
      }, { replace: true });
    },
    [setSearchParams],
  );

  // ── Search with 400ms debounce (P2.4) ───────────────────────────────
  const [searchInput, setSearchInput] = useState(q);
  const debouncedSearch = useDebounce(searchInput, 400);

  // When debounced value changes, update URL. Search clears category (P2.4).
  useEffect(() => {
    const term = debouncedSearch.trim();
    if (term !== q) updateParams({ q: term || null, category: null });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch]);

  // Keep input in sync when URL changes (Back, Clear filters)
  useEffect(() => {
    setSearchInput(q);
  }, [q]);

  // ── Build API params (memoized to avoid refetch loops) ──────────────
  const params: CatalogParams = useMemo(
    () => ({
      q: q || undefined,
      category: category || undefined,
      sort,
      page,
      limit: PAGE_SIZE,
    }),
    [q, category, sort, page],
  );

  // ── Data fetching via custom useFetch hook (supports AbortController) ─
  const productsFetcher = useCallback(
    (signal: AbortSignal) => fetchProducts(params, signal),
    [params],
  );
  const { state, retry } = useFetch(productsFetcher, 'Could not load products');

  const categoriesFetcher = useCallback(
    (signal: AbortSignal) => fetchCategories(signal),
    [],
  );
  const { state: categoriesState } = useFetch(categoriesFetcher, 'Could not load categories');

  // ── Handlers ─────────────────────────────────────────────────────────
  /**
   * Add product to cart with stock validation (P3.3).
   * Uses CartContext's AddResult discriminated union for precise feedback.
   */
  const handleAdd = useCallback(
    (product: Product) => {
      const result = addItem(toCartItem(product));
      if (result.ok) {
        showToast('Added to cart ✓');
      } else {
        showToast(result.message, 'error');
      }
    },
    [addItem, showToast],
  );

  const handlePageChange = (next: number) => {
    updateParams({ page: next > 1 ? String(next) : null }, false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // ── Derived values ───────────────────────────────────────────────────
  const hasFilters = Boolean(q || category || sort);
  const total = state.status === 'success' ? state.data.total : 0;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const from = total === 0 ? 0 : (page - 1) * PAGE_SIZE + 1;
  const to = Math.min(page * PAGE_SIZE, total);

  // ── Render ───────────────────────────────────────────────────────────
  return (
    <section className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h1 className="text-3xl font-bold">Catalog</h1>
        {state.status === 'success' && (
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {total} product{total !== 1 ? 's' : ''} found
          </p>
        )}
      </div>

      {/* Toolbar: search + category + sort */}
      <div className="grid gap-3 md:grid-cols-3">
        {/* Search (P2.4) */}
        <div>
          <label htmlFor="search" className="sr-only">
            Search products
          </label>
          <input
            id="search"
            type="search"
            value={searchInput}
            onChange={(e: ChangeEvent<HTMLInputElement>) => setSearchInput(e.target.value)}
            placeholder="Search products…"
            className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
          />
        </div>

        {/* Category (P2.5) */}
        <div>
          <label htmlFor="category" className="sr-only">
            Category
          </label>
          <select
            id="category"
            value={category}
            onChange={(e) => {
              setSearchInput('');
              updateParams({ category: e.target.value || null, q: null });
            }}
            className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm capitalize focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
          >
            <option value="">All categories</option>
            {categoriesState.status === 'success' &&
              categoriesState.data.map((c) => (
                <option key={c.slug} value={c.slug}>
                  {c.name}
                </option>
              ))}
          </select>
        </div>

        {/* Sort (P2.6) */}
        <div>
          <label htmlFor="sort" className="sr-only">
            Sort by
          </label>
          <select
            id="sort"
            value={sort}
            onChange={(e) => updateParams({ sort: e.target.value || null })}
            className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
          >
            {SORT_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Error state (P2.2) */}
      {state.status === 'error' && (
        <ErrorMessage message={state.message} onRetry={retry} />
      )}

      {/* Loading state with skeletons (P2.2 FULL) */}
      {(state.status === 'loading' || state.status === 'idle') && (
        <div
          className="grid grid-cols-1 gap-4 min-[481px]:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
          role="status"
          aria-label="Loading products"
        >
          {Array.from({ length: 8 }, (_, i) => (
            <ProductCardSkeleton key={i} />
          ))}
        </div>
      )}

      {/* Success state */}
      {state.status === 'success' && (
        <>
          {state.data.products.length === 0 ? (
            /* Empty state (P2.3) */
            <div className="py-16 text-center">
              <p className="text-lg text-gray-600 dark:text-gray-300">No products found.</p>
              {hasFilters && (
                <Link
                  to="/"
                  onClick={(e) => {
                    e.preventDefault();
                    setSearchInput('');
                    setSearchParams({}, { replace: true });
                  }}
                  className="mt-4 inline-block rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700"
                >
                  Clear filters
                </Link>
              )}
            </div>
          ) : (
            <>
              <ProductGrid products={state.data.products} onAdd={handleAdd} />
              <div className="mt-8 space-y-3">
                <Pagination
                  page={page}
                  totalPages={totalPages}
                  onChange={handlePageChange}
                />
                <p className="text-center text-sm text-gray-500 dark:text-gray-400">
                  Showing {from}–{to} of {total}
                </p>
              </div>
            </>
          )}
        </>
      )}
    </section>
  );
}