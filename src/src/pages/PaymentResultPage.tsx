import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { Button } from '../components/shared/Button';
import orderApi from '../api/orderApi';
import { Order } from '../types';

export function PaymentResultPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [order, setOrder] = useState<Order | null>(null);
  
  // Backend redirect về kèm params
  const orderId = searchParams.get('orderId');
  const resultCode = searchParams.get('resultCode'); // Momo: 0 = Success

  useEffect(() => {
    if (!orderId) {
        setLoading(false);
        return;
    }

    // Gọi API lấy chi tiết đơn hàng để check trạng thái mới nhất từ DB
    const checkOrderStatus = async () => {
        try {
            const res = await orderApi.getById(parseInt(orderId));
            setOrder(res.data);
        } catch (error) {
            console.error("Failed to fetch order", error);
        } finally {
            setLoading(false);
        }
    };

    checkOrderStatus();
  }, [orderId]);

  if (loading) return <div className="h-screen flex justify-center items-center"><Loader2 className="animate-spin w-10 h-10 text-orange-500"/></div>;

  const isSuccess = resultCode === '0' || order?.status === 'Paid';

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white p-8 rounded-2xl shadow-lg max-w-md w-full text-center">
        <div className="mb-6 flex justify-center">
            {isSuccess ? (
                <CheckCircle className="w-20 h-20 text-green-500" />
            ) : (
                <XCircle className="w-20 h-20 text-red-500" />
            )}
        </div>
        
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
            {isSuccess ? 'Thanh toán thành công!' : 'Thanh toán thất bại'}
        </h1>
        
        <p className="text-gray-600 mb-6">
            {isSuccess 
                ? `Cảm ơn bạn đã mua hàng. Mã đơn hàng #${orderId} đã được xác nhận.`
                : 'Giao dịch bị hủy hoặc xảy ra lỗi trong quá trình thanh toán.'}
        </p>

        <div className="flex flex-col gap-3">
            <Button variant="primary" fullWidth onClick={() => navigate('/orders')}>
                Xem lịch sử đơn hàng
            </Button>
            <Button variant="secondary" fullWidth onClick={() => navigate('/')}>
                Về trang chủ
            </Button>
        </div>
      </div>
    </div>
  );
}