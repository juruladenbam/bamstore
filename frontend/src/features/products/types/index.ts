import type { Category } from '../../categories/types';
import type { Vendor } from '../../vendors/types';

export interface ProductVariant {
  id: number;
  product_id: number;
  name: string;
  type: string;
  price_adjustment: number;
}

export interface ProductSku {
  id: number;
  product_id: number;
  sku: string;
  price: number;
  stock: number;
  variant_ids: number[];
}

export interface ProductImage {
  id: number;
  product_id: number;
  image_path: string;
  is_primary: boolean;
  sort_order: number;
}

export interface Product {
  id: number;
  category_id: number;
  vendor_id?: number;
  name: string;
  slug?: string;
  description?: string;
  status: 'ready' | 'pre_order';
  base_price: number;
  image_url?: string;
  images?: ProductImage[];
  category?: Category;
  vendor?: Vendor;
  variants?: ProductVariant[];
  skus?: ProductSku[];
}
