import type { CartItem, CartState } from '../types/cart';
import type { Order } from '../types/order';
import type { Review } from '../types/product';
import type { AuthUser } from '../types/user';

export type Theme = 'light' | 'dark';

export function isRecord(x: unknown): x is Record<string, unknown> {
  return typeof x === 'object' && x !== null && !Array.isArray(x);
}

export function isCartItem(x: unknown): x is CartItem {
  return (
    isRecord(x) &&
    typeof x.productId === 'number' &&
    typeof x.title === 'string' &&
    typeof x.thumbnail === 'string' &&
    typeof x.price === 'number' &&
    typeof x.discountPercentage === 'number' &&
    typeof x.stock === 'number' &&
    typeof x.quantity === 'number'
  );
}

export function isCartState(x: unknown): x is CartState {
  return (
    isRecord(x) &&
    Array.isArray(x.items) &&
    x.items.every(isCartItem) &&
    (x.promoCode === undefined ||
      x.promoCode === null ||
      typeof x.promoCode === 'string')
  );
}

export function isOrder(x: unknown): x is Order {
  return (
    isRecord(x) &&
    typeof x.id === 'number' &&
    typeof x.number === 'string' &&
    Array.isArray(x.items) &&
    x.items.every(isCartItem) &&
    isRecord(x.shipping) &&
    typeof x.subtotal === 'number' &&
    typeof x.discount === 'number' &&
    typeof x.shippingCost === 'number' &&
    typeof x.total === 'number' &&
    typeof x.placedAt === 'string'
  );
}

export function isOrderList(x: unknown): x is Order[] {
  return Array.isArray(x) && x.every(isOrder);
}

export function isReview(x: unknown): x is Review {
  return (
    isRecord(x) &&
    typeof x.rating === 'number' &&
    typeof x.comment === 'string' &&
    typeof x.date === 'string' &&
    typeof x.reviewerName === 'string'
  );
}

export function isReviewMap(x: unknown): x is Record<string, Review[]> {
  return (
    isRecord(x) &&
    Object.values(x).every((v) => Array.isArray(v) && v.every(isReview))
  );
}

export function isAuthUser(x: unknown): x is AuthUser {
  return (
    isRecord(x) &&
    typeof x.username === 'string' &&
    typeof x.isLoggedIn === 'boolean'
  );
}

export function isTheme(x: unknown): x is Theme {
  return x === 'light' || x === 'dark';
}
