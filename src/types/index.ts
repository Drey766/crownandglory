// ============================================================
// All shared TypeScript interfaces for the salon website
// ============================================================

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  original_price?: number;
  images: string[];
  category: "wigs" | "extensions" | "lace-closures" | "lashes";
  hair_type?: string;       // "body-wave" | "water-wave" | "straight" | etc.
  is_raw: boolean;          // Raw human hair flag
  in_stock: boolean;
  stock_count?: number;
  is_featured: boolean;
  is_new: boolean;
  rating: number;
  review_count: number;
  created_at: string;
  updated_at: string;
}

export interface Service {
  id: string;
  name: string;
  description: string;
  category: "wig-services" | "washing-styling" | "braiding" | "coloring" | "lashes";
  duration_min: number;     // Duration in minutes e.g. 60, 90, 120
  price: number;            // KES
  deposit: number;          // KES deposit required to book (0 = no deposit)
  image?: string;
  active: boolean;
  created_at: string;
}

export interface Appointment {
  id: string;
  user_id?: string;
  service_id: string;
  service_name: string;     // Snapshot in case service is deleted
  service_price: number;
  client_name: string;
  client_phone: string;
  client_email?: string;
  appointment_date: string; // YYYY-MM-DD
  appointment_time: string; // HH:MM
  notes?: string;
  status: "pending" | "confirmed" | "completed" | "cancelled" | "no_show";
  deposit_paid: boolean;
  deposit_amount: number;
  mpesa_code?: string;
  created_at: string;
  updated_at: string;
  // Joined fields
  service?: Service;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface Order {
  id: string;
  user_id?: string;
  items: CartItem[];
  subtotal: number;
  shipping_fee: number;
  total: number;
  status: "pending" | "paid" | "processing" | "shipped" | "delivered" | "cancelled";
  mpesa_code?: string;
  delivery_address: DeliveryAddress;
  customer_name: string;
  customer_phone: string;
  customer_email?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface DeliveryAddress {
  county: string;
  town: string;
  street: string;
  building?: string;
}

export interface UserProfile {
  id: string;
  email: string;
  full_name?: string;
  phone?: string;
  avatar_url?: string;
  role: "customer" | "admin";
  created_at: string;
}

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;         // Full HTML content
  cover_image: string;
  author: string;
  read_time: number;       // Minutes
  published: boolean;
  created_at: string;
  updated_at: string;
}

export interface Review {
  id: string;
  product_id: string;
  user_id: string;
  rating: number;
  comment: string;
  author_name: string;
  created_at: string;
}

export interface NewsletterSubscriber {
  id: string;
  email: string;
  created_at: string;
}

// Filter state used across shop page
export interface ShopFilters {
  category: string;
  hair_type: string;
  min_price: number;
  max_price: number;
  in_stock_only: boolean;
  sort: "newest" | "price_asc" | "price_desc" | "popular";
  search: string;
}
