// ============================================================
// Product Types
// ============================================================
export interface Product {
  id: string
  name: string
  slug: string
  description: string | null
  short_description: string | null
  price: number
  cheese_type: string | null
  weight_options: WeightOption[]
  images: string[]
  in_stock: boolean
  stock_quantity: number
  featured: boolean
  sort_order: number
  created_at: string
  updated_at: string
}

export interface WeightOption {
  label: string   // e.g. "250g", "500g", "1kg"
  price: number   // price override, or 0 to use base price
}

export interface ProductFilters {
  search?: string
  cheese_type?: string
  min_price?: number
  max_price?: number
  in_stock?: boolean
  sort?: 'price_asc' | 'price_desc' | 'newest' | 'popular' | 'name'
}

// ============================================================
// Cart Types
// ============================================================
export interface CartItem {
  product_id: string
  product_name: string
  product_image: string | null
  price: number
  quantity: number
  weight_option?: string
}

export interface Cart {
  items: CartItem[]
  subtotal: number
  delivery_cost: number
  total: number
}

// ============================================================
// Order Types
// ============================================================
export type OrderStatus = 'pending' | 'confirmed' | 'shipped' | 'completed' | 'cancelled'

export interface Order {
  id: string
  order_number: string
  customer_name: string
  customer_email: string
  customer_phone: string | null
  delivery_address: string
  delivery_city: string
  delivery_postal_code: string
  notes: string | null
  status: OrderStatus
  subtotal: number
  delivery_cost: number
  total_amount: number
  created_at: string
  updated_at: string
  items?: OrderItem[]
}

export interface OrderItem {
  id: string
  order_id: string
  product_id: string | null
  product_name: string
  product_image: string | null
  weight_option: string | null
  unit_price: number
  quantity: number
  subtotal: number
}

// ============================================================
// Checkout Types
// ============================================================
export interface CheckoutFormData {
  customer_name: string
  customer_email: string
  customer_phone: string
  delivery_address: string
  delivery_city: string
  delivery_postal_code: string
  notes?: string
}

// ============================================================
// Admin Types
// ============================================================
export interface AdminUser {
  id: string
  email: string
  name: string | null
  created_at: string
}

export interface AdminSession {
  id: string
  email: string
  name: string | null
}

// ============================================================
// API Response Types
// ============================================================
export interface ApiResponse<T = unknown> {
  data?: T
  error?: string
  message?: string
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

// ============================================================
// Dashboard Stats
// ============================================================
export interface DashboardStats {
  total_orders: number
  pending_orders: number
  total_revenue: number
  total_products: number
  out_of_stock: number
  recent_orders: Order[]
}
