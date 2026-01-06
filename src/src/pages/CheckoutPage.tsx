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
  const [address, setAddress] = useState(user?.phone || '');
  const [addressError, setAddressError] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'cod' | 'ewallet'>('cod');

  const subtotal = getCartTotal();
  const shippingFee = subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_FEE;
  const total = subtotal + shippingFee;

  useEffect(() => {
    if (!isAuthenticated) navigate('/login');
  }, [isAuthenticated, navigate]);

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate address
    setAddressError('');
    if (!address || address.trim().length < 10) {
      setAddressError('Địa chỉ phải có ít nhất 10 ký tự');
      return;
    }
    if (address.trim().length > 500) {
      setAddressError('Địa chỉ không được vượt quá 500 ký tự');
      return;
    }
    
    let currentUserId = null;

    let token = localStorage.getItem("token");
    if (token) {
      // Xóa prefix "Bearer " nếu có
      token = token.replace('Bearer ', '');
      
      try {
        const decoded: any = jwtDecode(token);
        // console.log("Full decoded token:", decoded);
        currentUserId = decoded.id; // Thử lấy id trực tiếp
        // console.log("UserId from JWT:", currentUserId);
      } catch (error) {
        console.error("JWT decode error:", error);
      }
    }

    // Fallback sang Context nếu không có token
    if (!currentUserId) {
      currentUserId = user?.id;
    }

    // Nếu vẫn không có ID, thoát khỏi hàm
    if (!currentUserId) {
      alert("Lỗi phiên đăng nhập. Vui lòng login lại.");
      return;
    }

    setLoading(true);
    try {
      const orderPayload: OrderRequest = {
        userId: parseInt(currentUserId),
        currency: "VND",
        shippingAddress: address,
        items: items.map(item => ({
          productId: parseInt(item.product.id),
          quantity: item.quantity,
          variantId: item.variantId
        }))
      };

      console.log("Order Payload:", orderPayload);


      // 2. Gọi API tạo đơn
      const orderRes = await orderApi.create(orderPayload);
      const newOrder = orderRes.data; // Backend trả về OrderResponse (có Id)
      console.log("Order Created:", newOrder);

      // 3. Xử lý thanh toán
      if (paymentMethod === 'ewallet') {
        // Gọi API lấy link Momo
        const paymentRes = await paymentApi.createMomoPayment({
          orderId: newOrder.id, // ID đơn hàng vừa tạo
          returnUrl: window.location.origin + "/payment-result", // ✅ User quay về trang kết quả
          notifyUrl: "" // ✅ Để trống → Backend sẽ dùng NotifyUrl từ appsettings.json
        });

        // ✅ FIX: KHÔNG clear cart ở đây - chỉ clear khi thanh toán thành công
        // Cart sẽ được clear tự động bởi backend khi IPN success
        // Hoặc được clear trong PaymentResultPage sau khi verify Order.Status = Paid

        // Redirect sang Momo
        if (paymentRes.data.payUrl) {
          window.location.href = paymentRes.data.payUrl;
        } else {
          alert("Không lấy được link thanh toán!");
        }
      } else {
        // COD - Thanh toán khi nhận hàng
        // ✅ COD có thể clear cart ngay vì không cần chờ payment gateway
        clearCart();
        alert("Đặt hàng thành công! Mã đơn: #" + newOrder.id);
        navigate('/orders'); // Chuyển đến trang lịch sử đơn hàng
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
    <div className="min-h-screen bg-gray-50 py-4 sm:py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4 sm:mb-8">Thanh Toán</h1>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-8">
          
          {/* Form Thông tin */}
          <div className="lg:col-span-2 bg-white p-4 sm:p-6 rounded-lg shadow-sm">
            <h2 className="text-lg sm:text-xl font-semibold mb-4">Thông tin giao hàng</h2>
            <div className="space-y-4">
              <Input label="Họ tên" value={user?.fullName} readOnly className="bg-gray-100" />
              <Input label="Email" value={user?.email} readOnly className="bg-gray-100" />
              <div>
                <Input 
                  label="Địa chỉ nhận hàng *" 
                  value={address} 
                  onChange={(e) => {
                    setAddress(e.target.value);
                    setAddressError('');
                  }} 
                  placeholder="Số nhà, đường, phường/xã, quận/huyện, tỉnh/thành phố" 
                  required
                />
                {addressError && (
                  <p className="mt-1 text-sm text-red-600">{addressError}</p>
                )}
                <p className="mt-1 text-xs text-gray-500">
                  Vui lòng nhập địa chỉ đầy đủ (10-500 ký tự). Ví dụ: 123 Nguyễn Huệ, Phường Bến Nghé, Quận 1, TP.HCM
                </p>
                <div className="mt-1 flex items-center gap-2 text-xs">
                  <span className={`${address.length >= 10 ? 'text-green-600' : 'text-gray-400'}`}>
                    ✓ Tối thiểu 10 ký tự
                  </span>
                  <span className="text-gray-300">•</span>
                  <span className={`${address.length > 0 && address.length <= 500 ? 'text-green-600' : 'text-gray-400'}`}>
                    ✓ Tối đa 500 ký tự
                  </span>
                  <span className="text-gray-300">•</span>
                  <span className="text-gray-500">
                    {address.length}/500
                  </span>
                </div>
              </div>
            </div>

            <h2 className="text-lg sm:text-xl font-semibold mt-6 mb-4">Phương thức thanh toán</h2>
            <div className="space-y-3">
                {/* Custom Radio Button UI */}
                <div onClick={() => setPaymentMethod('cod')} className={`p-3 sm:p-4 border rounded-lg cursor-pointer flex items-center gap-3 ${paymentMethod === 'cod' ? 'border-primary-500 bg-primary-50' : ''}`}>
                    <div className={`w-4 h-4 rounded-full border flex-shrink-0 ${paymentMethod === 'cod' ? 'bg-primary-500 border-primary-500' : 'border-gray-400'}`}></div>
                    <span className="text-sm sm:text-base">Thanh toán khi nhận hàng (COD)</span>
                </div>
                <div onClick={() => setPaymentMethod('ewallet')} className={`p-3 sm:p-4 border rounded-lg cursor-pointer flex items-center gap-3 ${paymentMethod === 'ewallet' ? 'border-primary-500 bg-primary-50' : ''}`}>
                    <div className={`w-4 h-4 rounded-full border flex-shrink-0 ${paymentMethod === 'ewallet' ? 'bg-primary-500 border-primary-500' : 'border-gray-400'}`}></div>
                    <img src="https://upload.wikimedia.org/wikipedia/vi/f/fe/MoMo_Logo.png" alt="Momo" className="h-5 w-5 sm:h-6 sm:w-6 flex-shrink-0" />
                    <span className="text-sm sm:text-base">Ví MoMo</span>
                </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className="bg-white p-4 sm:p-6 rounded-lg shadow-sm h-fit lg:sticky lg:top-20">
            <h2 className="text-lg sm:text-xl font-bold mb-4">Đơn hàng</h2>
            <div className="space-y-3 mb-4 max-h-60 overflow-y-auto">
                {items.map(item => (
                    <div key={item.id} className="flex justify-between text-sm">
                        <div className="flex-1 min-w-0 mr-2">
                            <span className="block truncate">{item.product.name} (x{item.quantity})</span>
                            {item.variantInfo && (
                                <span className="text-xs text-gray-500">{item.variantInfo}</span>
                            )}
                        </div>
                        <span className="font-medium flex-shrink-0">{formatCurrency(item.product.price * item.quantity)}</span>
                    </div>
                ))}
            </div>
            <div className="border-t pt-4 space-y-2">
                <div className="flex justify-between"><span>Tạm tính</span><span>{formatCurrency(subtotal)}</span></div>
                <div className="flex justify-between"><span>Phí ship</span><span>{formatCurrency(shippingFee)}</span></div>
                <div className="flex justify-between text-xl font-bold text-primary-600 pt-2 border-t">
                    <span>Tổng cộng</span>
                    <span>{formatCurrency(total)}</span>
                </div>
            </div>
            <Button 
                fullWidth 
                size="lg" 
                className="mt-6" 
                onClick={handleCheckout} 
                disabled={loading || !address || address.trim().length < 10}
                loading={loading}
            >
                {paymentMethod === 'ewallet' ? 'Thanh toán MoMo' : 'Đặt hàng'}
            </Button>
            {(!address || address.trim().length < 10) && (
              <p className="text-xs text-red-600 text-center mt-2">
                Vui lòng nhập địa chỉ giao hàng hợp lệ
              </p>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}