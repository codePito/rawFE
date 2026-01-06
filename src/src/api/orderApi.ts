import axios from "axios";
import axiosClient from "./axiosClient";

// ═══════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════

export interface OrderItemResponse {
    id: number;
    productId: number;
    productName: string;
    unitPrice: number;
    quantity: number;
    total: number;
    variantId?: string;
    variantInfo?: string;
}

export interface OrderResponse {
    id: number;
    userId: number;
    createdAt: string;
    totalAmount: number;
    currency: string;
    shippingAddress?: string;
    status: OrderStatus;
    paymentExpiry?: string;
    items: OrderItemResponse[];
}

// Backend enum OrderStatus
export enum OrderStatus {
    Pending = 0,
    PaymentPending = 1,
    Paid = 2,
    Cancelled = 3,
    Failed = 4
}

// Mapping status number → display text
export const OrderStatusText: Record<number, string> = {
    [OrderStatus.Pending]: 'Chờ xử lý',
    [OrderStatus.PaymentPending]: 'Chờ thanh toán',
    [OrderStatus.Paid]: 'Đã thanh toán',
    [OrderStatus.Cancelled]: 'Đã hủy',
    [OrderStatus.Failed]: 'Thất bại'
};

// Mapping status → Badge variant (theo base UI)
export const OrderStatusVariant: Record<number, 'primary' | 'success' | 'danger' | 'warning'> = {
    [OrderStatus.Pending]: 'warning',
    [OrderStatus.PaymentPending]: 'primary',
    [OrderStatus.Paid]: 'success',
    [OrderStatus.Cancelled]: 'danger',
    [OrderStatus.Failed]: 'danger'
};

export interface OrderRequest {
    userId: number;
    items: { productId: number; quantity: number; variantId?: string }[];
    currency: string;
}

// ═══════════════════════════════════════════════════════════════
// API CALLS
// ═══════════════════════════════════════════════════════════════

const orderApi = {
    /**
     * Tạo đơn hàng mới
     * POST /api/order (số ít)
     */
    create: (data: OrderRequest) => {
        return axiosClient.post<OrderResponse>("/order", data);
    },

    /**
     * Lấy chi tiết đơn hàng theo ID
     * GET /api/order/{id} (số ít)
     */
    getById: (id: number | string) => {
        return axiosClient.get<OrderResponse>(`/order/${id}`);
    },

    /**
     * Lấy danh sách đơn hàng của user
     * GET /user/{userId}
     * ⚠️ Backend dùng absolute path /user/{userId}
     */
    getByUserId: (userId: number | string) => {
        const baseUrl = import.meta.env.VITE_API_URL?.replace('/api', '') || '';
        const token = localStorage.getItem('access_token');
        return axios.get<OrderResponse[]>(`${baseUrl}user/${userId}`, {
            headers: token ? { Authorization: `Bearer ${token}` } : {}
        });
    },

    /**
     * Lấy tất cả orders (ADMIN ONLY)
     * GET /api/orders (số nhiều)
     */
    getAllOrders: () => {
        return axiosClient.get<OrderResponse[]>("/orders");
    },

    // ═══════════════════════════════════════════════════════════════
    // ADMIN ONLY
    // ═══════════════════════════════════════════════════════════════

    /**
     * Xóa đơn hàng (ADMIN)
     * DELETE /api/order/{id} (số ít)
     */
    deleteOrder: (id: number) => {
        return axiosClient.delete(`/order/${id}`);
    },

    /**
     * Cập nhật trạng thái đơn hàng (ADMIN)
     * PATCH /api/order/{id}/status (số ít)
     */
    updateStatus: (id: number, status: OrderStatus) => {
        return axiosClient.patch(`/order/${id}/status`, status, {
            headers: { 'Content-Type': 'application/json' }
        });
    }
};

export default orderApi;
