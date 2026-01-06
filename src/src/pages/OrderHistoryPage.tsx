import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Package, ChevronRight, ShoppingBag, AlertCircle, RefreshCw, Clock } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import orderApi, { OrderResponse, OrderStatusText, OrderStatusVariant, OrderStatus } from '../api/orderApi';
import paymentApi from '../api/paymentApi';
import { formatCurrency } from '../utils/formatters';

export function OrderHistoryPage() {
    const navigate = useNavigate();
    const { user, isAuthenticated } = useAuth();
    const [orders, setOrders] = useState<OrderResponse[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [retryingOrderId, setRetryingOrderId] = useState<number | null>(null);

    // Redirect nếu chưa đăng nhập
    useEffect(() => {
        if (!isAuthenticated) {
            navigate('/login');
        }
    }, [isAuthenticated, navigate]);

    // Fetch orders
    useEffect(() => {
        const fetchOrders = async () => {
            if (!user?.id) return;

            try {
                setLoading(true);
                setError(null);
                const res = await orderApi.getByUserId(user.id);
                
                // Defensive: xử lý nhiều dạng response
                const data = res?.data;
                if (Array.isArray(data)) {
                    // Sắp xếp theo ngày mới nhất
                    const sorted = data.sort((a, b) => 
                        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
                    );
                    setOrders(sorted);
                } else {
                    setOrders([]);
                }
            } catch (err: any) {
                console.error('Failed to fetch orders:', err);
                if (err?.response?.status === 401) {
                    setError('Vui lòng đăng nhập lại');
                } else if (err?.response?.status === 404) {
                    setOrders([]); // Không có đơn hàng
                } else {
                    setError('Không thể tải danh sách đơn hàng');
                }
            } finally {
                setLoading(false);
            }
        };

        fetchOrders();
    }, [user?.id]);

    // Format date
    const formatDate = (dateStr: string) => {
        try {
            return new Date(dateStr).toLocaleDateString('vi-VN', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
        } catch {
            return dateStr;
        }
    };

    // Get status badge style
    const getStatusStyle = (status: number) => {
        const variant = OrderStatusVariant[status] || 'primary';
        const styles: Record<string, string> = {
            success: 'bg-green-100 text-green-700',
            warning: 'bg-yellow-100 text-yellow-700',
            danger: 'bg-red-100 text-red-700',
            primary: 'bg-blue-100 text-blue-700'
        };
        return styles[variant];
    };

    // Handle retry payment
    const handleRetryPayment = async (orderId: number) => {
        try {
            setRetryingOrderId(orderId);
            
            // Lấy payment của order
            const paymentsRes = await paymentApi.getByOrderId(orderId);
            const payments = paymentsRes.data;
            
            console.log('Payments response:', payments);
            
            if (!payments || payments.length === 0) {
                alert('Không tìm thấy thông tin thanh toán');
                return;
            }

            // Lấy payment mới nhất
            const latestPayment = Array.isArray(payments) 
                ? payments[payments.length - 1] 
                : payments;

            console.log('Latest payment:', latestPayment);

            // Gọi retry
            const res = await paymentApi.retryPayment(latestPayment.id);
            
            console.log('Retry response:', res.data);
            
            // Redirect đến trang thanh toán MoMo
            const payUrl = res.data?.payUrl || res.data?.PayUrl;
            if (payUrl) {
                window.location.href = payUrl;
            } else {
                console.error('No payUrl in response:', res.data);
                alert('Không thể tạo link thanh toán. Vui lòng thử lại.');
            }
        } catch (err: any) {
            console.error('Retry payment failed:', err);
            alert(err?.response?.data?.message || 'Thanh toán lại thất bại. Vui lòng thử lại.');
        } finally {
            setRetryingOrderId(null);
        }
    };

    // Loading state
    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto mb-4"></div>
                    <p className="text-gray-500">Đang tải đơn hàng...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-4xl mx-auto px-4">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <h1 className="text-2xl font-bold text-gray-900 flex items-center">
                        <ShoppingBag className="w-7 h-7 mr-3 text-primary-500" />
                        Lịch sử đơn hàng
                    </h1>
                    <span className="text-sm text-gray-500">
                        {orders.length} đơn hàng
                    </span>
                </div>

                {/* Error */}
                {error && (
                    <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center text-red-700">
                        <AlertCircle className="w-5 h-5 mr-3 flex-shrink-0" />
                        {error}
                    </div>
                )}

                {/* Empty state */}
                {orders.length === 0 && !error ? (
                    <div className="bg-white rounded-lg shadow-sm p-12 text-center">
                        <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                        <h2 className="text-xl font-semibold text-gray-700 mb-2">
                            Chưa có đơn hàng nào
                        </h2>
                        <p className="text-gray-500 mb-6">
                            Bạn chưa đặt đơn hàng nào. Hãy khám phá sản phẩm của chúng tôi!
                        </p>
                        <button
                            onClick={() => navigate('/')}
                            className="px-6 py-3 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors"
                        >
                            Mua sắm ngay
                        </button>
                    </div>
                ) : (
                    /* Order list */
                    <div className="space-y-4">
                        {orders.map((order) => (
                            <OrderCard
                                key={order.id}
                                order={order}
                                formatDate={formatDate}
                                getStatusStyle={getStatusStyle}
                                onRetryPayment={handleRetryPayment}
                                isRetrying={retryingOrderId === order.id}
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

// ═══════════════════════════════════════════════════════════════
// ORDER CARD COMPONENT
// ═══════════════════════════════════════════════════════════════
interface OrderCardProps {
    order: OrderResponse;
    formatDate: (date: string) => string;
    getStatusStyle: (status: number) => string;
    onRetryPayment: (orderId: number) => void;
    isRetrying: boolean;
}

function OrderCard({ order, formatDate, getStatusStyle, onRetryPayment, isRetrying }: OrderCardProps) {
    const [expanded, setExpanded] = useState(false);
    const [timeRemaining, setTimeRemaining] = useState<{ minutes: number; seconds: number } | null>(null);

    // Xử lý status có thể là string hoặc number
    const statusNum = typeof order.status === 'string' 
        ? parseInt(order.status) || 0 
        : order.status;

    // Tính thời gian còn lại
    useEffect(() => {
        if (statusNum !== OrderStatus.PaymentPending || !order.paymentExpiry) {
            setTimeRemaining(null);
            return;
        }

        const calculateTimeRemaining = () => {
            const expiry = new Date(order.paymentExpiry!).getTime();
            const now = Date.now();
            const diff = expiry - now;

            if (diff <= 0) {
                setTimeRemaining(null);
                return;
            }

            const minutes = Math.floor(diff / 60000);
            const seconds = Math.floor((diff % 60000) / 1000);
            setTimeRemaining({ minutes, seconds });
        };

        calculateTimeRemaining();
        const interval = setInterval(calculateTimeRemaining, 1000);

        return () => clearInterval(interval);
    }, [order.paymentExpiry, statusNum]);

    // Cho phép retry khi status là PaymentPending và còn thời gian
    const canRetry = statusNum === OrderStatus.PaymentPending && timeRemaining !== null;

    return (
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            {/* Header */}
            <div 
                className="p-4 flex items-center justify-between cursor-pointer hover:bg-gray-50 transition-colors"
                onClick={() => setExpanded(!expanded)}
            >
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
                        <Package className="w-6 h-6 text-primary-500" />
                    </div>
                    <div>
                        <p className="font-semibold text-gray-900">
                            Đơn hàng #{order.id}
                        </p>
                        <p className="text-sm text-gray-500">
                            {formatDate(order.createdAt)}
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusStyle(statusNum)}`}>
                        {OrderStatusText[statusNum] || order.status}
                    </span>
                    <span className="font-bold text-primary-600">
                        {formatCurrency(order.totalAmount)}
                    </span>
                    <ChevronRight 
                        className={`w-5 h-5 text-gray-400 transition-transform ${expanded ? 'rotate-90' : ''}`} 
                    />
                </div>
            </div>

            {/* Expanded content */}
            {expanded && (
                <div className="border-t px-4 py-4 bg-gray-50">
                    {/* Shipping Address */}
                    {order.shippingAddress && (
                        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                            <p className="text-sm font-medium text-blue-900 mb-1 flex items-center">
                                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                                Địa chỉ giao hàng
                            </p>
                            <p className="text-sm text-blue-800 pl-6">
                                {order.shippingAddress}
                            </p>
                        </div>
                    )}
                    
                    <p className="text-sm font-medium text-gray-700 mb-3">
                        Chi tiết đơn hàng ({order.items?.length || 0} sản phẩm)
                    </p>
                    
                    <div className="space-y-3">
                        {order.items?.map((item, idx) => (
                            <div 
                                key={item.id || idx} 
                                className="flex items-center justify-between bg-white p-3 rounded-lg"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-gray-100 rounded flex items-center justify-center text-gray-400">
                                        <Package className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <p className="font-medium text-gray-900">
                                            {item.productName}
                                        </p>
                                        {item.variantInfo && (
                                            <p className="text-xs text-gray-500">
                                                {item.variantInfo}
                                            </p>
                                        )}
                                        <p className="text-sm text-gray-500">
                                            {formatCurrency(item.unitPrice)} × {item.quantity}
                                        </p>
                                    </div>
                                </div>
                                <span className="font-medium text-gray-900">
                                    {formatCurrency(item.total || item.unitPrice * item.quantity)}
                                </span>
                            </div>
                        ))}
                    </div>

                    {/* Total */}
                    <div className="mt-4 pt-4 border-t flex justify-between items-center">
                        <span className="text-gray-600">Tổng cộng:</span>
                        <span className="text-xl font-bold text-primary-600">
                            {formatCurrency(order.totalAmount)}
                        </span>
                    </div>

                    {/* Retry Payment Button */}
                    {canRetry && (
                        <div className="mt-4 pt-4 border-t">
                            {timeRemaining && (
                                <div className="mb-3 p-3 bg-orange-50 border border-orange-200 rounded-lg flex items-center text-orange-700">
                                    <Clock className="w-5 h-5 mr-2 flex-shrink-0" />
                                    <span className="text-sm">
                                        Còn <span className="font-bold">{timeRemaining.minutes}</span> phút{' '}
                                        <span className="font-bold">{timeRemaining.seconds}</span> giây để thanh toán
                                    </span>
                                </div>
                            )}
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onRetryPayment(order.id);
                                }}
                                disabled={isRetrying}
                                className="w-full py-3 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                <RefreshCw className={`w-5 h-5 ${isRetrying ? 'animate-spin' : ''}`} />
                                {isRetrying ? 'Đang xử lý...' : 'Thanh toán lại'}
                            </button>
                        </div>
                    )}

                    {/* Hết hạn thanh toán */}
                    {statusNum === OrderStatus.PaymentPending && !timeRemaining && (
                        <div className="mt-4 pt-4 border-t">
                            <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-center text-red-700">
                                <AlertCircle className="w-5 h-5 mr-2 flex-shrink-0" />
                                <span className="text-sm">Đã hết thời gian thanh toán. Đơn hàng sẽ được hủy tự động.</span>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

export default OrderHistoryPage;
