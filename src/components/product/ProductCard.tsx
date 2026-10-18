import { memo } from 'react';
import { Link } from 'react-router-dom';
import { PriceBlock } from './PriceBlock';
import { StockBadge } from './StockBadge';
import type { Product } from '../../types/product';

interface ProductCardProps {
  product: Product;
  onAdd: (product: Product) => void;
}

export const ProductCard = memo(function ProductCard({ product, onAdd }: ProductCardProps) {
  const outOfStock = product.stock <= 0;
  return (
    <article className="card flex flex-col overflow-hidden">
      <Link
        to={`/products/${product.id}`}
        className="block bg-gray-100 dark:bg-gray-700"
        aria-label={`View ${product.title}`}
      >
        <img
          src={product.thumbnail}
          alt={product.title}
          width={300}
          height={300}
          loading="lazy"
          className="aspect-square w-full object-contain"
        />
      </Link>
      <div className="flex flex-1 flex-col gap-2 p-4">
        <h3 className="line-clamp-2 font-semibold">
          <Link to={`/products/${product.id}`} className="hover:text-primary">
            {product.title}
          </Link>
        </h3>
        <p className="text-sm capitalize text-gray-500 dark:text-gray-400">
          {product.category}
          {product.brand ? ` · ${product.brand}` : ''}
        </p>
        <PriceBlock price={product.price} discountPercentage={product.discountPercentage} />
        <div className="flex items-center justify-between">
          <span className="text-sm">★ {product.rating.toFixed(1)}</span>
          <StockBadge stock={product.stock} />
        </div>
        <button
          type="button"
          onClick={() => onAdd(product)}
          disabled={outOfStock}
          className="btn-primary mt-auto"
        >
          {outOfStock ? 'Out of stock' : 'Add to cart'}
        </button>
      </div>
    </article>
  );
});
