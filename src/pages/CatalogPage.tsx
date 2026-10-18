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

const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: '', label: 'Default' },
  { value: 'price-asc', label: 'Price: low to high' },
  { value: 'price-desc', label: 'Price: high to low' },
  { value: 'rating-desc', label: 'Rating: high to low' },
  { value: 'title-asc', label: 'Name A→Z' },
];

function parseSort(value: string | null): SortOption {
  return SORT_OPTIONS.some((o) => o.value === value) ? (value as SortOption) : '';
}

export function CatalogPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { addItem } = useCart();
  const { showToast } = useToast();

  // URL is the single source of truth for q / category / sort / page
  const q = searchParams.get('q') ?? '';
  const category = searchParams.get('category') ?? '';
  const sort = parseSort(searchParams.get('sort'));
  const pageParam = Number(searchParams.get('page'));
  const page = Number.isInteger(pageParam) && pageParam >= 1 ? pageParam : 1;

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
      });
    },
    [setSearchParams],
  );

  // Search: local state updates instantly, URL is updated 400ms later
  const [searchInput, setSearchInput] = useState(q);
  const debouncedSearch = useDebounce(searchInput, 400);

  useEffect(() => {
    const term = debouncedSearch.trim();
    if (term !== q) updateParams({ q: term || null, category: null });
    // eslint-disable-next-line react-hooks/exhaustive-deps -- only react to the debounced value
  }, [debouncedSearch]);

  useEffect(() => {
    setSearchInput(q); // keep the input in sync when the URL changes (Back, Clear filters)
  }, [q]);

  const params: CatalogParams = useMemo(
    () => ({ q: q || undefined, category: category || undefined, sort, page, limit: PAGE_SIZE }),
    [q, category, sort, page],
  );

  const productsFetcher = useCallback(
    (signal: AbortSignal) => fetchProducts(params, signal),
    [params],
  );
  const { state, retry } = useFetch(productsFetcher, 'Could not load products');

  const categoriesFetcher = useCallback((signal: AbortSignal) => fetchCategories(signal), []);
  const { state: categoriesState } = useFetch(categoriesFetcher, 'Could not load categories');

  const handleAdd = useCallback(
    (product: Product) => {
      const result = addItem(toCartItem(product));
      if (result.ok) showToast('Added to cart ✓');
      else showToast(result.message, 'error');
    },
    [addItem, showToast],
  );

  const handlePageChange = (next: number) => {
    updateParams({ page: next > 1 ? String(next) : null }, false);
    window.scrollTo(0, 0);
  };

  const hasFilters = Boolean(q || category || sort);
  const total = state.status === 'success' ? state.data.total : 0;
  const totalPages = Math.ceil(total / PAGE_SIZE);
  const from = (page - 1) * PAGE_SIZE + 1;
  const to = Math.min(page * PAGE_SIZE, total);

  return (
    <section>
      <div className="mb-4 flex flex-wrap items-baseline justify-between gap-2">
        <h1 className="text-2xl font-bold">Catalog</h1>
        {state.status === 'success' && (
          <p className="text-sm text-gray-500 dark:text-gray-400">{total} products</p>
        )}
      </div>

      <div className="mb-6 grid gap-3 md:grid-cols-3">
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
            className="input-field"
          />
        </div>
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
            className="input-field capitalize"
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
        <div>
          <label htmlFor="sort" className="sr-only">
            Sort by
          </label>
          <select
            id="sort"
            value={sort}
            onChange={(e) => updateParams({ sort: e.target.value || null })}
            className="input-field"
          >
            {SORT_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {state.status === 'error' && <ErrorMessage message={state.message} onRetry={retry} />}

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

      {state.status === 'success' &&
        (state.data.products.length === 0 ? (
          <div className="py-16 text-center">
            <p className="text-lg">No products found.</p>
            {hasFilters && (
              <Link to="/" className="btn-secondary mt-4">
                Clear filters
              </Link>
            )}
          </div>
        ) : (
          <>
            <ProductGrid products={state.data.products} onAdd={handleAdd} />
            <div className="mt-8 space-y-3">
              <Pagination page={page} totalPages={totalPages} onChange={handlePageChange} />
              <p className="text-center text-sm text-gray-500 dark:text-gray-400">
                Showing {from}–{to} of {total}
              </p>
            </div>
          </>
        ))}
    </section>
  );
}
