import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { QuantityStepper } from '../components/ui/QuantityStepper';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';
import { Cart } from '../models/Cart';
import { formatPrice } from '../utils/format';

export function CartPage() {
  const { items, cart, promoCode, setQuantity, removeItem, clear, applyPromo, removePromo } = useCart();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [code, setCode] = useState('');
  const [promoError, setPromoError] = useState('');

  if (items.length === 0) {
    return (
      <div className="py-16 text-center">
        <h1 className="text-2xl font-bold">Your cart is empty.</h1>
        <Link to="/" className="btn-primary mt-6">
          Browse products
        </Link>
      </div>
    );
  }

  const handleClear = () => {
    if (window.confirm('Clear the cart? This cannot be undone.')) clear();
  };

  const handleApply = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (applyPromo(code)) {
      setPromoError('');
      setCode('');
      showToast('Promo code applied ✓');
    } else {
      setPromoError('Invalid promo code');
    }
  };

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">Cart</h1>
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <ul className="space-y-3">
            {items.map((item) => (
              <li key={item.productId} className="card flex flex-wrap items-center gap-4 p-3">
                <img
                  src={item.thumbnail}
                  alt={item.title}
                  width={80}
                  height={80}
                  loading="lazy"
                  className="size-20 rounded-lg bg-gray-100 object-contain dark:bg-gray-700"
                />
                <div className="min-w-0 flex-1 basis-40">
                  <Link to={`/products/${item.productId}`} className="font-semibold hover:text-primary">
                    {item.title}
                  </Link>
                  <p className="text-sm text-gray-500">{formatPrice(Cart.unitPrice(item))} each</p>
                </div>
                <QuantityStepper
                  value={item.quantity}
                  max={item.stock}
                  onChange={(q) => setQuantity(item.productId, q)}
                  label={`quantity of ${item.title}`}
                />
                <p className="w-24 text-right font-semibold">{formatPrice(Cart.lineTotal(item))}</p>
                <button
                  type="button"
                  onClick={() => {
                    removeItem(item.productId);
                    showToast('Removed from cart');
                  }}
                  className="min-h-11 rounded-lg px-3 text-sm text-danger hover:bg-red-50 dark:hover:bg-red-950"
                >
                  Remove
                </button>
              </li>
            ))}
          </ul>
          <button type="button" onClick={handleClear} className="btn-secondary mt-4">
            Clear cart
          </button>
        </div>

        <aside className="card h-fit space-y-3 p-4">
          <h2 className="text-lg font-semibold">Order summary</h2>

          {promoCode ? (
            <p className="flex items-center justify-between text-sm">
              <span>Promo {promoCode} applied</span>
              <button type="button" onClick={removePromo} className="text-primary hover:underline">
                Remove
              </button>
            </p>
          ) : (
            <form onSubmit={handleApply} noValidate>
              <label htmlFor="promo" className="mb-1 block text-sm font-medium">
                Promo code
              </label>
              <div className="flex gap-2">
                <input
                  id="promo"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  className="input-field"
                  aria-invalid={promoError ? true : undefined}
                />
                <button type="submit" className="btn-secondary">
                  Apply
                </button>
              </div>
              {promoError && <p className="mt-1 text-sm text-danger">{promoError}</p>}
            </form>
          )}

          <dl className="space-y-1 text-sm">
            <div className="flex justify-between">
              <dt>Subtotal</dt>
              <dd>{formatPrice(cart.subtotal())}</dd>
            </div>
            {cart.discount() > 0 && (
              <div className="flex justify-between text-success">
                <dt>
                  Discount ({Cart.PROMO_CODE} −{Cart.PROMO_PERCENT}%)
                </dt>
                <dd>−{formatPrice(cart.discount())}</dd>
              </div>
            )}
            <div className="flex justify-between">
              <dt>Shipping</dt>
              <dd>{cart.shipping() === 0 ? 'Free' : formatPrice(cart.shipping())}</dd>
            </div>
            <div className="flex justify-between border-t border-gray-200 pt-2 text-base font-bold dark:border-gray-700">
              <dt>Total</dt>
              <dd>{formatPrice(cart.total())}</dd>
            </div>
          </dl>
          <p className="text-xs text-gray-500">Free shipping on orders of ${Cart.FREE_SHIPPING_FROM} or more.</p>
          <button type="button" onClick={() => navigate('/checkout')} className="btn-primary w-full">
            Proceed to checkout
          </button>
        </aside>
      </div>
    </div>
  );
}
