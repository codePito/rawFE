import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
// import { useAuth } from '../context/AuthContext';
import { useAuth } from '../contexts/AuthContext';
import { CheckoutFormData } from '../types';
import { Input } from '../components/common/Input';
import { Button } from '../components/common/Button';
import { formatCurrency } from '../utils/formatters';
import { SHIPPING_FEE, FREE_SHIPPING_THRESHOLD, PAYMENT_METHODS } from '../utils/constants';
export function CheckoutPage() {
  const navigate = useNavigate();
  const {
    items,
    getCartTotal,
    clearCart
  } = useCart();
  const {
    isAuthenticated,
    user
  } = useAuth();
  const [formData, setFormData] = useState<CheckoutFormData>({
    fullName: user?.fullName || '',
    email: user?.email || '',
    // phone: user?.phone || '',
    address: '',
    city: '',
    postalCode: '',
    paymentMethod: 'cod'
  });
  const [errors, setErrors] = useState<Partial<CheckoutFormData>>({});
  const subtotal = getCartTotal();
  const shippingFee = subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_FEE;
  const total = subtotal + shippingFee;
  useEffect(() => {
    // Redirect to login if not authenticated
    if (!isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);
  useEffect(() => {
    // Pre-fill form with user data
    if (user) {
      setFormData(prev => ({
        ...prev,
        fullName: user.fullName,
        email: user.email,
        phone: user.phone || ''
      }));
    }
  }, [user]);
  if (items.length === 0) {
    return <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <p className="text-xl text-gray-600 mb-4">Your cart is empty</p>
          <Button onClick={() => navigate('/')}>Continue Shopping</Button>
        </div>
      </div>;
  }
  const validateForm = (): boolean => {
    const newErrors: Partial<CheckoutFormData> = {};
    if (!formData.fullName.trim()) newErrors.fullName = 'Full name is required';
    if (!formData.email.trim()) newErrors.email = 'Email is required';else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Email is invalid';
    // if (!formData.phone.trim()) newErrors.phone = 'Phone number is required';
    if (!formData.address.trim()) newErrors.address = 'Address is required';
    if (!formData.city.trim()) newErrors.city = 'City is required';
    if (!formData.postalCode.trim()) newErrors.postalCode = 'Postal code is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      // Mock order submission
      alert('Order placed successfully! (Mock implementation)');
      clearCart();
      navigate('/');
    }
  };
  const handleChange = (field: keyof CheckoutFormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: undefined
      }));
    }
  };
  return <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Checkout</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Checkout Form */}
          <div className="lg:col-span-2">
            <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-sm p-6 space-y-6">
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                  Contact Information
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input label="Full Name" value={formData.fullName} onChange={e => handleChange('fullName', e.target.value)} error={errors.fullName} placeholder="John Doe" />
                  <Input label="Email" type="email" value={formData.email} onChange={e => handleChange('email', e.target.value)} error={errors.email} placeholder="john@example.com" />
                  {/* <Input label="Phone Number" type="tel" value={formData.phone} onChange={e => handleChange('phone', e.target.value)} error={errors.phone} placeholder="+1 234 567 8900" className="md:col-span-2" /> */}
                </div>
              </div>

              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                  Shipping Address
                </h2>
                <div className="space-y-4">
                  <Input label="Street Address" value={formData.address} onChange={e => handleChange('address', e.target.value)} error={errors.address} placeholder="123 Main Street" />
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input label="City" value={formData.city} onChange={e => handleChange('city', e.target.value)} error={errors.city} placeholder="New York" />
                    <Input label="Postal Code" value={formData.postalCode} onChange={e => handleChange('postalCode', e.target.value)} error={errors.postalCode} placeholder="10001" />
                  </div>
                </div>
              </div>

              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                  Payment Method
                </h2>
                <div className="space-y-3">
                  {PAYMENT_METHODS.map(method => <label key={method.id} className={`flex items-center gap-3 p-4 border-2 rounded-lg cursor-pointer transition-all ${formData.paymentMethod === method.id ? 'border-orange-500 bg-orange-50' : 'border-gray-200 hover:border-gray-300'}`}>
                      <input type="radio" name="paymentMethod" value={method.id} checked={formData.paymentMethod === method.id} onChange={e => handleChange('paymentMethod', e.target.value)} className="w-4 h-4 text-orange-600" />
                      <span className="text-2xl">{method.icon}</span>
                      <span className="font-medium text-gray-900">
                        {method.name}
                      </span>
                    </label>)}
                </div>
              </div>
            </form>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm p-6 sticky top-24">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Order Summary
              </h2>

              <div className="space-y-3 mb-4 max-h-64 overflow-y-auto">
                {items.map(item => <div key={item.product.id} className="flex gap-3">
                    <img src={item.product.images[0]} alt={item.product.name} className="w-16 h-16 object-cover rounded" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {item.product.name}
                      </p>
                      <p className="text-sm text-gray-500">
                        Qty: {item.quantity}
                      </p>
                      <p className="text-sm font-semibold text-orange-600">
                        {formatCurrency(item.product.price * item.quantity)}
                      </p>
                    </div>
                  </div>)}
              </div>

              <div className="border-t pt-4 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-medium">
                    {formatCurrency(subtotal)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Shipping</span>
                  <span className="font-medium">
                    {shippingFee === 0 ? 'FREE' : formatCurrency(shippingFee)}
                  </span>
                </div>
                <div className="flex justify-between text-lg font-bold pt-2 border-t">
                  <span>Total</span>
                  <span className="text-orange-600">
                    {formatCurrency(total)}
                  </span>
                </div>
              </div>

              <Button type="submit" variant="primary" size="lg" fullWidth className="mt-6" onClick={handleSubmit}>
                Place Order
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>;
}