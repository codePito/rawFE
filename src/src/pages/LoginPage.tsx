import React, { useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { Eye, EyeOff, ShoppingBag } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/shared/Button';
import { Input } from '../components/shared/Input';
export function LoginPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const {
    login,
    isAdmin
  } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const success = await login(formData);
    setLoading(false);
    if (success) {
      // Check if redirect parameter exists
      const redirect = searchParams.get('redirect');
      // Redirect based on role
      if (redirect === 'admin') {
        navigate('/admin');
      } else {
        navigate('/');
      }
    } else {
      setError('Invalid email or password');
    }
  };
  return <div className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
        <div className="bg-gradient-to-r from-primary-500 to-primary-600 p-8 text-white text-center">
          <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4">
            <ShoppingBag className="w-8 h-8 text-primary-600" />
          </div>
          <h1 className="text-3xl font-bold mb-2">Welcome Back!</h1>
          <p className="text-primary-100">Sign in to continue</p>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          {/* <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm text-blue-800">
            <p className="font-medium mb-1">Demo Accounts:</p>
            <p>👤 User: user@example.com</p>
            <p>👨‍💼 Admin: admin@example.com</p>
            <p className="text-xs mt-1 text-blue-600">Password: any</p>
          </div> */}

          <Input label="Email" type="email" value={formData.email} onChange={e => setFormData({
          ...formData,
          email: e.target.value
        })} placeholder="your@email.com" required />

          <div className="relative">
            <Input label="Password" type={showPassword ? 'text' : 'password'} value={formData.password} onChange={e => setFormData({
            ...formData,
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
            {loading ? 'Signing in...' : 'Sign In'}
          </Button>

          <div className="text-center space-y-2">
            <p className="text-sm text-gray-600">
              Don't have an account?{' '}
              <Link to="/register" className="text-primary-600 font-medium hover:text-primary-700">
                Sign up
              </Link>
            </p>
            <Link to="/" className="text-sm text-gray-500 hover:text-gray-700 block">
              Continue as guest
            </Link>
          </div>
        </form>
      </div>
    </div>;
}