import type { Product, ProductVariant } from '../../products/types';

export interface CartItem {
  product: Product;
  variants: ProductVariant[];
  quantity: number;
  recipient_name: string;
  recipient_phone?: string;
  recipient_qobilah?: string;
  unit_price: number;
  sku_id?: number;
}
