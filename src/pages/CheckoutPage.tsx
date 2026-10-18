import { useRef, useState, type ChangeEvent, type FocusEvent, type FormEvent } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { TextField } from '../components/ui/TextField';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { Cart } from '../models/Cart';
import { OrderService } from '../models/Order';
import { loadOrders, saveOrder } from '../models/ordersStore';
import type { CheckoutFormValues } from '../types/order';
import { formatPrice } from '../utils/format';
import { isValidEmail, isValidPhone, isValidPostalCode } from '../utils/validation';

const COUNTRIES = ['Georgia', 'Armenia', 'Azerbaijan', 'Germany', 'United States', 'United Kingdom'];

type Errors = Partial<Record<keyof CheckoutFormValues, string>>;

function validate(v: CheckoutFormValues): Errors {
  const e: Errors = {};
  if (v.fullName.trim().length < 3) e.fullName = 'Full name must be at least 3 characters';
  if (!isValidEmail(v.email)) e.email = 'Please enter a valid email address';
  if (!isValidPhone(v.phone)) e.phone = 'Please enter a valid phone number';
  if (v.address.trim().length < 5) e.address = 'Address must be at least 5 characters';
  if (!v.city.trim()) e.city = 'City is required';
  if (!isValidPostalCode(v.postalCode)) e.postalCode = 'Postal code must be 4-10 digits';
  if (!COUNTRIES.includes(v.country)) e.country = 'Please select a country';
  return e;
}

export function CheckoutPage() {
  const { user } = useAuth();
  const { items, cart, clear } = useCart();
  const navigate = useNavigate();
  const placedRef = useRef(false);

  const [values, setValues] = useState<CheckoutFormValues>({
    fullName: [user.firstName, user.lastName].filter(Boolean).join(' ') || user.username,
    email: user.email ?? '',
    address: '',
    city: '',
    phone: user.phone ?? '',
    postalCode: '',
    country: 'Georgia',
  });
  const [errors, setErrors] = useState<Errors>({});
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  // Cart emptied by "Place order" must not bounce the user to /cart
  if (items.length === 0 && !placedRef.current) {
    return <Navigate to="/cart" replace />;
  }

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setValues((prev) => ({ ...prev, [name]: value }));
    if (errors[name as keyof CheckoutFormValues]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const handleBlur = (e: FocusEvent<HTMLInputElement | HTMLSelectElement>) => {
    const name = e.target.name as keyof CheckoutFormValues;
    setErrors((prev) => ({ ...prev, [name]: validate(values)[name] }));
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const found = validate(values);
    setErrors(found);
    if (Object.keys(found).length > 0) return;

    setSubmitting(true);
    setFormError('');
    try {
      const order = OrderService.create(
        cart,
        {
          fullName: values.fullName.trim(),
          email: values.email.trim(),
          address: values.address.trim(),
          city: values.city.trim(),
          phone: values.phone.trim(),
          postalCode: values.postalCode.trim(),
          country: values.country,
        },
        loadOrders().length + 1,
      );
      saveOrder(order);
      placedRef.current = true;
      clear();
      navigate(`/orders/${order.id}`, { replace: true, state: { justPlaced: true } });
    } catch {
      setFormError('We could not place your order. Please try again.');
      setSubmitting(false);
    }
  };

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">Checkout</h1>
      <div className="grid gap-6 lg:grid-cols-3">
        <form onSubmit={handleSubmit} noValidate className="card space-y-4 p-6 lg:col-span-2">
          <h2 className="text-lg font-semibold">Shipping details</h2>
          <div className="grid gap-4 md:grid-cols-2">
            <TextField id="fullName" label="Full name" value={values.fullName} onChange={handleChange} onBlur={handleBlur} error={errors.fullName} autoComplete="name" />
            <TextField id="email" label="Email" type="email" value={values.email} onChange={handleChange} onBlur={handleBlur} error={errors.email} autoComplete="email" />
            <TextField id="phone" label="Phone" type="tel" value={values.phone} onChange={handleChange} onBlur={handleBlur} error={errors.phone} autoComplete="tel" />
            <TextField id="address" label="Address" value={values.address} onChange={handleChange} onBlur={handleBlur} error={errors.address} autoComplete="street-address" />
            <TextField id="city" label="City" value={values.city} onChange={handleChange} onBlur={handleBlur} error={errors.city} autoComplete="address-level2" />
            <TextField id="postalCode" label="Postal code" value={values.postalCode} onChange={handleChange} onBlur={handleBlur} error={errors.postalCode} autoComplete="postal-code" />
          </div>
          <div>
            <label htmlFor="country" className="mb-1 block text-sm font-medium">
              Country
            </label>
            <select id="country" name="country" value={values.country} onChange={handleChange} onBlur={handleBlur} className="input-field">
              <option value="">Select a country</option>
              {COUNTRIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
            {errors.country && <p className="mt-1 text-sm text-danger">{errors.country}</p>}
          </div>
          {formError && (
            <p role="alert" className="text-sm text-danger">
              {formError}
            </p>
          )}
          <button type="submit" disabled={submitting} className="btn-primary w-full md:w-auto">
            {submitting ? 'Placing order…' : 'Place order'}
          </button>
          <p className="text-xs text-gray-500">This is a demo store. No payment details are collected.</p>
        </form>

        <aside className="card h-fit space-y-3 p-4">
          <h2 className="text-lg font-semibold">Order summary</h2>
          <ul className="space-y-2 text-sm">
            {items.map((i) => (
              <li key={i.productId} className="flex justify-between gap-2">
                <span className="truncate">
                  {i.title} × {i.quantity}
                </span>
                <span>{formatPrice(Cart.lineTotal(i))}</span>
              </li>
            ))}
          </ul>
          <dl className="space-y-1 border-t border-gray-200 pt-3 text-sm dark:border-gray-700">
            <div className="flex justify-between">
              <dt>Subtotal</dt>
              <dd>{formatPrice(cart.subtotal())}</dd>
            </div>
            {cart.discount() > 0 && (
              <div className="flex justify-between text-success">
                <dt>Discount</dt>
                <dd>−{formatPrice(cart.discount())}</dd>
              </div>
            )}
            <div className="flex justify-between">
              <dt>Shipping</dt>
              <dd>{cart.shipping() === 0 ? 'Free' : formatPrice(cart.shipping())}</dd>
            </div>
            <div className="flex justify-between text-base font-bold">
              <dt>Total</dt>
              <dd>{formatPrice(cart.total())}</dd>
            </div>
          </dl>
          <Link to="/cart" className="text-sm text-primary hover:underline">
            ← Edit cart
          </Link>
        </aside>
      </div>
    </div>
  );
}
