export function StockBadge({ stock }: { stock: number }) {
  if (stock <= 0) {
    return <span className="text-sm font-medium text-danger">Out of stock</span>;
  }
  if (stock <= 5) {
    return <span className="text-sm font-medium text-warning">Only {stock} left!</span>;
  }
  return <span className="text-sm font-medium text-success">In stock</span>;
}
