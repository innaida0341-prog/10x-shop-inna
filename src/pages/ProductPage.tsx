
import { useEffect, useState, useCallback } from 'react';
import { Link, useParams } from 'react-router-dom';

import { fetchProduct, fetchRelated } from '../api/products.api';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';

import { ProductCard } from '../components/product/ProductCard';
import { PriceBlock } from '../components/product/PriceBlock';
import { StockBadge } from '../components/product/StockBadge';
import { ProductDetailsSkeleton } from '../components/ui/Skeleton';

import { toCartItem } from '../utils/cart';
import { formatDate } from '../utils/format';

import type { Product } from '../types/product';

export default function ProductPage() {
  const { id } = useParams<{ id: string }>();

  const productId = Number(id);

  const { addItem } = useCart();
  const { showToast } = useToast();

  const [product, setProduct] = useState<Product | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [selectedImage, setSelectedImage] = useState('');

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!Number.isInteger(productId) || productId <= 0) {
      setLoading(false);
      setNotFound(true);
      return;
    }

    const controller = new AbortController();
    let active = true;

    async function loadProduct() {
      setLoading(true);
      setError(null);
      setNotFound(false);
      setProduct(null);
      setRelatedProducts([]);
      setSelectedImage('');

      try {
        const result = await fetchProduct(
          productId,
          controller.signal,
        );

        if (!active) return;

        if (!result) {
          setNotFound(true);
          setLoading(false);
          return;
        }

        setProduct(result);
        setSelectedImage(result.thumbnail);

        try {
          const related = await fetchRelated(
            result.category,
            result.id,
            controller.signal,
          );

          if (active) {
            setRelatedProducts(related);
          }
        } catch {
          if (active && !controller.signal.aborted) {
            setRelatedProducts([]);
          }
        }

        if (active) {
          setLoading(false);
        }
      } catch (err: unknown) {
        if (!active || controller.signal.aborted) return;

        const message =
          err instanceof Error
            ? err.message
            : 'Something went wrong while loading the product.';

        setError(message);
        setLoading(false);
      }
    }

    void loadProduct();

    return () => {
      active = false;
      controller.abort();
    };
  }, [productId]);

  const handleAddToCart = useCallback(
    (item: Product) => {
      const result = addItem(toCartItem(item), 1);

      if (result.ok) {
        showToast(`${item.title} added to cart.`, 'success');
      } else {
        showToast(result.message, 'error');
      }
    },
    [addItem, showToast],
  );

  if (loading) {
    return (
      <div className="py-8">
        <ProductDetailsSkeleton />
      </div>
    );
  }

  if (notFound) {
    return (
      <section className="py-20 text-center">
        <h1 className="text-3xl font-bold">
          Product not found
        </h1>

        <p className="mt-3 text-gray-500 dark:text-gray-400">
          The product you are looking for does not exist
          or may have been removed.
        </p>

        <Link
          to="/"
          className="btn-primary mt-6 inline-flex"
        >
          Back to catalog
        </Link>
      </section>
    );
  }

  if (error || !product) {
    return (
      <section
        className="mx-auto max-w-2xl py-16 text-center"
        role="alert"
      >
        <h1 className="text-2xl font-bold">
          Unable to load product
        </h1>

        <p className="mt-3 text-gray-500 dark:text-gray-400">
          {error ?? 'An unexpected error occurred.'}
        </p>

        <button
          type="button"
          onClick={() => window.location.reload()}
          className="btn-primary mt-6"
        >
          Try again
        </button>

        <div>
          <Link
            to="/"
            className="mt-4 inline-block text-primary hover:underline"
          >
            Back to catalog
          </Link>
        </div>
      </section>
    );
  }

  const galleryImages =
    product.images.length > 0
      ? product.images
      : [product.thumbnail];

  const outOfStock = product.stock <= 0;

  return (
    <div className="space-y-12">
      {/* Breadcrumb navigation */}
      <nav
        aria-label="Breadcrumb"
        className="text-sm text-gray-500 dark:text-gray-400"
      >
        <ol className="flex flex-wrap items-center gap-2">
          <li>
            <Link
              to="/"
              className="hover:text-primary"
            >
              Home
            </Link>
          </li>

          <li aria-hidden="true">/</li>

          <li>
            <Link
              to={`/?category=${encodeURIComponent(product.category)}`}
              className="capitalize hover:text-primary"
            >
              {product.category.replace(/-/g, ' ')}
            </Link>
          </li>

          <li aria-hidden="true">/</li>

          <li
            aria-current="page"
            className="max-w-48 truncate text-gray-900 dark:text-gray-100"
          >
            {product.title}
          </li>
        </ol>
      </nav>

      {/* Product details */}
      <section className="grid items-start gap-8 md:grid-cols-2 lg:gap-12">
        {/* Product gallery */}
        <div className="space-y-4">
          <div className="flex aspect-square items-center justify-center overflow-hidden rounded-2xl bg-gray-100 p-6 dark:bg-gray-800">
            <img
              src={selectedImage || product.thumbnail}
              alt={product.title}
              className="h-full w-full object-contain"
              fetchPriority="high"
            />
          </div>

          {galleryImages.length > 1 && (
            <div
              className="grid grid-cols-4 gap-3"
              aria-label="Product image gallery"
            >
              {galleryImages.map((image, index) => (
                <button
                  key={`${image}-${index}`}
                  type="button"
                  onClick={() => setSelectedImage(image)}
                  aria-label={`Show product image ${index + 1}`}
                  aria-pressed={selectedImage === image}
                  className={`aspect-square overflow-hidden rounded-xl border-2 bg-gray-100 p-2 transition dark:bg-gray-800 ${
                    selectedImage === image
                      ? 'border-primary'
                      : 'border-transparent hover:border-gray-300 dark:hover:border-gray-600'
                  }`}
                >
                  <img
                    src={image}
                    alt={`${product.title} view ${index + 1}`}
                    loading="lazy"
                    className="h-full w-full object-contain"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product information */}
        <div className="space-y-5">
          <div>
            <p className="mb-2 text-sm font-medium capitalize text-primary">
              {product.category.replace(/-/g, ' ')}
              {product.brand ? ` · ${product.brand}` : ''}
            </p>

            <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white lg:text-4xl">
              {product.title}
            </h1>
          </div>

          <div className="flex flex-wrap items-center gap-4">
            <span className="flex items-center gap-1 font-medium">
              <span className="text-yellow-500" aria-hidden="true">
                ★
              </span>
              {product.rating.toFixed(1)}
            </span>

            <span className="text-sm text-gray-500 dark:text-gray-400">
              {product.reviews.length} reviews
            </span>

            <StockBadge stock={product.stock} />
          </div>

          <div className="border-y border-gray-200 py-5 dark:border-gray-700">
            <PriceBlock
              price={product.price}
              discountPercentage={product.discountPercentage}
              large
            />
          </div>

          <div>
            <h2 className="mb-2 text-lg font-semibold">
              Description
            </h2>

            <p className="leading-7 text-gray-600 dark:text-gray-300">
              {product.description}
            </p>
          </div>

          <div className="rounded-xl bg-gray-50 p-4 dark:bg-gray-800">
            <h2 className="mb-3 font-semibold">
              Availability
            </h2>

            <div className="flex items-center justify-between gap-3">
              <span className="text-sm text-gray-600 dark:text-gray-300">
                Stock available
              </span>

              <span className="font-semibold">
                {product.stock} units
              </span>
            </div>
          </div>

          <button
            type="button"
            disabled={outOfStock}
            onClick={() => handleAddToCart(product)}
            className="btn-primary w-full py-3 text-base disabled:cursor-not-allowed disabled:opacity-50"
          >
            {outOfStock ? 'Out of stock' : 'Add to cart'}
          </button>

          <Link
            to="/cart"
            className="block text-center text-sm font-medium text-primary hover:underline"
          >
            View shopping cart
          </Link>
        </div>
      </section>

      {/* Customer reviews */}
      <section>
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-2xl font-bold">
              Customer reviews
            </h2>

            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Feedback from customers who purchased this product.
            </p>
          </div>

          <span className="rounded-lg bg-yellow-50 px-3 py-2 font-semibold text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400">
            ★ {product.rating.toFixed(1)} / 5
          </span>
        </div>

        {product.reviews.length === 0 ? (
          <div className="rounded-xl border border-gray-200 p-6 text-center dark:border-gray-700">
            <p className="text-gray-500 dark:text-gray-400">
              No reviews available for this product yet.
            </p>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {product.reviews.map((review, index) => (
              <article
                key={`${review.reviewerName}-${review.date}-${index}`}
                className="card space-y-3 p-5"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="font-semibold">
                      {review.reviewerName}
                    </h3>

                    <time
                      dateTime={review.date}
                      className="text-sm text-gray-500 dark:text-gray-400"
                    >
                      {formatDate(review.date)}
                    </time>
                  </div>

                  <span
                    className="whitespace-nowrap font-medium text-yellow-500"
                    aria-label={`Rated ${review.rating} out of 5`}
                  >
                    ★ {review.rating.toFixed(1)}
                  </span>
                </div>

                <p className="leading-6 text-gray-600 dark:text-gray-300">
                  {review.comment}
                </p>
              </article>
            ))}
          </div>
        )}
      </section>

      {/* Related products */}
      {relatedProducts.length > 0 && (
        <section>
          <div className="mb-6 flex items-center justify-between gap-3">
            <div>
              <h2 className="text-2xl font-bold">
                Related products
              </h2>

              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                You may also like these products.
              </p>
            </div>

            <Link
              to={`/?category=${encodeURIComponent(product.category)}`}
              className="text-sm font-semibold text-primary hover:underline"
            >
              View all
            </Link>
          </div>

          <div className="grid grid-cols-1 gap-4 min-[481px]:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {relatedProducts.map((relatedProduct) => (
              <ProductCard
                key={relatedProduct.id}
                product={relatedProduct}
                onAdd={handleAddToCart}
              />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
