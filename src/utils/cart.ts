import type { CartItem } from '../types/cart';
import type { Product } from '../types/product';

export function toCartItem(product: Product, quantity = 1): CartItem {
  return {
    productId: product.id,
    title: product.title,
    thumbnail: product.thumbnail,
    price: product.price,
    discountPercentage: product.discountPercentage,
    stock: product.stock,
    quantity,
  };
}
