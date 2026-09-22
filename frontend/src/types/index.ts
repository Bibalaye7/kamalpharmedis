export type Role = "admin" | "manager" | "client";

export interface User {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  role_name: Role;
  is_active: boolean;
  created_at: string;
}

export interface Category {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  icon: string | null;
  products_count?: number;
}

export interface Product {
  id: number;
  category_id: number;
  category?: Category;
  name: string;
  slug: string;
  sku: string;
  short_description: string | null;
  description: string | null;
  price: number;
  old_price: number | null;
  stock: number;
  images: string[];
  image: string | null;
  is_featured: boolean;
  is_active: boolean;
  related?: Product[];
  created_at: string;
}

export interface Address {
  id: number;
  label: string;
  full_name: string;
  phone: string;
  line1: string;
  line2: string | null;
  city: string;
  region: string | null;
  country: string;
  is_default: boolean;
}

export interface CartItem {
  id: number;
  product_id: number;
  quantity: number;
  product: Product;
}

export interface Cart {
  items: CartItem[];
  count: number;
  subtotal: number;
  shipping_fee: number;
  total: number;
  free_shipping_threshold: number;
}

export type OrderStatus =
  | "pending"
  | "confirmed"
  | "processing"
  | "shipped"
  | "delivered"
  | "cancelled";

export interface OrderItem {
  id: number;
  product_id: number | null;
  product_name: string;
  unit_price: number;
  quantity: number;
  total: number;
  product?: Product;
}

export interface Order {
  id: number;
  reference: string;
  user_id: number;
  user?: User;
  status: OrderStatus;
  payment_method: string;
  payment_status: "unpaid" | "paid" | "refunded";
  subtotal: number;
  shipping_fee: number;
  total: number;
  shipping_name: string;
  shipping_phone: string;
  shipping_address: string;
  shipping_city: string;
  notes: string | null;
  items: OrderItem[];
  created_at: string;
  delivered_at: string | null;
}

export interface ContactMessage {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  subject: string;
  message: string;
  is_read: boolean;
  created_at: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
}

export interface AdminStats {
  totals: {
    revenue: number;
    revenue_month: number;
    orders: number;
    pending_orders: number;
    products: number;
    low_stock: number;
    clients: number;
  };
  orders_by_status: Record<OrderStatus, number>;
  monthly: { month: string; label: string; revenue: number; orders: number }[];
  top_products: { product_id: number; product_name: string; sold: number; revenue: number }[];
  recent_orders: Order[];
  low_stock_products: Product[];
}
