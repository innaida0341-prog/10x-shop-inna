import { StorageService } from './StorageService';
import type { CartState } from '../types/cart';
import type { Order } from '../types/order';
import type { Review } from '../types/product';
import type { AuthUser } from '../types/user';
import {
  isAuthUser,
  isCartState,
  isOrderList,
  isReviewMap,
  isTheme,
  type Theme,
} from '../utils/guards';

export const STORAGE_KEYS = {
  cart: 'shop_cart',
  orders: 'shop_orders',
  reviews: 'shop_reviews',
  theme: 'shop_theme',
  user: 'shop_user',
} as const;

export const cartStorage = new StorageService<CartState>(STORAGE_KEYS.cart, isCartState);
export const ordersStorage = new StorageService<Order[]>(STORAGE_KEYS.orders, isOrderList);
export const reviewsStorage = new StorageService<Record<string, Review[]>>(
  STORAGE_KEYS.reviews,
  isReviewMap,
);
export const themeStorage = new StorageService<Theme>(STORAGE_KEYS.theme, isTheme);
export const userStorage = new StorageService<AuthUser>(STORAGE_KEYS.user, isAuthUser);
