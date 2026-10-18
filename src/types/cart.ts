export interface CartItem {
  productId: number;
  title: string;
  thumbnail: string;
  price: number;
  discountPercentage: number;
  stock: number;
  quantity: number;
}

export interface CartState {
  items: CartItem[];
  promoCode?: string | null;
}

export type CartAction =
  | { type: 'ADD_ITEM'; product: CartItem; quantity?: number }
  | { type: 'REMOVE_ITEM'; productId: number }
  | { type: 'SET_QUANTITY'; productId: number; quantity: number }
  | { type: 'CLEAR' }
  | { type: 'SET_PROMO'; code: string | null }
  | { type: 'LOAD'; state: CartState };
