import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Eye, EyeOff, ShoppingBag } from 'lucide-react';
// import { useAuth } from '../context/AuthContext';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/common/Button';
import { Input } from '../components/common/Input';
export function RegisterPage() {
  const navigate = useNavigate();
  const {
    register
  } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});
  const [formData, setFormData] = useState({
    userName: '',
    email: '',
    address: '',
    phoneNumber: '',
    password: ''
  });
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setFieldErrors({});
    
    setLoading(true);
    try {
      await register(formData);
      setLoading(false);
      navigate('/');
    } catch (err: any) {
      setLoading(false);
      
      console.log('Registration error:', err);
      console.log('Error response:', err.response);
      console.log('Error data:', err.response?.data);
      
      // Handle validation errors from backend
      if (err.response?.status === 400 && err.response?.data?.errors) {
        const errors = err.response.data.errors;
        setFieldErrors(errors);
        
        // Count total errors
        const errorCount = Object.keys(errors).length;
        setError(`Please fix ${errorCount} validation error${errorCount > 1 ? 's' : ''} below`);
        
        console.log('Validation errors:', errors);
      } else if (err.response?.data?.title) {
        // Handle other error formats
        setError(err.response.data.title);
      } else if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else {
        setError('Registration failed. Please check your information and try again.');
      }
    }
  };
  return <div className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
        <div className="bg-gradient-to-r from-primary-500 to-primary-600 p-8 text-white text-center">
          <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4">
            <ShoppingBag className="w-8 h-8 text-primary-600" />
          </div>
          <h1 className="text-3xl font-bold mb-2">Tham Gia ShopHub</h1>
          <p className="text-primary-100">
            Tạo tài khoản để bắt đầu mua sắm
          </p>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-5">
          <div>
            <Input 
              label="Họ và tên" 
              value={formData.userName} 
              onChange={e => setFormData({ ...formData, userName: e.target.value })} 
              placeholder="Nguyễn Văn A" 
              required 
            />
            {fieldErrors.UserName && (
              <div className="mt-1 text-sm text-red-600">
                {fieldErrors.UserName.map((err, idx) => (
                  <p key={idx}>• {err}</p>
                ))}
              </div>
            )}
            <p className="mt-1 text-xs text-gray-500">5-50 ký tự, chữ cái tiếng Việt/Anh, cho phép khoảng trắng</p>
          </div>

          <div>
            <Input 
              label="Email" 
              type="email" 
              value={formData.email} 
              onChange={e => setFormData({ ...formData, email: e.target.value })} 
              placeholder="email@example.com" 
              required 
            />
            {fieldErrors.Email && (
              <div className="mt-1 text-sm text-red-600">
                {fieldErrors.Email.map((err, idx) => (
                  <p key={idx}>• {err}</p>
                ))}
              </div>
            )}
            <p className="mt-1 text-xs text-gray-500">Định dạng email hợp lệ</p>
          </div>

          <div>
            <Input 
              label="Số điện thoại" 
              type="tel" 
              value={formData.phoneNumber} 
              onChange={e => setFormData({ ...formData, phoneNumber: e.target.value })} 
              placeholder="0123456789" 
              required 
            />
            {fieldErrors.PhoneNumber && (
              <div className="mt-1 text-sm text-red-600">
                {fieldErrors.PhoneNumber.map((err, idx) => (
                  <p key={idx}>• {err}</p>
                ))}
              </div>
            )}
            <p className="mt-1 text-xs text-gray-500">Bắt đầu bằng 0, theo sau là 9-10 chữ số</p>
          </div>

          <div>
            <Input 
              label="Địa chỉ" 
              value={formData.address} 
              onChange={e => setFormData({ ...formData, address: e.target.value })} 
              placeholder="Địa chỉ của bạn" 
              required 
            />
            {fieldErrors.Address && (
              <div className="mt-1 text-sm text-red-600">
                {fieldErrors.Address.map((err, idx) => (
                  <p key={idx}>• {err}</p>
                ))}
              </div>
            )}
            <p className="mt-1 text-xs text-gray-500">Tối đa 200 ký tự</p>
          </div>

          <div className="relative">
            <Input 
              label="Mật khẩu" 
              type={showPassword ? 'text' : 'password'} 
              value={formData.password} 
              onChange={e => setFormData({ ...formData, password: e.target.value })} 
              placeholder="••••••••" 
              required 
            />
            <button 
              type="button" 
              onClick={() => setShowPassword(!showPassword)} 
              className="absolute right-3 top-9 text-gray-400 hover:text-gray-600"
            >
              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
            {fieldErrors.Password && (
              <div className="mt-1 text-sm text-red-600">
                {fieldErrors.Password.map((err, idx) => (
                  <p key={idx}>• {err}</p>
                ))}
              </div>
            )}
            <p className="mt-1 text-xs text-gray-500">
              Tối thiểu 8 ký tự, bao gồm chữ hoa, chữ thường và số
            </p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
              <p className="font-medium">{error}</p>
            </div>
          )}

          <Button type="submit" variant="primary" size="lg" fullWidth disabled={loading}>
            {loading ? 'Đang tạo tài khoản...' : 'Tạo Tài Khoản'}
          </Button>

          <div className="text-center space-y-2">
            <p className="text-sm text-gray-600">
              Đã có tài khoản?{' '}
              <Link to="/login" className="text-primary-600 font-medium hover:text-primary-700">
                Đăng nhập
              </Link>
            </p>
            <Link to="/" className="text-sm text-gray-500 hover:text-gray-700 block">
              Tiếp tục với tư cách khách
            </Link>
          </div>
        </form>
      </div>
    </div>;
}