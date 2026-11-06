
import { Formik, Form, Field, ErrorMessage } from 'formik';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';
import { checkoutSchema } from '@/utils/validation';
import { formatPrice } from '@/utils/format';
import type { Order, ShippingInfo } from '@/types/order';

type CheckoutFormValues = ShippingInfo;

export default function CheckoutPage() {
  const { user } = useAuth();
  const { items, cart, clear } = useCart();
  const navigate = useNavigate();
  const [placed, setPlaced] = useState<Order | null>(null);

  useEffect(() => {
    if (items.length === 0 && !placed) {
      navigate('/cart');
    }
  }, [items.length, placed, navigate]);

  const inputClass = (hasError: boolean) =>
    `w-full rounded-md border px-3 py-2 text-sm outline-none transition-colors
    bg-white text-gray-900 placeholder-gray-400
    dark:bg-gray-900 dark:text-gray-100 dark:placeholder-gray-500
    ${
      hasError
        ? 'border-rose-500 focus:ring-2 focus:ring-rose-500'
        : 'border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 dark:border-gray-600 dark:focus:border-indigo-400 dark:focus:ring-indigo-400'
    }`;

  if (placed) {
    return (
      <div className="mx-auto max-w-xl rounded-xl bg-white p-8 text-center shadow-sm dark:bg-gray-800">
        <div className="mb-3 text-6xl text-emerald-500">✓</div>

        <h1 className="mb-2 text-2xl font-bold text-gray-900 dark:text-gray-100">
          Thank you! Your order has been placed.
        </h1>

        <p className="mb-1 text-gray-500 dark:text-gray-400">
          Order #{placed.number}
        </p>

        <p className="mb-6 text-gray-600 dark:text-gray-300">
          Total: <b className="text-gray-900 dark:text-white">
            {formatPrice(placed.total)}
          </b>
        </p>

        <div className="flex flex-wrap justify-center gap-2">
          <button
            onClick={() => navigate('/orders')}
            className="rounded-md bg-indigo-600 px-4 py-2 text-white transition-colors hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600"
          >
            View orders
          </button>

          <button
            onClick={() => navigate('/')}
            className="rounded-md border border-gray-300 px-4 py-2 text-gray-700 transition-colors hover:bg-gray-100 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-700"
          >
            Continue shopping
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="grid gap-6 text-gray-900 dark:text-gray-100 lg:grid-cols-3">
      <div className="lg:col-span-2">
        <h1 className="mb-4 text-2xl font-bold text-gray-900 dark:text-white">
          Checkout
        </h1>

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
              number:
                '10X-' +
                String(Math.floor(Math.random() * 90000) + 10000),
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
              // Ignore localStorage errors.
            }

            clear();
            setPlaced(order);
            setSubmitting(false);
          }}
        >
          {({ isSubmitting, errors, touched }) => (
            <Form className="space-y-4 rounded-xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-800">
              <h2 className="font-semibold text-gray-900 dark:text-white">
                Shipping information
              </h2>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label
                    htmlFor="fullName"
                    className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-200"
                  >
                    Full name
                  </label>

                  <Field
                    id="fullName"
                    name="fullName"
                    className={inputClass(
                      Boolean(touched.fullName && errors.fullName)
                    )}
                  />

                  <ErrorMessage
                    name="fullName"
                    component="div"
                    className="mt-1 text-xs text-rose-500"
                  />
                </div>

                <div>
                  <label
                    htmlFor="email"
                    className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-200"
                  >
                    Email
                  </label>

                  <Field
                    id="email"
                    name="email"
                    type="email"
                    className={inputClass(
                      Boolean(touched.email && errors.email)
                    )}
                  />

                  <ErrorMessage
                    name="email"
                    component="div"
                    className="mt-1 text-xs text-rose-500"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="address"
                  className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-200"
                >
                  Address
                </label>

                <Field
                  id="address"
                  name="address"
                  className={inputClass(
                    Boolean(touched.address && errors.address)
                  )}
                />

                <ErrorMessage
                  name="address"
                  component="div"
                  className="mt-1 text-xs text-rose-500"
                />
              </div>

              <div>
                <label
                  htmlFor="city"
                  className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-200"
                >
                  City
                </label>

                <Field
                  id="city"
                  name="city"
                  className={inputClass(
                    Boolean(touched.city && errors.city)
                  )}
                />

                <ErrorMessage
                  name="city"
                  component="div"
                  className="mt-1 text-xs text-rose-500"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full rounded-md bg-indigo-600 py-3 font-medium text-white transition-colors hover:bg-indigo-700 disabled:opacity-50 dark:bg-indigo-500 dark:hover:bg-indigo-600"
              >
                {isSubmitting ? 'Placing order…' : 'Place order'}
              </button>
            </Form>
          )}
        </Formik>
      </div>

      <aside className="h-fit rounded-xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-800">
        <h2 className="mb-3 font-bold text-gray-900 dark:text-white">
          Order summary
        </h2>

        <div className="mb-3 max-h-60 space-y-2 overflow-y-auto">
          {items.map((item) => (
            <div
              key={item.productId}
              className="flex gap-2 text-sm text-gray-700 dark:text-gray-300"
            >
              <img
                src={item.thumbnail}
                alt={item.title}
                className="h-10 w-10 rounded object-cover"
              />

              <div className="line-clamp-1 min-w-0 flex-1">
                {item.title} × {item.quantity}
              </div>

              <div className="shrink-0 font-medium text-gray-900 dark:text-gray-100">
                {formatPrice(item.price * item.quantity)}
              </div>
            </div>
          ))}
        </div>

        <div className="space-y-2 border-t border-gray-200 pt-3 text-sm dark:border-gray-700">
          <div className="flex justify-between text-gray-600 dark:text-gray-300">
            <span>Subtotal</span>
            <span>{formatPrice(cart.subtotal())}</span>
          </div>

          {cart.discount() > 0 && (
            <div className="flex justify-between text-emerald-600 dark:text-emerald-400">
              <span>Discount</span>
              <span>−{formatPrice(cart.discount())}</span>
            </div>
          )}

          <div className="flex justify-between text-gray-600 dark:text-gray-300">
            <span>Shipping</span>
            <span>
              {cart.shipping() === 0
                ? 'Free'
                : formatPrice(cart.shipping())}
            </span>
          </div>

          <div className="flex justify-between border-t border-gray-200 pt-3 text-lg font-bold text-gray-900 dark:border-gray-700 dark:text-white">
            <span>Total</span>
            <span>{formatPrice(cart.total())}</span>
          </div>
        </div>
      </aside>
    </div>
  );
}
