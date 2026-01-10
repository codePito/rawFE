import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Package, ShoppingCart, Users, FolderTree, LogOut, Home } from 'lucide-react';
import { useAuth } from '../../../../src/contexts/AuthContext';
const navigation = [{
  name: 'Dashboard',
  href: '/admin',
  icon: LayoutDashboard
}, {
  name: 'Products',
  href: '/admin/products',
  icon: Package
}, {
  name: 'Orders',
  href: '/admin/orders',
  icon: ShoppingCart
}, {
  name: 'Users',
  href: '/admin/users',
  icon: Users
}, {
  name: 'Categories',
  href: '/admin/categories',
  icon: FolderTree
}];
export function Sidebar() {
  const {
    user,
    logout
  } = useAuth();
  const navigate = useNavigate();
  const handleLogout = () => {
    logout();
    navigate('/login');
  };
  return <div className="w-64 bg-sidebar-bg text-white min-h-screen fixed left-0 top-0 flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b border-gray-700">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-xl">S</span>
          </div>
          <div>
            <h1 className="text-lg font-bold">ShopHub</h1>
            <p className="text-xs text-gray-400">Admin Dashboard</p>
          </div>
        </div>
      </div>

      {/* User Info */}
      {user && <div className="px-6 py-4 border-b border-gray-700">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary-600 rounded-full flex items-center justify-center">
              <span className="text-white font-medium text-sm">
                {user.fullName.charAt(0).toUpperCase()}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">
                {user.fullName}
              </p>
              <p className="text-xs text-gray-400 truncate">{user.email}</p>
            </div>
          </div>
        </div>}

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1">
        {navigation.map(item => <NavLink key={item.name} to={item.href} end={item.href === '/admin'} className={({
        isActive
      }) => `flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${isActive ? 'bg-primary-600 text-white' : 'text-gray-300 hover:bg-sidebar-hover hover:text-white'}`}>
            <item.icon className="w-5 h-5" />
            <span className="font-medium">{item.name}</span>
          </NavLink>)}
      </nav>

      {/* Footer Actions */}
      <div className="p-4 border-t border-gray-700 space-y-2">
        <button onClick={() => navigate('/')} className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-300 hover:bg-sidebar-hover hover:text-white transition-colors w-full">
          <Home className="w-5 h-5" />
          <span className="font-medium">Back to Store</span>
        </button>
        <button onClick={handleLogout} className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-300 hover:bg-sidebar-hover hover:text-white transition-colors w-full">
          <LogOut className="w-5 h-5" />
          <span className="font-medium">Logout</span>
        </button>
      </div>
    </div>;
}