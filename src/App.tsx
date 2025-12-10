import React, { Component } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './src/contexts/AuthContext';
import { CartProvider } from './src/context/CartContext';
import { ProductProvider } from './src/context/ProductContext';
import { AdminRoute } from './src/guards/AdminRoute';
// User Layouts
import { Layout as UserLayout } from './src/components/layout/Layout';
// Admin Layout
import { AdminLayout } from './admin-ui/src/components/layout/AdminLayout';
// User Pages
import { HomePage } from './src/pages/HomePage';
import { CategoryPage } from './src/pages/CategoryPage';
import { ProductDetailPage } from './src/pages/ProductDetailPage';
import { CheckoutPage } from './src/pages/CheckoutPage';
import { SearchPage } from './src/pages/SearchPage';
import { LoginPage } from './src/pages/LoginPage';
import { RegisterPage } from './src/pages/RegisterPage';
// Admin Pages
import { DashboardPage } from './admin-ui/src/pages/dashboard/DashboardPage';
import { ProductsPage as AdminProductsPage } from './admin-ui/src/pages/products/ProductsPage';
import { OrdersPage } from './admin-ui/src/pages/orders/OrdersPage';
import { UsersPage } from './admin-ui/src/pages/users/UsersPage';
import { CategoriesPage } from './admin-ui/src/pages/categories/CategoriesPage';

// Shared Components
import { CartModal } from './src/components/cart/CartModal';
import { AuthModal } from './src/components/auth/AuthModal';
import { PaymentResultPage } from './src/pages/PaymentResultPage';
import { OrderHistoryPage } from './src/pages/OrderHistoryPage';
export function App() {
  return <BrowserRouter>
      <AuthProvider>
        <ProductProvider>
          <CartProvider>
            <Routes>
              {/* Auth Routes (No Layout) */}
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />

              {/* User Routes (User Layout) */}
              <Route path="/*" element={<UserLayout>
                    <Routes>
                      <Route path="/" element={<HomePage />} />
                      <Route path="/category/:categoryId" element={<CategoryPage />} />
                      <Route path="/product/:productId" element={<ProductDetailPage />} />
                      <Route path="/checkout" element={<CheckoutPage />} />
                      <Route path="/search" element={<SearchPage />} />
                      <Route path="/payment-result" element={<PaymentResultPage/>} />
                      <Route path="orders" element={<OrderHistoryPage/>}/>
                    </Routes>
                  </UserLayout>} />

              {/* Admin Routes (Admin Layout + Protected) */}
              <Route path="/admin/*" element={<AdminRoute>
                    <AdminLayout>
                      <Routes>
                        <Route path="/" element={<DashboardPage />} />
                        <Route path="/products" element={<AdminProductsPage />} />
                        <Route path="/orders" element={<OrdersPage />} />
                        <Route path="/users" element={<UsersPage />} />
                        <Route path="/categories" element={<CategoriesPage />} />
                        
                        <Route path="/sellers" element={<div className="text-2xl font-bold">
                              Sellers (Coming Soon)
                            </div>} />
                        <Route path="/coupons" element={<div className="text-2xl font-bold">
                              Coupons (Coming Soon)
                            </div>} />
                        <Route path="/settings" element={<div className="text-2xl font-bold">
                              Settings (Coming Soon)
                            </div>} />
                      </Routes>
                    </AdminLayout>
                  </AdminRoute>} />
            </Routes>

            {/* Global Modals */}
            <CartModal />
            <AuthModal />
          </CartProvider>
        </ProductProvider>
      </AuthProvider>
    </BrowserRouter>;
}