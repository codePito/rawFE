import React, { useState } from 'react';
import { ShoppingCart, User, LogOut, Shield, Menu, X } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../contexts/AuthContext';
import { SearchBar } from '../common/SearchBar';
export function Header() {
  const {
    getCartCount,
    openCart
  } = useCart();
  const {
    user,
    isAuthenticated,
    isAdmin,
    logout
  } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const cartCount = getCartCount();
  const handleLogout = () => {
    logout();
    navigate('/');
    setMobileMenuOpen(false);
  };
  return <header className="bg-white shadow-sm sticky top-0 z-40">
      {/* Top banner */}
      <div className="bg-primary-500 text-white py-2">
        <div className="max-w-7xl mx-auto px-4">
          <p className="text-xs sm:text-sm text-center">
            🎉 Miễn phí vận chuyển cho đơn hàng trên 500.000đ!
          </p>
        </div>
      </div>

      {/* Main header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-2 sm:gap-4">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 flex-shrink-0">
            <div className="w-8 h-8 bg-primary-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xl">S</span>
            </div>
            <span className="text-lg sm:text-xl font-bold text-gray-900">
              ShopHub
            </span>
          </Link>

          {/* Search - hidden on mobile */}
          <div className="hidden md:block flex-1 max-w-xl">
            <SearchBar />
          </div>

          {/* Right actions */}
          <div className="flex items-center gap-2 flex-shrink-0">
            {/* Cart button */}
            <button onClick={openCart} className="relative p-2 hover:bg-gray-100 rounded-lg transition-colors" aria-label="Shopping cart">
              <ShoppingCart className="w-5 h-5 sm:w-6 sm:h-6 text-gray-700" />
              {cartCount > 0 && <span className="absolute -top-1 -right-1 bg-primary-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                  {cartCount}
                </span>}
            </button>

            {/* Desktop user menu */}
            {isAuthenticated && user ? (
              <div className="hidden md:flex items-center gap-2">
                {isAdmin && (
                  <Link to="/admin" className="flex items-center gap-2 px-3 py-2 bg-primary-50 text-primary-600 rounded-lg hover:bg-primary-100 transition-colors">
                    <Shield className="w-4 h-4" />
                    <span className="text-sm font-medium">Admin</span>
                  </Link>
                )}
                <Link to="/profile" className="flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                  <User className="w-4 h-4" />
                  <span className="text-sm font-medium">{user.fullName}</span>
                </Link>
                <button onClick={handleLogout} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                  <LogOut className="w-5 h-5 text-gray-700" />
                </button>
              </div>
            ) : (
              <Link to="/login" className="hidden md:flex items-center gap-2 px-4 py-2 text-primary-600 hover:bg-primary-50 rounded-lg transition-colors font-medium">
                <User className="w-5 h-5" />
                Đăng nhập
              </Link>
            )}

            {/* Mobile menu button */}
            <button 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors"
              aria-label="Menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile search */}
        <div className="md:hidden pb-3">
          <SearchBar />
        </div>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t bg-white">
          <div className="px-4 py-3 space-y-2">
            {isAuthenticated && user ? (
              <>
                <Link 
                  to="/profile" 
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 bg-gray-50 rounded-lg hover:bg-gray-100"
                >
                  <User className="w-5 h-5" />
                  <span className="font-medium">{user.fullName}</span>
                </Link>
                {isAdmin && (
                  <Link 
                    to="/admin" 
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 bg-primary-50 text-primary-600 rounded-lg hover:bg-primary-100"
                  >
                    <Shield className="w-5 h-5" />
                    <span className="font-medium">Quản trị</span>
                  </Link>
                )}
                <button 
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-4 py-3 bg-gray-50 rounded-lg hover:bg-gray-100 text-left"
                >
                  <LogOut className="w-5 h-5" />
                  <span className="font-medium">Đăng xuất</span>
                </button>
              </>
            ) : (
              <Link 
                to="/login" 
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-3 px-4 py-3 bg-primary-50 text-primary-600 rounded-lg hover:bg-primary-100"
              >
                <User className="w-5 h-5" />
                <span className="font-medium">Đăng nhập</span>
              </Link>
            )}
          </div>
        </div>
      )}
    </header>;
}