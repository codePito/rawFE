import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import orderApi from '../api/orderApi';
import { Order } from '../types';
import { Card } from '../components/shared/Card';
import { Badge } from '../components/shared/Badge';
import { formatCurrency} from '../utils/formatters';
import { formatDate } from '../../admin-ui/src/utils/formatters';
import { Loader } from '../components/common/Loader';

export function OrderHistoryPage() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
        orderApi.getByUserId(parseInt(user.id))
            .then(res => setOrders(res.data))
            .catch(err => console.error(err))
            .finally(() => setLoading(false));
    }
  }, [user]);

  const getStatusVariant = (status: string) => {
      switch(status) {
          case 'Paid': return 'success';
          case 'Pending': return 'warning';
          case 'Failed': return 'danger';
          default: return 'primary';
      }
  };

  if (loading) return <Loader fullScreen />;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Lịch sử đơn hàng</h1>
      <div className="space-y-4">
        {orders.map(order => (
            <Card key={order.id} className="border border-gray-100">
                <div className="flex justify-between items-start border-b pb-3 mb-3">
                    <div>
                        <p className="font-bold text-lg">Đơn hàng #{order.id}</p>
                        <p className="text-sm text-gray-500">{formatDate(order.createdAt)}</p>
                    </div>
                    {/* Badge component trong rawFE nhận variant khác, cần map đúng */}
                    <Badge variant={getStatusVariant(order.status) as any}>
                        {order.status}
                    </Badge>
                </div>
                <div className="space-y-2">
                    {order.items.map((item, idx) => (
                        <div key={idx} className="flex justify-between text-sm">
                            <span>{item.productName} x {item.quantity}</span>
                            <span>{formatCurrency(item.unitPrice * item.quantity)}</span>
                        </div>
                    ))}
                </div>
                <div className="mt-4 pt-3 border-t flex justify-end">
                    <span className="font-bold text-lg text-orange-600">
                        Tổng: {formatCurrency(order.totalAmount)}
                    </span>
                </div>
            </Card>
        ))}
      </div>
    </div>
  );
}