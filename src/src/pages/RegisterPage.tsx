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
  const [formData, setFormData] = useState({
    userName: '',
    email: '',
    address: '',
    password: ''
  });
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    setLoading(true);
    const success = await register(formData);
    setLoading(false);
    if (success) {
      navigate('/');
    } else {
      setError('Registration failed. Please try again.');
    }
  };
  return <div className="min-h-screen bg-gradient-to-br from-orange-50 to-orange-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
        <div className="bg-gradient-to-r from-orange-500 to-orange-600 p-8 text-white text-center">
          <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4">
            <ShoppingBag className="w-8 h-8 text-orange-600" />
          </div>
          <h1 className="text-3xl font-bold mb-2">Join ShopHub</h1>
          <p className="text-orange-100">
            Create your account to start shopping
          </p>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          <Input label="Full Name" value={formData.userName} onChange={e => setFormData({
          ...formData,
          userName: e.target.value
        })} placeholder="John Doe" required />

          <Input label="Email" type="email" value={formData.email} onChange={e => setFormData({
          ...formData,
          email: e.target.value
        })} placeholder="your@email.com" required />

          <Input label="Addess (Optional)" type="adress" value={formData.address} onChange={e => setFormData({
          ...formData,
          address: e.target.value
        })} placeholder="Adress" />

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

          <Button type="submit" variant="primary" size="lg" fullWidth disabled={loading}>
            {loading ? 'Creating account...' : 'Create Account'}
          </Button>

          <div className="text-center space-y-2">
            <p className="text-sm text-gray-600">
              Already have an account?{' '}
              <Link to="/login" className="text-orange-600 font-medium hover:text-orange-700">
                Sign in
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