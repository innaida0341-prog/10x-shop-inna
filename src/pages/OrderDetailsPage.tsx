import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import { StatusBadge } from '../components/product/StatusBadge';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';
import { useNow } from '../hooks/useNow';
import { Cart } from '../models/Cart';
import { OrderService } from '../models/Order';
import { loadOrders } from '../models/ordersStore';
import type { OrderStatus } from '../types/order';
import { formatDate, formatPrice } from '../utils/format';
import { hasJustPlaced } from '../utils/guards.extra';
import { NotFoundPage } from './NotFoundPage';

const STEPS: OrderStatus[] = ['Processing', 'Shipped', 'Delivered'];

export function OrderDetailsPage() {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const now = useNow(30_000);
  const { addItem } = useCart();
  const { showToast } = useToast();

  const order = loadOrders().find((o) => String(o.id) === id);
  if (!order) return <NotFoundPage />;

  const status = OrderService.getStatus(order, now);
  const reached = STEPS.indexOf(status);
  const { shipping } = order;

  const handleReorder = () => {
    let skipped = 0;
    for (const item of order.items) {
      if (!addItem(item, item.quantity).ok) skipped++;
    }
    if (skipped > 0) showToast(`${skipped} item(s) could not be added (stock limit)`, 'error');
    else showToast('Items added to cart ✓');
    navigate('/cart');
  };

  return (
    <div className="space-y-6">
      {hasJustPlaced(location.state) && (
        <div role="status" className="rounded-xl border border-green-200 bg-green-50 p-4 text-green-900 dark:border-green-900 dark:bg-green-950 dark:text-green-200">
          <p className="font-semibold">Thank you! Your order has been placed.</p>
          <p className="text-sm">Order total: {formatPrice(order.total)}</p>
        </div>
      )}

      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h1 className="text-2xl font-bold">Order #{order.number}</h1>
          <p className="text-sm text-gray-500">{formatDate(order.placedAt)}</p>
        </div>
        <StatusBadge status={status} />
      </div>

      <ol className="flex flex-wrap gap-x-6 gap-y-2" aria-label="Order progress">
        {STEPS.map((s, i) => (
          <li key={s} className={i <= reached ? 'font-semibold text-success' : 'text-gray-400'}>
            {i <= reached ? '✓' : '○'} {s}
          </li>
        ))}
      </ol>

      <div className="card overflow-x-auto">
        <table className="w-full min-w-[32rem] text-left text-sm">
          <thead className="border-b border-gray-200 dark:border-gray-700">
            <tr>
              <th className="p-3">Product</th>
              <th className="p-3">Qty</th>
              <th className="p-3">Unit price</th>
              <th className="p-3 text-right">Total</th>
            </tr>
          </thead>
          <tbody>
            {order.items.map((i) => (
              <tr key={i.productId} className="border-b border-gray-100 last:border-0 dark:border-gray-700">
                <td className="flex items-center gap-3 p-3">
                  <img src={i.thumbnail} alt="" width={40} height={40} loading="lazy" className="size-10 rounded bg-gray-100 object-contain dark:bg-gray-700" />
                  {i.title}
                </td>
                <td className="p-3">{i.quantity}</td>
                <td className="p-3">{formatPrice(Cart.unitPrice(i))}</td>
                <td className="p-3 text-right">{formatPrice(Cart.lineTotal(i))}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="card space-y-1 p-4 text-sm">
          <h2 className="mb-2 font-semibold">Shipping address</h2>
          <p>{shipping.fullName}</p>
          <p>{shipping.address}</p>
          <p>
            {shipping.city}
            {shipping.postalCode ? `, ${shipping.postalCode}` : ''}
          </p>
          {shipping.country && <p>{shipping.country}</p>}
          <p className="text-gray-500">{shipping.email}</p>
        </div>
        <dl className="card space-y-1 p-4 text-sm">
          <div className="flex justify-between"><dt>Subtotal</dt><dd>{formatPrice(order.subtotal)}</dd></div>
          {order.discount > 0 && (
            <div className="flex justify-between text-success"><dt>Discount</dt><dd>−{formatPrice(order.discount)}</dd></div>
          )}
          <div className="flex justify-between"><dt>Shipping</dt><dd>{order.shippingCost === 0 ? 'Free' : formatPrice(order.shippingCost)}</dd></div>
          <div className="flex justify-between text-base font-bold"><dt>Total</dt><dd>{formatPrice(order.total)}</dd></div>
        </dl>
      </div>

      <div className="flex flex-wrap gap-3">
        <button type="button" onClick={handleReorder} className="btn-primary">
          Reorder
        </button>
        <Link to="/orders" className="btn-secondary">
          ← All orders
        </Link>
      </div>
    </div>
  );
}
