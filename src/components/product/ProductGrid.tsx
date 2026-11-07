
import { ProductCard } from './ProductCard';
import type { Product } from '../../types/product';

interface ProductGridProps {
  products: Product[];
  onAdd: (product: Product) => void;
}

export function ProductGrid({ products, onAdd }: ProductGridProps) {
  return (
    <div className="grid grid-cols-1 gap-4 min-[481px]:grid-cols-2 lg:grid-cols-3 min-[1025px]:grid-cols-4">
      {products.map((product) => (
        <ProductCard
          key={product.id}
          product={product}
          onAdd={onAdd}
        />
      ))}
    </div>
  );
}
