import { Link } from 'react-router-dom';
import { StatusBadge } from '../components/product/StatusBadge';
import { useNow } from '../hooks/useNow';
import { OrderService } from '../models/Order';
import { loadOrders } from '../models/ordersStore';
import { formatDate, formatPrice } from '../utils/format';

export function OrdersPage() {
  const now = useNow(30_000);
  const orders = loadOrders();

  if (orders.length === 0) {
    return (
      <div className="py-16 text-center">
        <h1 className="text-2xl font-bold">You have no orders yet.</h1>
        <Link to="/" className="btn-primary mt-6">
          Browse products
        </Link>
      </div>
    );
  }

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">Orders</h1>
      <ul className="space-y-3">
        {orders.map((o) => (
          <li key={o.id}>
            <Link
              to={`/orders/${o.id}`}
              className="card flex flex-wrap items-center justify-between gap-3 p-4 transition-colors hover:border-primary"
            >
              <div>
                <p className="font-semibold">#{o.number}</p>
                <p className="text-sm text-gray-500">
                  {formatDate(o.placedAt)} · {o.items.reduce((n, i) => n + i.quantity, 0)} items
                </p>
              </div>
              <div className="flex items-center gap-4">
                <span className="font-semibold">{formatPrice(o.total)}</span>
                <StatusBadge status={OrderService.getStatus(o, now)} />
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
