import { ordersStorage } from './storage';
import type { Order } from '../types/order';

export function loadOrders(): Order[] {
  return ordersStorage.get() ?? [];
}

export function saveOrder(order: Order): void {
  ordersStorage.set([order, ...loadOrders()]);
}
