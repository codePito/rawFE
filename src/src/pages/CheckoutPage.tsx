import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../contexts/AuthContext';
import { Input } from '../components/shared/Input'; // Dùng component share có sẵn
import { Button } from '../components/shared/Button';
import { formatCurrency } from '../utils/formatters';
import { SHIPPING_FEE, FREE_SHIPPING_THRESHOLD, PAYMENT_METHODS } from '../utils/constants';
import orderApi from '../api/orderApi';
import paymentApi from '../api/paymentApi';
import { OrderRequest } from '../types';
import { jwtDecode } from 'jwt-decode';

export function CheckoutPage() {
  const navigate = useNavigate();
  const { items, getCartTotal, clearCart } = useCart();
  const { isAuthenticated, user } = useAuth();
  
  const [loading, setLoading] = useState(false);
  const [address, setAddress] = useState(user?.phone || ''); // Tạm dùng field phone làm address do mock data cũ
  const [paymentMethod, setPaymentMethod] = useState<'cod' | 'ewallet'>('cod');

  const subtotal = getCartTotal();
  const shippingFee = subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_FEE;
  const total = subtotal + shippingFee;

  useEffect(() => {
    if (!isAuthenticated) navigate('/login');
  }, [isAuthenticated, navigate]);

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    e.preventDefault();
    let currentUserId = user?.id; // Lấy từ Context (có thể null)

    // Logic cứu vãn ID từ JWT nếu Context chưa kịp tải
    if (!currentUserId) {
    const token = localStorage.getItem("token");
    if (token) {
        const decoded: any = jwtDecode(token);

        // Lấy userId từ tất cả các claim có thể có trong JWT
        currentUserId =
            decoded.id ||
            decoded.userId ||
            decoded.nameid ||
            decoded.nameId ||
            decoded.nameidentifier ||
            decoded["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"] ||
            decoded.sub; // fallback cuối
    }
}

    // Nếu vẫn không có ID, thoát khỏi hàm
    if (!currentUserId) {
        alert("Lỗi phiên đăng nhập. Vui lòng login lại.");
        return;
    }

    setLoading(true);
    try {
      // 1. Chuẩn bị payload tạo Order
      const orderPayload: OrderRequest = {
        userId: parseInt(currentUserId), // Parse ID sang int cho Backend
        currency: "VND",
        items: items.map(item => ({
          productId: parseInt(item.product.id), // Parse ProductID
          quantity: item.quantity
        }))
      };

      // 2. Gọi API tạo đơn
      const orderRes = await orderApi.create(orderPayload);
      const newOrder = orderRes.data; // Backend trả về OrderResponse (có Id)
      console.log("Order Created:", newOrder);

      // 3. Xử lý thanh toán
      if (paymentMethod === 'ewallet') {
        // Gọi API lấy link Momo
        const paymentRes = await paymentApi.createMomoPayment({
          orderId: newOrder.id, // ID đơn hàng vừa tạo
          returnUrl: window.location.origin + "/payment-result", // User quay về đây
          notifyUrl: "https://your-ngrok-domain.com/api/payment/momo/notify" // URL backend nhận IPN
        });

        // Clear giỏ hàng client
        clearCart();

        // Redirect sang Momo
        if (paymentRes.data.payUrl) {
          window.location.href = paymentRes.data.payUrl;
        } else {
          alert("Không lấy được link thanh toán!");
        }
      } else {
        // COD
        clearCart();
        alert("Đặt hàng thành công! Mã đơn: #" + newOrder.id);
        navigate('/'); // Hoặc trang lịch sử đơn hàng
      }

    } catch (error) {
      console.error("Checkout error:", error);
      alert("Có lỗi xảy ra khi tạo đơn hàng.");
    } finally {
      setLoading(false);
    }
  };

  if (items.length === 0) return <div className="p-8 text-center">Giỏ hàng trống</div>;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Thanh Toán</h1>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Form Thông tin */}
          <div className="lg:col-span-2 bg-white p-6 rounded-lg shadow-sm">
            <h2 className="text-xl font-semibold mb-4">Thông tin giao hàng</h2>
            <div className="space-y-4">
              <Input label="Họ tên" value={user?.fullName} readOnly className="bg-gray-100" />
              <Input label="Email" value={user?.email} readOnly className="bg-gray-100" />
              <Input 
                label="Địa chỉ nhận hàng" 
                value={address} 
                onChange={(e) => setAddress(e.target.value)} 
                placeholder="Số nhà, đường, quận/huyện..." 
              />
            </div>

            <h2 className="text-xl font-semibold mt-6 mb-4">Phương thức thanh toán</h2>
            <div className="space-y-3">
                {/* Custom Radio Button UI */}
                <div onClick={() => setPaymentMethod('cod')} className={`p-4 border rounded-lg cursor-pointer flex items-center gap-3 ${paymentMethod === 'cod' ? 'border-orange-500 bg-orange-50' : ''}`}>
                    <div className={`w-4 h-4 rounded-full border ${paymentMethod === 'cod' ? 'bg-orange-500 border-orange-500' : 'border-gray-400'}`}></div>
                    <span>Thanh toán khi nhận hàng (COD)</span>
                </div>
                <div onClick={() => setPaymentMethod('ewallet')} className={`p-4 border rounded-lg cursor-pointer flex items-center gap-3 ${paymentMethod === 'ewallet' ? 'border-orange-500 bg-orange-50' : ''}`}>
                    <div className={`w-4 h-4 rounded-full border ${paymentMethod === 'ewallet' ? 'bg-orange-500 border-orange-500' : 'border-gray-400'}`}></div>
                    <img src="https://upload.wikimedia.org/wikipedia/vi/f/fe/MoMo_Logo.png" alt="Momo" className="h-6 w-6" />
                    <span>Ví MoMo</span>
                </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className="bg-white p-6 rounded-lg shadow-sm h-fit">
            <h2 className="text-xl font-bold mb-4">Đơn hàng</h2>
            <div className="space-y-3 mb-4 max-h-60 overflow-y-auto">
                {items.map(item => (
                    <div key={item.id} className="flex justify-between text-sm">
                        <span>{item.product.name} (x{item.quantity})</span>
                        <span className="font-medium">{formatCurrency(item.product.price * item.quantity)}</span>
                    </div>
                ))}
            </div>
            <div className="border-t pt-4 space-y-2">
                <div className="flex justify-between"><span>Tạm tính</span><span>{formatCurrency(subtotal)}</span></div>
                <div className="flex justify-between"><span>Phí ship</span><span>{formatCurrency(shippingFee)}</span></div>
                <div className="flex justify-between text-xl font-bold text-orange-600 pt-2 border-t">
                    <span>Tổng cộng</span>
                    <span>{formatCurrency(total)}</span>
                </div>
            </div>
            <Button 
                fullWidth 
                size="lg" 
                className="mt-6" 
                onClick={handleCheckout} 
                disabled={loading || !address}
                loading={loading}
            >
                {paymentMethod === 'ewallet' ? 'Thanh toán MoMo' : 'Đặt hàng'}
            </Button>
          </div>

        </div>
      </div>
    </div>
  );
}