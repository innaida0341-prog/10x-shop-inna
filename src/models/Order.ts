import type { Cart } from './Cart';
import type { Order, OrderStatus, ShippingInfo } from '../types/order';

export class OrderService {
  /** Builds a local order from the current cart. `sequence` = existing orders + 1. */
  static create(
    cart: Cart,
    shipping: ShippingInfo,
    sequence: number,
    now: Date = new Date(),
  ): Order {
    return {
      id: now.getTime(),
      number: `10X-${String(sequence).padStart(5, '0')}`,
      items: cart.getItems(),
      shipping,
      subtotal: cart.subtotal(),
      discount: cart.discount(),
      shippingCost: cart.shipping(),
      total: cart.total(),
      placedAt: now.toISOString(),
    };
  }

  /** Status is derived from elapsed time, never stored. */
  static getStatus(order: Order, now: Date = new Date()): OrderStatus {
    const minutes = (now.getTime() - new Date(order.placedAt).getTime()) / 60000;
    if (minutes < 1) return 'Processing';
    if (minutes <= 3) return 'Shipped';
    return 'Delivered';
  }
}
