import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  type ReactNode,
} from 'react';
import { cartReducer } from './cart.reducer';
import { Cart } from '../models/Cart';
import { cartStorage } from '../models/storage';
import type { CartItem, CartState } from '../types/cart';

export type AddResult = { ok: true } | { ok: false; message: string };

interface CartContextValue {
  items: CartItem[];
  promoCode: string | null;
  cart: Cart;
  itemCount: number;
  addItem: (item: CartItem, quantity?: number) => AddResult;
  setQuantity: (productId: number, quantity: number) => void;
  removeItem: (productId: number) => void;
  clear: () => void;
  applyPromo: (code: string) => boolean;
  removePromo: () => void;
}

const CartContext = createContext<CartContextValue | null>(null);

function initCart(): CartState {
  return cartStorage.get() ?? { items: [], promoCode: null };
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(cartReducer, undefined, initCart);

  // Side effect (persistence) lives here, not in the pure reducer.
  useEffect(() => {
    cartStorage.set(state);
  }, [state]);

  const promoCode = state.promoCode ?? null;
  const cart = useMemo(() => new Cart(state.items, promoCode), [state.items, promoCode]);

  const addItem = useCallback(
    (item: CartItem, quantity = 1): AddResult => {
      const inCart = state.items.find((i) => i.productId === item.productId)?.quantity ?? 0;
      if (item.stock <= 0) return { ok: false, message: 'This product is out of stock.' };
      if (inCart + quantity > item.stock) {
        return {
          ok: false,
          message:
            inCart > 0
              ? `Only ${item.stock} in stock and you already have ${inCart} in your cart.`
              : `Only ${item.stock} in stock.`,
        };
      }
      dispatch({ type: 'ADD_ITEM', product: item, quantity });
      return { ok: true };
    },
    [state.items],
  );

  const setQuantity = useCallback(
    (productId: number, quantity: number) =>
      dispatch({ type: 'SET_QUANTITY', productId, quantity }),
    [],
  );
  const removeItem = useCallback(
    (productId: number) => dispatch({ type: 'REMOVE_ITEM', productId }),
    [],
  );
  const clear = useCallback(() => dispatch({ type: 'CLEAR' }), []);
  const applyPromo = useCallback((code: string): boolean => {
    if (!Cart.isValidPromo(code)) return false;
    dispatch({ type: 'SET_PROMO', code: code.trim().toUpperCase() });
    return true;
  }, []);
  const removePromo = useCallback(() => dispatch({ type: 'SET_PROMO', code: null }), []);

  const value: CartContextValue = {
    items: state.items,
    promoCode,
    cart,
    itemCount: cart.itemCount,
    addItem,
    setQuantity,
    removeItem,
    clear,
    applyPromo,
    removePromo,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used inside CartProvider');
  return ctx;
}
