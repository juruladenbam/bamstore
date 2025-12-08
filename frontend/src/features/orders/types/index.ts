import type { Product, ProductVariant } from '../../products/types';

export interface OrderItem {
  id: number;
  order_id: number;
  product_id: number;
  sku?: string;
  quantity: number;
  unit_price_at_order: number;
  recipient_name: string;
  product?: Product;
  variants?: ProductVariant[];
}

export interface Order {
  id: number;
  order_number?: string;
  checkout_name: string;
  phone_number: string;
  qobilah: string;
  payment_method: 'transfer' | 'cash';
  status: string;
  total_amount: number;
  created_at: string;
  items?: OrderItem[];
}
