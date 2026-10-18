import type { CartItem } from '../types/cart';
import { discountedPrice } from '../utils/format';

export interface ICart {
  subtotal(): number;
  discount(): number;
  shipping(): number;
  total(): number;
}

const round2 = (n: number): number => Math.round(n * 100) / 100;

export class Cart implements ICart {
  static readonly FREE_SHIPPING_FROM = 100;
  static readonly SHIPPING_COST = 10;
  static readonly PROMO_CODE = '10X10';
  static readonly PROMO_PERCENT = 10;

  constructor(
    private readonly items: readonly CartItem[],
    private readonly promoCode: string | null,
  ) {}

  static isValidPromo(code: string): boolean {
    return code.trim().toUpperCase() === Cart.PROMO_CODE;
  }

  get itemCount(): number {
    return this.items.reduce((n, i) => n + i.quantity, 0);
  }

  getItems(): CartItem[] {
    return [...this.items];
  }

  hasPromo(): boolean {
    return this.promoCode !== null && Cart.isValidPromo(this.promoCode);
  }

  static unitPrice(item: CartItem): number {
    return discountedPrice(item.price, item.discountPercentage);
  }

  static lineTotal(item: CartItem): number {
    return round2(Cart.unitPrice(item) * item.quantity);
  }

  subtotal(): number {
    return round2(this.items.reduce((sum, i) => sum + Cart.lineTotal(i), 0));
  }

  discount(): number {
    return this.hasPromo() ? round2((this.subtotal() * Cart.PROMO_PERCENT) / 100) : 0;
  }

  shipping(): number {
    if (this.items.length === 0) return 0;
    return this.subtotal() - this.discount() >= Cart.FREE_SHIPPING_FROM
      ? 0
      : Cart.SHIPPING_COST;
  }

  total(): number {
    return round2(this.subtotal() - this.discount() + this.shipping());
  }
}
