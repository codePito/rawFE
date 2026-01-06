export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  discount?: number;
  images: string[];
  category: string;
  categoryName?: string;
  rating: number;
  reviewCount: number;
  soldCount: number;
  
  // ✅ STOCK MANAGEMENT
  stock: number;
  isAvailable: boolean;
  isLowStock?: boolean;
  isOutOfStock?: boolean;
  lowStockThreshold?: number;
  
  // ✅ VARIANTS
  variants?: ProductVariants;
  
  specifications?: Record<string, string>;
}

// ✅ VARIANT TYPES
export interface ProductVariantOption {
  id: string;
  color?: string;
  size?: string;
  stock: number;
  priceAdjustment: number;
  sku?: string;
}

export interface ProductVariants {
  hasVariants: boolean;
  options: ProductVariantOption[];
}

export interface CartItem {
  id: string;
  product: Product;
  quantity: number;
  variantId?: string;
  variantInfo?: string;
}

export interface Category {
  id: string;
  name: string;
  icon?: string;
  imageUrl?: string;
}

export interface User {
  id: string;
  email: string;
  fullName: string;
  createdAt: Date;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  userName: string;
  address: string;
}

export interface CheckoutFormData {
  fullName: string;
  email: string;
  address: string;
  city: string;
  postalCode: string;
  paymentMethod: 'cod' | 'card' | 'ewallet';
}

export interface Order {
  id: number;
  userId: number;
  createdAt: string;
  totalAmount: number;
  currency: string;
  shippingAddress?: string;
  status: 'Pending' | 'PaymentPending' | 'Paid' | 'Cancelled' | 'Failed';
  items: OrderItem[];
}

export interface OrderItem {
  id: number;
  productId: number;
  productName: string;
  unitPrice: number;
  quantity: number;
  total: number;
}

export interface OrderItemRequest {
  productId: number;
  quantity: number;
  variantId?: string;
}

export interface OrderRequest {
  userId: number;
  items: OrderItemRequest[];
  currency: string;
  shippingAddress: string;
}

export interface MomoPaymentRequest {
  orderId: number;
  returnUrl: string;
  notifyUrl: string;
}

export interface MomoPaymentResponse {
  orderId: number;
  payUrl: string;
  requestId: string;
  message: string;
}

export type SortOption = 'popular' | 'price-asc' | 'price-desc' | 'rating';

export interface FilterOptions {
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  minRating?: number;
  sortBy?: SortOption;
}

// ✅ IMAGE REQUEST - Dùng cho Admin khi tạo product
export interface ImageRequest {
  filePath: string;
  isPrimary: boolean;
}

export interface ProductRequest {
  name: string;
  description: string;
  price: number;
  categoryId: string;
  stockQuantity: number;
  lowStockThreshold?: number;
  images?: ImageRequest[];
}