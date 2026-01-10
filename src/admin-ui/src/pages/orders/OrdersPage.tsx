import { useState, useEffect, useCallback } from 'react';
import { Filter, Eye, RefreshCw, Package, AlertCircle } from 'lucide-react';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { Pagination } from '../../components/common/Pagination';
import { formatCurrency, formatDate } from '../../utils/formatters';
import orderAdminApi, {
    AdminOrderResponse,
    OrderStatus,
    OrderStatusText,
    OrderStatusColor
} from '../../services/orderAdminApi';

const ITEMS_PER_PAGE = 10;

export function OrdersPage() {
    // State
    const [orders, setOrders] = useState<AdminOrderResponse[]>([]);
    const [filteredOrders, setFilteredOrders] = useState<AdminOrderResponse[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [statusFilter, setStatusFilter] = useState<number | 'all'>('all');
    const [currentPage, setCurrentPage] = useState(1);

    // Modal state
    const [selectedOrder, setSelectedOrder] = useState<AdminOrderResponse | null>(null);
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
    const [isUpdating, setIsUpdating] = useState(false);

    // ═══════════════════════════════════════════════════════════════
    // FETCH ORDERS
    // ═══════════════════════════════════════════════════════════════
    const fetchOrders = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const res = await orderAdminApi.getAll();

            // Defensive: xử lý nhiều dạng response
            const data = res?.data;
            if (Array.isArray(data)) {
                setOrders(data);
                setFilteredOrders(data);
            } else {
                setOrders([]);
                setFilteredOrders([]);
            }
        } catch (err: any) {
            console.error('Failed to fetch orders:', err);
            if (err?.response?.status === 401) {
                setError('Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.');
            } else if (err?.response?.status === 403) {
                setError('Bạn không có quyền truy cập trang này.');
            } else {
                setError('Không thể tải danh sách đơn hàng.');
            }
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchOrders();
    }, [fetchOrders]);

    // ═══════════════════════════════════════════════════════════════
    // FILTER & SEARCH
    // ═══════════════════════════════════════════════════════════════
    useEffect(() => {
        let result = [...orders];

        // Filter by status
        if (statusFilter !== 'all') {
            result = result.filter(o => o.status === statusFilter);
        }

        setFilteredOrders(result);
        setCurrentPage(1); // Reset to first page
    }, [orders, statusFilter]);

    // ═══════════════════════════════════════════════════════════════
    // PAGINATION
    // ═══════════════════════════════════════════════════════════════
    const totalPages = Math.ceil(filteredOrders.length / ITEMS_PER_PAGE);
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const paginatedOrders = filteredOrders.slice(startIndex, startIndex + ITEMS_PER_PAGE);

    // ═══════════════════════════════════════════════════════════════
    // UPDATE STATUS
    // ═══════════════════════════════════════════════════════════════
    const handleUpdateStatus = async (orderId: number, newStatus: OrderStatus) => {
        try {
            setIsUpdating(true);
            await orderAdminApi.updateStatus(orderId, newStatus);

            // Update local state
            setOrders(prev =>
                prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o)
            );

            // Close modal if open
            if (selectedOrder?.id === orderId) {
                setSelectedOrder(prev => prev ? { ...prev, status: newStatus } : null);
            }
        } catch (err: any) {
            console.error('Failed to update status:', err);
            alert(err?.response?.data?.message || 'Cập nhật trạng thái thất bại');
        } finally {
            setIsUpdating(false);
        }
    };

    // ═══════════════════════════════════════════════════════════════
    // VIEW DETAIL
    // ═══════════════════════════════════════════════════════════════
    const handleViewDetail = (order: AdminOrderResponse) => {
        setSelectedOrder(order);
        setIsDetailModalOpen(true);
    };

    // ═══════════════════════════════════════════════════════════════
    // RENDER
    // ═══════════════════════════════════════════════════════════════

    // Loading state
    if (loading) {
        return (
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Orders</h1>
                        <p className="text-gray-600 mt-1">Manage customer orders</p>
                    </div>
                </div>
                <Card>
                    <div className="animate-pulse space-y-4">
                        {[1, 2, 3, 4, 5].map(i => (
                            <div key={i} className="h-16 bg-gray-100 rounded"></div>
                        ))}
                    </div>
                </Card>
            </div>
        );
    }

    // Error state
    if (error) {
        return (
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Orders</h1>
                        <p className="text-gray-600 mt-1">Manage customer orders</p>
                    </div>
                </div>
                <Card>
                    <div className="text-center py-12">
                        <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
                        <p className="text-red-600 mb-4">{error}</p>
                        <Button onClick={fetchOrders}>
                            <RefreshCw className="w-4 h-4 mr-2" />
                            Thử lại
                        </Button>
                    </div>
                </Card>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Orders</h1>
                    <p className="text-gray-600 mt-1">
                        Manage customer orders ({filteredOrders.length} orders)
                    </p>
                </div>
                <Button onClick={fetchOrders} variant="secondary">
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Refresh
                </Button>
            </div>

            {/* Filters */}
            <Card>
                <div className="flex items-center gap-2">
                    <Filter className="w-5 h-5 text-gray-400" />
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value === 'all' ? 'all' : Number(e.target.value))}
                        className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
                    >
                        <option value="all">All Status</option>
                        {Object.entries(OrderStatusText).map(([value, label]) => (
                            <option key={value} value={value}>{label}</option>
                        ))}
                    </select>
                </div>
            </Card>

            {/* Table */}
            <Card padding={false}>
                {filteredOrders.length === 0 ? (
                    <div className="text-center py-12">
                        <Package className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                        <p className="text-gray-500">Không có đơn hàng nào</p>
                    </div>
                ) : (
                    <>
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50 border-b border-gray-200">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Order
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Customer
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Items
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Total
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Status
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {paginatedOrders.map((order) => (
                                        <OrderRow
                                            key={order.id}
                                            order={order}
                                            onView={() => handleViewDetail(order)}
                                            onUpdateStatus={handleUpdateStatus}
                                            isUpdating={isUpdating}
                                        />
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination */}
                        <div className="px-6 py-4 border-t border-gray-200">
                            <Pagination
                                currentPage={currentPage}
                                totalPages={totalPages}
                                onPageChange={setCurrentPage}
                            />
                        </div>
                    </>
                )}
            </Card>

            {/* Detail Modal */}
            {isDetailModalOpen && selectedOrder && (
                <OrderDetailModal
                    order={selectedOrder}
                    onClose={() => setIsDetailModalOpen(false)}
                    onUpdateStatus={handleUpdateStatus}
                    isUpdating={isUpdating}
                />
            )}
        </div>
    );
}

// ═══════════════════════════════════════════════════════════════
// ORDER ROW COMPONENT
// ═══════════════════════════════════════════════════════════════
interface OrderRowProps {
    order: AdminOrderResponse;
    onView: () => void;
    onUpdateStatus: (orderId: number, status: OrderStatus) => void;
    isUpdating: boolean;
}

function OrderRow({ order, onView, onUpdateStatus, isUpdating }: OrderRowProps) {
    const statusNum = typeof order.status === 'string' ? parseInt(order.status) : order.status;

    return (
        <tr className="hover:bg-gray-50 transition-colors">
            {/* Order Info */}
            <td className="px-6 py-4 whitespace-nowrap">
                <p className="font-medium text-gray-900">#{order.id}</p>
                <p className="text-sm text-gray-500">{formatDate(order.createdAt)}</p>
            </td>

            {/* Customer */}
            <td className="px-6 py-4 whitespace-nowrap">
                <p className="text-gray-900">{order.userName || `User #${order.userId}`}</p>
                <p className="text-sm text-gray-500">{order.userEmail || '-'}</p>
            </td>

            {/* Items */}
            <td className="px-6 py-4 whitespace-nowrap">
                <span className="text-gray-900">{order.items?.length || 0} items</span>
            </td>

            {/* Total */}
            <td className="px-6 py-4 whitespace-nowrap">
                <span className="font-semibold text-gray-900">
                    {formatCurrency(order.totalAmount)}
                </span>
            </td>

            {/* Status */}
            <td className="px-6 py-4 whitespace-nowrap">
                <Badge variant={OrderStatusColor[statusNum] || 'gray'}>
                    {OrderStatusText[statusNum] || order.status}
                </Badge>
            </td>

            {/* Actions */}
            <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center gap-2">
                    <button
                        onClick={onView}
                        className="p-2 text-gray-600 hover:text-primary-600 hover:bg-gray-100 rounded-lg transition-colors"
                        title="View details"
                    >
                        <Eye className="w-4 h-4" />
                    </button>

                    {/* Quick status update dropdown */}
                    <select
                        value={statusNum}
                        onChange={(e) => onUpdateStatus(order.id, Number(e.target.value))}
                        disabled={isUpdating}
                        className="text-sm border border-gray-300 rounded px-2 py-1 focus:ring-2 focus:ring-primary-500 disabled:opacity-50"
                    >
                        {Object.entries(OrderStatusText).map(([value, label]) => (
                            <option key={value} value={value}>{label}</option>
                        ))}
                    </select>
                </div>
            </td>
        </tr>
    );
}

// ═══════════════════════════════════════════════════════════════
// ORDER DETAIL MODAL
// ═══════════════════════════════════════════════════════════════
interface OrderDetailModalProps {
    order: AdminOrderResponse;
    onClose: () => void;
    onUpdateStatus: (orderId: number, status: OrderStatus) => void;
    isUpdating: boolean;
}

function OrderDetailModal({ order, onClose, onUpdateStatus, isUpdating }: OrderDetailModalProps) {
    const statusNum = typeof order.status === 'string' ? parseInt(order.status) : order.status;

    return (
        <>
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-black bg-opacity-50 z-40"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                    {/* Header */}
                    <div className="px-6 py-4 border-b flex items-center justify-between">
                        <h2 className="text-xl font-bold text-gray-900">
                            Order #{order.id}
                        </h2>
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                            ✕
                        </button>
                    </div>

                    {/* Content */}
                    <div className="p-6 space-y-6">
                        {/* Order Info */}
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <p className="text-sm text-gray-500">Customer</p>
                                <p className="font-medium">{order.userName || `User #${order.userId}`}</p>
                                <p className="text-sm text-gray-500">{order.userEmail}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Date</p>
                                <p className="font-medium">{formatDate(order.createdAt)}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Status</p>
                                <Badge variant={OrderStatusColor[statusNum] || 'gray'}>
                                    {OrderStatusText[statusNum]}
                                </Badge>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Total</p>
                                <p className="font-bold text-lg text-primary-600">
                                    {formatCurrency(order.totalAmount)}
                                </p>
                            </div>
                        </div>

                        {/* Shipping Address */}
                        {order.shippingAddress && (
                            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                                <p className="text-sm font-medium text-blue-900 mb-2 flex items-center">
                                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                    </svg>
                                    Shipping Address
                                </p>
                                <p className="text-sm text-blue-800 pl-7">
                                    {order.shippingAddress}
                                </p>
                            </div>
                        )}

                        {/* Items */}
                        <div>
                            <h3 className="font-semibold text-gray-900 mb-3">
                                Order Items ({order.items?.length || 0})
                            </h3>
                            <div className="border rounded-lg divide-y">
                                {order.items?.map((item, idx) => (
                                    <div key={item.id || idx} className="p-4 flex justify-between">
                                        <div>
                                            <p className="font-medium">{item.productName}</p>
                                            <p className="text-sm text-gray-500">
                                                {formatCurrency(item.unitPrice)} × {item.quantity}
                                            </p>
                                        </div>
                                        <p className="font-medium">
                                            {formatCurrency(item.total || item.unitPrice * item.quantity)}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Update Status */}
                        <div>
                            <h3 className="font-semibold text-gray-900 mb-3">Update Status</h3>
                            <div className="flex flex-wrap gap-2">
                                {Object.entries(OrderStatusText).map(([value, label]) => {
                                    const numValue = Number(value);
                                    const isActive = statusNum === numValue;
                                    return (
                                        <button
                                            key={value}
                                            onClick={() => !isActive && onUpdateStatus(order.id, numValue)}
                                            disabled={isUpdating || isActive}
                                            className={`
                                                px-4 py-2 rounded-lg text-sm font-medium transition-colors
                                                ${isActive
                                                    ? 'bg-primary-600 text-white cursor-default'
                                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200 disabled:opacity-50'
                                                }
                                            `}
                                        >
                                            {label}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="px-6 py-4 border-t flex justify-end">
                        <Button onClick={onClose} variant="secondary">
                            Close
                        </Button>
                    </div>
                </div>
            </div>
        </>
    );
}

export default OrdersPage;
