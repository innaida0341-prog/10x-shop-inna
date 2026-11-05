export type AsyncState<T> =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'success'; data: T }
  | { status: 'error'; message: string };
export const STORAGE_KEYS = {
  cart: 'shop_cart',
  orders: 'shop_orders',
  reviews: 'shop_reviews',
  theme: 'shop_theme',
  user: 'shop_user',
  profile: 'shop_profile'
} as const;