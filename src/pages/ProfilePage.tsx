import { useState, type ChangeEvent, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { TextField } from '../components/ui/TextField';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useTheme } from '../context/ThemeContext';
import { useToast } from '../context/ToastContext';
import { ordersStorage, reviewsStorage } from '../models/storage';
import type { ProfileFormValues } from '../types/user';
import { isValidEmail, isValidPhone } from '../utils/validation';

type Errors = Partial<Record<keyof ProfileFormValues, string>>;

function validate(v: ProfileFormValues): Errors {
  const e: Errors = {};
  if (v.firstName.trim().length < 2) e.firstName = 'First name must be at least 2 characters';
  if (v.lastName.trim().length < 2) e.lastName = 'Last name must be at least 2 characters';
  if (!isValidEmail(v.email)) e.email = 'Please enter a valid email address';
  if (v.phone.trim() && !isValidPhone(v.phone)) e.phone = 'Please enter a valid phone number';
  return e;
}

export function ProfilePage() {
  const { user, updateProfile, logout } = useAuth();
  const { clear } = useCart();
  const { theme, toggleTheme } = useTheme();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [values, setValues] = useState<ProfileFormValues>({
    firstName: user.firstName ?? '',
    lastName: user.lastName ?? '',
    email: user.email ?? '',
    phone: user.phone ?? '',
  });
  const [errors, setErrors] = useState<Errors>({});

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setValues((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const found = validate(values);
    setErrors(found);
    if (Object.keys(found).length > 0) return;
    updateProfile({
      firstName: values.firstName.trim(),
      lastName: values.lastName.trim(),
      email: values.email.trim(),
      phone: values.phone.trim(),
    });
    showToast('Profile saved ✓');
  };

  const handleClearData = () => {
    if (!window.confirm('Clear cart, orders and reviews? Your session and theme are kept.')) return;
    clear();
    ordersStorage.remove();
    reviewsStorage.remove();
    showToast('Local data cleared');
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="mx-auto max-w-xl space-y-6">
      <h1 className="text-2xl font-bold">Profile</h1>
      <p className="text-gray-600 dark:text-gray-400">Signed in as {user.username}</p>

      <form onSubmit={handleSave} noValidate className="card space-y-4 p-6">
        <div className="grid gap-4 md:grid-cols-2">
          <TextField id="firstName" label="First name" value={values.firstName} onChange={handleChange} error={errors.firstName} autoComplete="given-name" />
          <TextField id="lastName" label="Last name" value={values.lastName} onChange={handleChange} error={errors.lastName} autoComplete="family-name" />
        </div>
        <TextField id="email" label="Email" type="email" value={values.email} onChange={handleChange} error={errors.email} autoComplete="email" />
        <TextField id="phone" label="Phone (optional)" type="tel" value={values.phone} onChange={handleChange} error={errors.phone} autoComplete="tel" />
        <button type="submit" className="btn-primary">
          Save changes
        </button>
      </form>

      <div className="card flex flex-wrap items-center justify-between gap-3 p-4">
        <span>Theme: {theme}</span>
        <button type="button" onClick={toggleTheme} className="btn-secondary">
          Switch to {theme === 'light' ? 'dark' : 'light'}
        </button>
      </div>

      <div className="flex flex-wrap gap-3">
        <button type="button" onClick={handleClearData} className="btn-secondary">
          Clear local data
        </button>
        <button type="button" onClick={handleLogout} className="btn-secondary">
          Log out
        </button>
      </div>
    </div>
  );
}
