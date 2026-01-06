import axios from 'axios';

// ═══════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════

export interface TopCustomerStats {
  userId: number;
  userName: string;
  email: string;
  totalOrders: number;
  totalSpent: number;
}

export interface ProductSalesMonthlyStats {
  month: string;
  totalProducts: number;
  totalOrders: number;
  year: number;
}

// ═══════════════════════════════════════════════════════════════
// API CONFIG
// ═══════════════════════════════════════════════════════════════

const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://localhost:7122/api';

// Tạo axios instance với auth header
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Interceptor: Tự động attach Authorization header
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ═══════════════════════════════════════════════════════════════
// API CALLS
// ═══════════════════════════════════════════════════════════════

const analyticsApi = {
  // Lấy top khách hàng mua nhiều nhất
  getTopCustomers: (top: number = 10) => {
    return apiClient.get<TopCustomerStats[]>(
      `/orders/stats/top-customers?top=${top}`
    );
  },

  // Lấy thống kê sản phẩm bán ra theo tháng
  getProductSalesMonthly: (year?: number) => {
    const currentYear = year || new Date().getFullYear();
    return apiClient.get<ProductSalesMonthlyStats[]>(
      `/orders/stats/products-monthly?year=${currentYear}`
    );
  },

  // Lấy tổng doanh thu
  getTotalRevenue: () => {
    return apiClient.get<{ total: number }>('/order/revenue');
  },

  // Lấy tổng số đơn hàng
  getTotalOrders: () => {
    return apiClient.get<{ total: number }>('/order/count');
  },

  // Lấy tổng số users
  getTotalUsers: () => {
    return apiClient.get<{ total: number }>('/user/count');
  },

  // Lấy tổng số products
  getTotalProducts: () => {
    return apiClient.get<{ total: number }>('/product/count');
  }
};

export default analyticsApi;
