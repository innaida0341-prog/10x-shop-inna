import { Formik, Form, Field, ErrorMessage } from 'formik';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';
import { checkoutSchema } from '@/utils/validation';
import { formatPrice } from '@/utils/format';
import type { Order, ShippingInfo } from '@/types/order';

// ✅ Empty interface warning-ის გარეშე
type CheckoutFormValues = ShippingInfo;

export default function CheckoutPage() {
  const { user } = useAuth();
  // ✅ ზუსტად შენი CartContext-ის properties
  const { items, cart, clear } = useCart();
  const navigate = useNavigate();
  const [placed, setPlaced] = useState<Order | null>(null);

  useEffect(() => {
    if (items.length === 0 && !placed) navigate('/cart');
  }, [items.length, placed, navigate]);

  if (placed) {
    return (
      <div className="max-w-xl mx-auto text-center py-12">
        <div className="text-6xl mb-3">✓</div>
        <h1 className="text-2xl font-bold mb-2">
          Thank you! Your order has been placed.
        </h1>
        <p className="text-gray-500 mb-1">Order #{placed.number}</p>
        <p className="text-gray-500 mb-6">
          Total: <b>{formatPrice(placed.total)}</b>
        </p>
        <div className="flex justify-center gap-2">
          <button
            onClick={() => navigate('/orders')}
            className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
          >
            View orders
          </button>
          <button
            onClick={() => navigate('/')}
            className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-100"
          >
            Continue shopping
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="grid lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2">
        <h1 className="text-2xl font-bold mb-4">Checkout</h1>
        <Formik<CheckoutFormValues>
          initialValues={{
            fullName: user?.username || '',
            email: '',
            address: '',
            city: ''
          }}
          validationSchema={checkoutSchema}
          onSubmit={(values, { setSubmitting }) => {
            const order: Order = {
              id: Date.now(),
              number: '10X-' + String(Math.floor(Math.random() * 90000) + 10000),
              items: items,
              shipping: values,
              subtotal: cart.subtotal(),
              discount: cart.discount(),
              shippingCost: cart.shipping(),
              total: cart.total(),
              placedAt: new Date().toISOString()
            };
            try {
              const list: Order[] = JSON.parse(
                localStorage.getItem('shop_orders') || '[]'
              );
              list.unshift(order);
              localStorage.setItem('shop_orders', JSON.stringify(list));
            } catch {
              /* ignore */
            }
            clear(); // ✅ შენი CartContext-ის clear() ფუნქცია
            setPlaced(order);
            setSubmitting(false);
          }}
        >
          {({ isSubmitting, errors, touched }) => (
            <Form className="bg-white rounded-xl p-5 space-y-4 shadow">
              <h2 className="font-semibold">Shipping information</h2>
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Full name</label>
                  <Field
                    name="fullName"
                    className={`w-full px-3 py-2 rounded-md border bg-white ${
                      touched.fullName && errors.fullName ? 'border-rose-500' : 'border-gray-300'
                    }`}
                  />
                  <ErrorMessage name="fullName" component="div" className="text-xs text-rose-500 mt-1" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Email</label>
                  <Field
                    name="email"
                    type="email"
                    className={`w-full px-3 py-2 rounded-md border bg-white ${
                      touched.email && errors.email ? 'border-rose-500' : 'border-gray-300'
                    }`}
                  />
                  <ErrorMessage name="email" component="div" className="text-xs text-rose-500 mt-1" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Address</label>
                <Field
                  name="address"
                  className={`w-full px-3 py-2 rounded-md border bg-white ${
                    touched.address && errors.address ? 'border-rose-500' : 'border-gray-300'
                  }`}
                />
                <ErrorMessage name="address" component="div" className="text-xs text-rose-500 mt-1" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">City</label>
                <Field
                  name="city"
                  className={`w-full px-3 py-2 rounded-md border bg-white ${
                    touched.city && errors.city ? 'border-rose-500' : 'border-gray-300'
                  }`}
                />
                <ErrorMessage name="city" component="div" className="text-xs text-rose-500 mt-1" />
              </div>
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 bg-indigo-600 text-white rounded-md font-medium hover:bg-indigo-700 disabled:opacity-50"
              >
                {isSubmitting ? 'Placing order…' : 'Place order'}
              </button>
            </Form>
          )}
        </Formik>
      </div>
      <aside className="bg-white rounded-xl p-5 h-fit shadow">
        <h2 className="font-bold mb-3">Order summary</h2>
        <div className="space-y-2 max-h-60 overflow-y-auto mb-3">
          {items.map((i) => (
            <div key={i.productId} className="flex gap-2 text-sm">
              <img src={i.thumbnail} alt={i.title} className="w-10 h-10 object-cover rounded" />
              <div className="flex-1 min-w-0 line-clamp-1">
                {i.title} × {i.quantity}
              </div>
              <div>{formatPrice(i.price * i.quantity)}</div>
            </div>
          ))}
        </div>
        <div className="space-y-1 text-sm border-t border-gray-200 pt-2">
          <div className="flex justify-between">
            <span>Subtotal</span>
            <span>{formatPrice(cart.subtotal())}</span>
          </div>
          {cart.discount() > 0 && (
            <div className="flex justify-between text-emerald-600">
              <span>Discount</span>
              <span>−{formatPrice(cart.discount())}</span>
            </div>
          )}
          <div className="flex justify-between">
            <span>Shipping</span>
            <span>{cart.shipping() === 0 ? 'Free' : formatPrice(cart.shipping())}</span>
          </div>
          <div className="flex justify-between font-bold text-lg border-t border-gray-200 pt-2">
            <span>Total</span>
            <span>{formatPrice(cart.total())}</span>
          </div>
        </div>
      </aside>
    </div>
  );
}