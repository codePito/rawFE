import { useState, useEffect } from 'react';
import { DollarSign, ShoppingCart, Users, Package, ArrowUpRight } from 'lucide-react';
import { StatCard } from '../../components/common/StatCard';
import { Card } from '../../components/common/Card';
import { TopCustomersChart } from '../../components/charts/TopCustomersChart';
import { ProductSalesMonthlyChart } from '../../components/charts/ProductSalesMonthlyChart';
import analyticsApi from '../../services/analyticsApi';

export function DashboardPage() {
  const currentYear = new Date().getFullYear();

  // State for stats
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [totalOrders, setTotalOrders] = useState(0);
  const [totalUsers, setTotalUsers] = useState(0);
  const [totalProducts, setTotalProducts] = useState(0);

  // State for charts
  const [topCustomers, setTopCustomers] = useState<any[]>([]);
  const [productSalesMonthly, setProductSalesMonthly] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch analytics data
  useEffect(() => {
    const fetchAnalyticsData = async () => {
      setLoading(true);
      setError(null);

      // Fetch stats individually with fallback
      try {
        const revenueRes = await analyticsApi.getTotalRevenue();
        setTotalRevenue(revenueRes.data.total);
      } catch (e) { console.error('Revenue API error:', e); }

      try {
        const ordersRes = await analyticsApi.getTotalOrders();
        setTotalOrders(ordersRes.data.total);
      } catch (e) { console.error('Orders API error:', e); }

      try {
        const usersRes = await analyticsApi.getTotalUsers();
        setTotalUsers(usersRes.data.total);
      } catch (e) { console.error('Users API error:', e); }

      try {
        const productsRes = await analyticsApi.getTotalProducts();
        setTotalProducts(productsRes.data.total);
      } catch (e) { console.error('Products API error:', e); }

      // Fetch charts data
      try {
        const [customersRes, salesRes] = await Promise.all([
          analyticsApi.getTopCustomers(10),
          analyticsApi.getProductSalesMonthly(currentYear)
        ]);
        setTopCustomers(customersRes.data);
        setProductSalesMonthly(salesRes.data);
      } catch (chartsErr) {
        console.error('Charts API error:', chartsErr);
        setError('Không thể tải dữ liệu biểu đồ');
      }

      setLoading(false);
    };

    fetchAnalyticsData();
  }, [currentYear]);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-1">
          Thống kê và phân tích dữ liệu
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Revenue"
          value={totalRevenue}
          icon={DollarSign}
          iconColor="bg-green-500"
          format="currency"
        />
        <StatCard
          title="Total Orders"
          value={totalOrders}
          icon={ShoppingCart}
          iconColor="bg-blue-500"
          format="number"
        />
        <StatCard
          title="Total Users"
          value={totalUsers}
          icon={Users}
          iconColor="bg-purple-500"
          format="number"
        />
        <StatCard
          title="Total Products"
          value={totalProducts}
          icon={Package}
          iconColor="bg-orange-500"
          format="number"
        />
      </div>

      {/* Charts */}
      {loading ? (
        <div className="flex items-center justify-center h-64 bg-white rounded-lg shadow-sm">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-gray-600">Đang tải dữ liệu thống kê...</p>
          </div>
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-600">{error}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ProductSalesMonthlyChart data={productSalesMonthly} year={currentYear} />
          <TopCustomersChart data={topCustomers} />
        </div>
      )}

      {/* Recent Orders */}
      <div className="grid grid-cols-1 gap-6">
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Recent Orders</h3>
            <a href="/admin/orders" className="text-sm text-primary-600 hover:text-primary-700 font-medium flex items-center gap-1">
              View All
              <ArrowUpRight className="w-4 h-4" />
            </a>
          </div>
          <p className="text-gray-500 text-sm">Xem tất cả đơn hàng tại trang Orders</p>
        </Card>
      </div>
    </div>
  );
}