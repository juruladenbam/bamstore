export interface Category {
  id: number;
  name: string;
  slug: string;
}

export interface Vendor {
  id: number;
  name: string;
  slug?: string;
  contact_info?: string;
  address?: string;
}

export interface ProductVariant {
  id: number;
  product_id: number;
  name: string;
  type: string;
  price_adjustment: number; // string in JSON usually, but number in TS
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
