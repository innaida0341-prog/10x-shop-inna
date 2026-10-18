import type { CartAction, CartState } from '../types/cart';

export function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case 'ADD_ITEM': {
      const qty = action.quantity ?? 1;
      const existing = state.items.find((i) => i.productId === action.product.productId);
      const newQty = (existing?.quantity ?? 0) + qty;
      if (qty < 1 || newQty > action.product.stock) return state;
      const items = existing
        ? state.items.map((i) =>
            i.productId === existing.productId ? { ...i, quantity: newQty } : i,
          )
        : [...state.items, { ...action.product, quantity: newQty }];
      return { ...state, items };
    }
    case 'REMOVE_ITEM':
      return { ...state, items: state.items.filter((i) => i.productId !== action.productId) };
    case 'SET_QUANTITY':
      return {
        ...state,
        items: state.items.map((i) =>
          i.productId === action.productId
            ? { ...i, quantity: Math.min(Math.max(1, action.quantity), i.stock) }
            : i,
        ),
      };
    case 'CLEAR':
      return { items: [], promoCode: null };
    case 'SET_PROMO':
      return { ...state, promoCode: action.code };
    case 'LOAD':
      return action.state;
    default: {
      const _exhaustive: never = action;
      return _exhaustive;
    }
  }
}
