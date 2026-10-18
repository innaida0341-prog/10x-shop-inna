import type { CartItem } from './cart';

export type OrderStatus = 'Processing' | 'Shipped' | 'Delivered';

export interface ShippingInfo {
  fullName: string;
  email: string;
  address: string;
  city: string;
  phone?: string;
  postalCode?: string;
  country?: string;
}

export interface Order {
  id: number;
  number: string;
  items: CartItem[];
  shipping: ShippingInfo;
  subtotal: number;
  discount: number;
  shippingCost: number;
  total: number;
  placedAt: string;
}

export interface CheckoutFormValues {
  fullName: string;
  email: string;
  address: string;
  city: string;
  phone: string;
  postalCode: string;
  country: string;
}
