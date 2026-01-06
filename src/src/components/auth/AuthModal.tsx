import React, { useState } from 'react';
import { X, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../shared/Button';
import { Input } from '../shared/Input';
export function AuthModal() {
  const {
    isAuthModalOpen,
    closeAuthModal,
    login,
    register
  } = useAuth();
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [loginData, setLoginData] = useState({
    email: '',
    password: ''
  });
  const [registerData, setRegisterData] = useState({
    email: '',
    password: '',
    userName: '',
    address: ''
  });
  if (!isAuthModalOpen) return null;
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const success = await login(loginData);
    setLoading(false);
    if (!success) {
      setError('Email hoặc mật khẩu không đúng');
    }
  };
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (registerData.password.length < 6) {
      setError('Mật khẩu phải có ít nhất 6 ký tự');
      return;
    }
    setLoading(true);
    const success = await register(registerData);
    setLoading(false);
    if (!success) {
      setError('Đăng ký thất bại. Vui lòng thử lại.');
    }
  };
  const switchMode = () => {
    setMode(mode === 'login' ? 'register' : 'login');
    setError('');
  };
  return <>
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4" onClick={closeAuthModal} />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
        <div className="bg-white rounded-lg shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto pointer-events-auto animate-scale-in" onClick={e => e.stopPropagation()}>
          <div className="flex items-center justify-between p-4 sm:p-6 border-b sticky top-0 bg-white">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
              {mode === 'login' ? 'Chào mừng trở lại' : 'Tạo tài khoản'}
            </h2>
            <button onClick={closeAuthModal} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-4 sm:p-6">
            {mode === 'login' ? <form onSubmit={handleLogin} className="space-y-4">
                <Input label="Email" type="email" value={loginData.email} onChange={e => setLoginData({
              ...loginData,
              email: e.target.value
            })} placeholder="email@example.com" required />
                <div className="relative">
                  <Input label="Mật khẩu" type={showPassword ? 'text' : 'password'} value={loginData.password} onChange={e => setLoginData({
                ...loginData,
                password: e.target.value
              })} placeholder="••••••••" required />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-9 text-gray-400 hover:text-gray-600">
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>

                {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                    {error}
                  </div>}

                <Button type="submit" variant="primary" size="lg" fullWidth loading={loading}>
                  {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
                </Button>

                <p className="text-center text-sm text-gray-600">
                  Chưa có tài khoản?{' '}
                  <button type="button" onClick={switchMode} className="text-primary-600 font-medium hover:text-primary-700">
                    Đăng ký
                  </button>
                </p>
              </form> : <form onSubmit={handleRegister} className="space-y-4">
                <Input label="Họ và tên" value={registerData.userName} onChange={e => setRegisterData({
              ...registerData,
              userName: e.target.value
            })} placeholder="Nguyễn Văn A" required />
                <Input label="Email" type="email" value={registerData.email} onChange={e => setRegisterData({
              ...registerData,
              email: e.target.value
            })} placeholder="email@example.com" required />
                <Input label="Số điện thoại (Tùy chọn)" type="tel" value={registerData.address} onChange={e => setRegisterData({
              ...registerData,
              address: e.target.value
            })} placeholder="0123 456 789" />
                <div className="relative">
                  <Input label="Mật khẩu" type={showPassword ? 'text' : 'password'} value={registerData.password} onChange={e => setRegisterData({
                ...registerData,
                password: e.target.value
              })} placeholder="••••••••" required />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-9 text-gray-400 hover:text-gray-600">
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>

                {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                    {error}
                  </div>}

                <Button type="submit" variant="primary" size="lg" fullWidth loading={loading}>
                  {loading ? 'Đang tạo tài khoản...' : 'Tạo tài khoản'}
                </Button>

                <p className="text-center text-sm text-gray-600">
                  Đã có tài khoản?{' '}
                  <button type="button" onClick={switchMode} className="text-primary-600 font-medium hover:text-primary-700">
                    Đăng nhập
                  </button>
                </p>
              </form>}
          </div>
        </div>
      </div>
    </>;
}