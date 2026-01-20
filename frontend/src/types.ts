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

export interface ProductCost {
  id: number;
  product_id: number;
  cost: number;
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
  cost?: ProductCost;
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
  discount_amount?: number;
  grand_total?: number;
  coupon_code?: string;
  coupon_id?: number;
  created_at: string;
  items?: OrderItem[];
  // Edit tracking fields
  price_adjustment_status?: 'none' | 'overpaid' | 'underpaid';
  price_adjustment_amount?: number;
  last_edited_at?: string;
  last_edited_by?: number;
  last_editor?: User;
  coupon?: {
    id: number;
    code: string;
    type: 'fixed' | 'percent';
    value: number;
  };
}

export interface OrderEditLog {
  id: number;
  order_id: number;
  user_id: number;
  user?: User;
  action: 'update_info' | 'add_item' | 'remove_item' | 'update_item' | 'update_status' | 'recalculate_discount' | 'adjustment_resolved';
  field_name: string | null;
  old_value: string | null;
  new_value: string | null;
  metadata: Record<string, any> | null;
  description?: string;
  created_at: string;
}

export interface Notification {
  id: string;
  type: string;
  notifiable_type: string;
  notifiable_id: number;
  data: {
    order_id: number;
    order_number: string;
    customer_name: string;
    message: string;
  };
  read_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface Role {
  id: number;
  name: string;
  guard_name: string;
  created_at: string;
  updated_at: string;
}

export interface User {
  id: number;
  name: string;
  email: string;
  roles?: Role[];
  created_at: string;
  updated_at: string;
}
