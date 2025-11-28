export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  discount?: number;
  images: string[];
  category: string;
  rating: number;
  reviewCount: number;
  soldCount: number;
  stock: number;
  specifications?: Record<string, string>;
}
export interface CartItem {
  product: Product;
  quantity: number;
}
export interface Category {
  id: string;
  name: string;
  icon: string;
}
export interface User {
  id: string;
  email: string;
  fullName: string;
  phone?: string;
  createdAt: Date;
}
export interface LoginCredentials {
  email: string;
  password: string;
}
export interface RegisterData {
  email: string;
  password: string;
  fullName: string;
  phone?: string;
}
export interface CheckoutFormData {
  fullName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  postalCode: string;
  paymentMethod: 'cod' | 'card' | 'ewallet';
}
export interface Order {
  id: string;
  items: CartItem[];
  total: number;
  shippingFee: number;
  customerInfo: CheckoutFormData;
  createdAt: Date;
  status: 'pending' | 'processing' | 'shipped' | 'delivered';
}
export type SortOption = 'popular' | 'price-asc' | 'price-desc' | 'rating';
export interface FilterOptions {
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  minRating?: number;
  sortBy?: SortOption;
}