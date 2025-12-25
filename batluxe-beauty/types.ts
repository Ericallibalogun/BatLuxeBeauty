
export enum UserRole {
  ADMIN = 'ADMIN',
  USER = 'USER'
}

export interface DecodedUser {
  email: string;
  role: UserRole;
  exp: number;
}

export interface AuthState {
  token: string | null;
  user: DecodedUser | null;
  loading: boolean;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  stock: number;
  image_url: string;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone_number: string;
  role: string;
}

export interface ShippingAddress {
  street: string;
  city: string;
  state: string;
  country: string;
  postal_code: string;
}

export interface Order {
  id: string;
  customer_name: string;
  customer_email: string;
  customer_phone?: string;
  total_amount: number;
  total_price?: number; // Backend might use this field
  subtotal?: number;
  shipping_fee?: number;
  status: 'Pending' | 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled';
  created_at: string;
  updated_at?: string;
  items_count: number;
  items?: OrderItem[];
  shipping_address?: ShippingAddress;
}

export interface OrderItem {
  id?: string;
  product_id: string;
  product_name: string;
  price: number;
  quantity: number;
  product?: Product;
}

export interface SalesData {
  label: string;
  value: number;
}

export interface DashboardAnalytics {
  total_revenue: number;
  daily_sales: number;
  top_products: { name: string; sales: number }[];
  sales_trend: SalesData[];
}

export interface CartItem {
  id: string;
  product_id: string;
  product: Product;
  quantity: number;
}

export interface WishlistItem {
  id: string;
  product_id: string;
  product: Product;
}
