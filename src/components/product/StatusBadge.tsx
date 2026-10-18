import type { OrderStatus } from '../../types/order';

const styles: Record<OrderStatus, string> = {
  Processing: 'bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-100',
  Shipped: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  Delivered: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
};

export function StatusBadge({ status }: { status: OrderStatus }) {
  return (
    <span className={`rounded-full px-3 py-1 text-xs font-semibold ${styles[status]}`}>{status}</span>
  );
}
