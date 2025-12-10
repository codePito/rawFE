// User Types
export interface User {
  id: string;
  email: string;
  fullName: string;
  phone?: string;
  avatar?: string;
  role: 'admin' | 'user' | 'seller';
  status: 'active' | 'locked';
  createdAt: Date;
  lastLogin?: Date;
}

// Product Types
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
  stock: number;
  sku: string;
  status: 'active' | 'inactive' | 'out_of_stock';
  createdAt: Date;
  updatedAt: Date;
}

// Order Types
export interface OrderItem {
  id: number;
  productId: number;
  productName: string;
  unitPrice: number;
  quantity: number;
  total: number;
}
export interface Order {
  id: string;
  orderNumber: string;
  userId: string;
  userName: string;
  userEmail: string;
  items: OrderItem[];
  subtotal: number;
  shippingFee: number;
  total: number;
  status: 'pending' | 'processing' | 'shipping' | 'delivered' | 'cancelled';
  paymentMethod: 'cod' | 'card' | 'ewallet';
  paymentStatus: 'pending' | 'paid' | 'refunded';
  shippingAddress: {
    fullName: string;
    phone: string;
    address: string;
    city: string;
    postalCode: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

// Category Types
export interface Category {
  id: string;
  name: string;
  slug: string;
  icon: string;
  description?: string;
  productCount: number;
  status: 'active' | 'inactive';
  createdAt: Date;
}

// Seller Types
export interface Seller {
  id: string;
  businessName: string;
  ownerName: string;
  email: string;
  phone: string;
  address: string;
  status: 'pending' | 'approved' | 'rejected' | 'suspended';
  totalProducts: number;
  totalRevenue: number;
  rating: number;
  createdAt: Date;
}

// Coupon Types
export interface Coupon {
  id: string;
  code: string;
  description: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  minPurchase?: number;
  maxDiscount?: number;
  usageLimit?: number;
  usedCount: number;
  startDate: Date;
  endDate: Date;
  status: 'active' | 'inactive' | 'expired';
  createdAt: Date;
}

// Dashboard Stats
export interface DashboardStats {
  totalRevenue: number;
  revenueGrowth: number;
  totalOrders: number;
  ordersGrowth: number;
  totalUsers: number;
  usersGrowth: number;
  totalProducts: number;
  productsGrowth: number;
}
export interface RevenueData {
  month: string;
  revenue: number;
  orders: number;
}
export interface OrderStatusData {
  status: string;
  count: number;
  color: string;
}

// Pagination
export interface PaginationParams {
  page: number;
  limit: number;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}
export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}