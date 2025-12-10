import { Product, Order, User, Category, Seller, Coupon, DashboardStats, RevenueData, OrderStatusData } from '../types';

// Dashboard Stats
export const mockDashboardStats: DashboardStats = {
  totalRevenue: 125430,
  revenueGrowth: 12.5,
  totalOrders: 1543,
  ordersGrowth: 8.3,
  totalUsers: 8234,
  usersGrowth: 15.2,
  totalProducts: 456,
  productsGrowth: 5.7
};
export const mockRevenueData: RevenueData[] = [{
  month: 'Jan',
  revenue: 45000,
  orders: 234
}, {
  month: 'Feb',
  revenue: 52000,
  orders: 267
}, {
  month: 'Mar',
  revenue: 48000,
  orders: 245
}, {
  month: 'Apr',
  revenue: 61000,
  orders: 312
}, {
  month: 'May',
  revenue: 55000,
  orders: 289
}, {
  month: 'Jun',
  revenue: 67000,
  orders: 345
}];
export const mockOrderStatusData: OrderStatusData[] = [{
  status: 'Pending',
  count: 145,
  color: '#fbbf24'
}, {
  status: 'Processing',
  count: 234,
  color: '#3b82f6'
}, {
  status: 'Shipping',
  count: 189,
  color: '#6366f1'
}, {
  status: 'Delivered',
  count: 876,
  color: '#10b981'
}, {
  status: 'Cancelled',
  count: 99,
  color: '#ef4444'
}];

// Products
export const mockProducts: Product[] = [];

// Orders
export const mockOrders: Order[] = Array.from({
  length: 100
}, (_, i) => ({
  id: `order-${i + 1}`,
  orderNumber: `ORD-${10000 + i}`,
  userId: `user-${Math.floor(Math.random() * 100)}`,
  userName: `Customer ${i + 1}`,
  userEmail: `customer${i + 1}@example.com`,
  items: [{
    productId: `prod-${Math.floor(Math.random() * 50) + 1}`,
    productName: `Product ${Math.floor(Math.random() * 50) + 1}`,
    productImage: `https://images.unsplash.com/photo-${1500000000000 + i}?w=100`,
    quantity: Math.floor(Math.random() * 3) + 1,
    price: Math.floor(Math.random() * 200) + 20
  }],
  subtotal: Math.floor(Math.random() * 500) + 50,
  shippingFee: 5.99,
  total: Math.floor(Math.random() * 500) + 55.99,
  status: ['pending', 'processing', 'shipping', 'delivered', 'cancelled'][Math.floor(Math.random() * 5)] as any,
  paymentMethod: ['cod', 'card', 'ewallet'][Math.floor(Math.random() * 3)] as any,
  paymentStatus: ['pending', 'paid', 'refunded'][Math.floor(Math.random() * 3)] as any,
  shippingAddress: {
    fullName: `Customer ${i + 1}`,
    phone: '+1 234 567 8900',
    address: '123 Main St',
    city: 'New York',
    postalCode: '10001'
  },
  createdAt: new Date(2024, 0, Math.floor(Math.random() * 30) + 1),
  updatedAt: new Date()
}));

// Users
export const mockUsers: User[] = Array.from({
  length: 50
}, (_, i) => ({
  id: `user-${i + 1}`,
  email: `user${i + 1}@example.com`,
  fullName: `User ${i + 1}`,
  phone: '+1 234 567 8900',
  avatar: undefined,
  role: ['admin', 'user', 'seller'][Math.floor(Math.random() * 3)] as any,
  status: Math.random() > 0.1 ? 'active' : 'locked',
  createdAt: new Date(2024, 0, Math.floor(Math.random() * 30) + 1),
  lastLogin: new Date()
}));

// Categories
export const mockCategories: Category[] = [];

// Coupons
export const mockCoupons: Coupon[] = Array.from({
  length: 20
}, (_, i) => ({
  id: `coupon-${i + 1}`,
  code: `SAVE${10 + i * 5}`,
  description: `Get ${10 + i * 5}% off on your purchase`,
  discountType: Math.random() > 0.5 ? 'percentage' : 'fixed',
  discountValue: 10 + i * 5,
  minPurchase: 50,
  maxDiscount: 100,
  usageLimit: 1000,
  usedCount: Math.floor(Math.random() * 500),
  startDate: new Date(2024, 0, 1),
  endDate: new Date(2024, 11, 31),
  status: ['active', 'inactive', 'expired'][Math.floor(Math.random() * 3)] as any,
  createdAt: new Date(2024, 0, Math.floor(Math.random() * 30) + 1)
}));