import { useCallback, useMemo, useState, type FormEvent } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { fetchProduct, fetchRelated } from '../api/products.api';
import { PriceBlock } from '../components/product/PriceBlock';
import { ProductGrid } from '../components/product/ProductGrid';
import { StockBadge } from '../components/product/StockBadge';
import { ErrorMessage } from '../components/ui/ErrorMessage';
import { QuantityStepper } from '../components/ui/QuantityStepper';
import { ProductDetailsSkeleton } from '../components/ui/Skeleton';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';
import { useFetch } from '../hooks/useFetch';
import { reviewsStorage } from '../models/storage';
import type { Product, Review } from '../types/product';
import { toCartItem } from '../utils/cart';
import { formatDate } from '../utils/format';
import { NotFoundPage } from './NotFoundPage';

function Stars({ rating }: { rating: number }) {
  const full = Math.round(rating);
  return (
    <span aria-label={`${rating} out of 5`} className="text-amber-500">
      {'★'.repeat(full)}
      <span className="text-gray-300 dark:text-gray-600">{'★'.repeat(5 - full)}</span>
    </span>
  );
}

function RelatedProducts({ product }: { product: Product }) {
  const { addItem } = useCart();
  const { showToast } = useToast();
  const fetcher = useCallback(
    (signal: AbortSignal) => fetchRelated(product.category, product.id, signal),
    [product.category, product.id],
  );
  const { state } = useFetch(fetcher, 'Could not load related products');

  const handleAdd = useCallback(
    (p: Product) => {
      const result = addItem(toCartItem(p));
      if (result.ok) showToast('Added to cart ✓');
      else showToast(result.message, 'error');
    },
    [addItem, showToast],
  );

  if (state.status !== 'success' || state.data.length === 0) return null;
  return (
    <section className="mt-12">
      <h2 className="mb-4 text-xl font-bold">Related products</h2>
      <ProductGrid products={state.data} onAdd={handleAdd} />
    </section>
  );
}

function ReviewsTab({ product }: { product: Product }) {
  const { user } = useAuth();
  const { showToast } = useToast();
  const key = String(product.id);

  const [localReviews, setLocalReviews] = useState<Review[]>(
    () => reviewsStorage.get()?.[key] ?? [],
  );
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [errors, setErrors] = useState<{ rating?: string; comment?: string }>({});

  const all = useMemo(() => [...localReviews, ...product.reviews], [localReviews, product.reviews]);

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const found: { rating?: string; comment?: string } = {};
    if (rating < 1) found.rating = 'Please select a rating';
    if (comment.trim().length < 10) found.comment = 'Comment must be at least 10 characters';
    setErrors(found);
    if (Object.keys(found).length > 0) return;

    const name = [user.firstName, user.lastName].filter(Boolean).join(' ');
    const review: Review = {
      rating,
      comment: comment.trim(),
      date: new Date().toISOString(),
      reviewerName: user.isLoggedIn && name ? name : 'Guest',
    };
    const next = [review, ...localReviews];
    setLocalReviews(next);
    reviewsStorage.set({ ...(reviewsStorage.get() ?? {}), [key]: next });
    setRating(0);
    setComment('');
    showToast('Review added ✓');
  };

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit} noValidate className="card space-y-3 p-4">
        <h3 className="font-semibold">Write a review</h3>
        <div>
          <div role="radiogroup" aria-label="Rating" className="flex gap-1">
            {[1, 2, 3, 4, 5].map((n) => (
              <button
                key={n}
                type="button"
                role="radio"
                aria-checked={rating === n}
                aria-label={`${n} star${n > 1 ? 's' : ''}`}
                onClick={() => setRating(n)}
                className={`size-11 rounded-lg text-2xl transition-colors hover:bg-gray-100 dark:hover:bg-gray-700 ${
                  n <= rating ? 'text-amber-500' : 'text-gray-300 dark:text-gray-600'
                }`}
              >
                ★
              </button>
            ))}
          </div>
          {errors.rating && <p className="mt-1 text-sm text-danger">{errors.rating}</p>}
        </div>
        <div>
          <label htmlFor="comment" className="mb-1 block text-sm font-medium">
            Comment
          </label>
          <textarea
            id="comment"
            rows={3}
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            className="input-field"
          />
          {errors.comment && <p className="mt-1 text-sm text-danger">{errors.comment}</p>}
        </div>
        <button type="submit" className="btn-primary">
          Submit review
        </button>
      </form>

      {all.length === 0 ? (
        <p className="text-gray-500">No reviews yet. Be the first to write one.</p>
      ) : (
        <ul className="space-y-4">
          {all.map((r, i) => (
            <li key={`${r.date}-${r.reviewerName}-${i}`} className="card p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="font-medium">{r.reviewerName}</span>
                <span className="text-sm text-gray-500">{formatDate(r.date)}</span>
              </div>
              <Stars rating={r.rating} />
              <p className="mt-1 text-sm">{r.comment}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function ProductDetails({ product }: { product: Product }) {
  const navigate = useNavigate();
  const { addItem } = useCart();
  const { showToast } = useToast();
  const images = product.images.length > 0 ? product.images : [product.thumbnail];
  const [selected, setSelected] = useState(images[0]);
  const [qty, setQty] = useState(1);
  const [tab, setTab] = useState<'description' | 'reviews'>('description');
  const [feedback, setFeedback] = useState<{ ok: boolean; text: string } | null>(null);

  const outOfStock = product.stock <= 0;

  const reviewCount = useMemo(() => {
    const local = reviewsStorage.get()?.[String(product.id)]?.length ?? 0;
    return local + product.reviews.length;
  }, [product]);

  const handleAdd = () => {
    const result = addItem(toCartItem(product), qty);
    if (result.ok) {
      setFeedback({ ok: true, text: `Added ${qty} to cart ✓` });
      showToast('Added to cart ✓');
    } else {
      setFeedback({ ok: false, text: result.message });
      showToast(result.message, 'error');
    }
  };

  return (
    <div>
      <button
        type="button"
        onClick={() => navigate(-1)}
        className="mb-4 text-sm text-primary hover:underline"
      >
        ← Back to catalog
      </button>

      <div className="grid gap-8 md:grid-cols-2">
        <div>
          <div className="card overflow-hidden bg-gray-100 dark:bg-gray-700">
            <img
              src={selected}
              alt={product.title}
              width={600}
              height={600}
              className="aspect-square w-full object-contain"
            />
          </div>
          {images.length > 1 && (
            <div className="mt-3 flex gap-2 overflow-x-auto">
              {images.map((src) => (
                <button
                  key={src}
                  type="button"
                  onClick={() => setSelected(src)}
                  aria-label="Show this photo"
                  aria-pressed={src === selected}
                  className={`size-16 shrink-0 overflow-hidden rounded-lg border-2 bg-gray-100 dark:bg-gray-700 ${
                    src === selected ? 'border-primary' : 'border-transparent hover:border-gray-300'
                  }`}
                >
                  <img src={src} alt="" width={64} height={64} loading="lazy" className="size-full object-contain" />
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-4">
          <h1 className="text-2xl font-bold md:text-3xl">{product.title}</h1>
          <p className="text-sm capitalize text-gray-500 dark:text-gray-400">
            {product.brand ? `${product.brand} · ` : ''}
            <Link to={`/?category=${encodeURIComponent(product.category)}`} className="text-primary hover:underline">
              {product.category}
            </Link>
          </p>
          <PriceBlock price={product.price} discountPercentage={product.discountPercentage} large />
          <p className="text-sm">
            ★ {product.rating.toFixed(1)} · {reviewCount} review{reviewCount === 1 ? '' : 's'}
          </p>
          <StockBadge stock={product.stock} />

          <div className="flex flex-wrap items-center gap-4">
            <QuantityStepper value={qty} max={Math.max(product.stock, 1)} onChange={setQty} disabled={outOfStock} />
            <button type="button" onClick={handleAdd} disabled={outOfStock} className="btn-primary">
              {outOfStock ? 'Out of stock' : 'Add to cart'}
            </button>
          </div>
          {feedback && (
            <p role="status" className={`text-sm ${feedback.ok ? 'text-success' : 'text-danger'}`}>
              {feedback.text}
            </p>
          )}
        </div>
      </div>

      <div className="mt-10">
        <div role="tablist" className="flex gap-2 border-b border-gray-200 dark:border-gray-700">
          {(['description', 'reviews'] as const).map((t) => (
            <button
              key={t}
              type="button"
              role="tab"
              aria-selected={tab === t}
              onClick={() => setTab(t)}
              className={`min-h-11 border-b-2 px-4 text-sm font-medium capitalize transition-colors ${
                tab === t
                  ? 'border-primary text-primary'
                  : 'border-transparent text-gray-500 hover:text-gray-800 dark:hover:text-gray-200'
              }`}
            >
              {t === 'reviews' ? `Reviews (${reviewCount})` : 'Description'}
            </button>
          ))}
        </div>
        <div className="py-4">
          {tab === 'description' ? <p className="max-w-prose">{product.description}</p> : <ReviewsTab product={product} />}
        </div>
      </div>

      <RelatedProducts product={product} />
    </div>
  );
}

export function ProductPage() {
  const { id } = useParams();
  const numericId = Number(id);
  const valid = Number.isInteger(numericId) && numericId > 0;

  const fetcher = useCallback(
    (signal: AbortSignal) => (valid ? fetchProduct(numericId, signal) : Promise.resolve(null)),
    [valid, numericId],
  );
  const { state, retry } = useFetch(fetcher, 'Could not load this product');

  if (!valid) return <NotFoundPage />;
  if (state.status === 'idle' || state.status === 'loading') return <ProductDetailsSkeleton />;
  if (state.status === 'error') return <ErrorMessage message={state.message} onRetry={retry} />;
  if (state.data === null) return <NotFoundPage />;
  // key resets quantity/gallery/tab when navigating to another product
  return <ProductDetails key={state.data.id} product={state.data} />;
}
