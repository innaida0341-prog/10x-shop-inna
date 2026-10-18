import { useState, type ChangeEvent, type FormEvent } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { TextField } from '../components/ui/TextField';
import { useAuth } from '../context/AuthContext';
import { hasFromState } from '../utils/guards.extra';
import type { LoginFormValues } from '../types/user';

type Errors = Partial<Record<keyof LoginFormValues, string>>;

function validate(v: LoginFormValues): Errors {
  const errors: Errors = {};
  if (!v.username.trim()) errors.username = 'Username is required';
  if (!v.password) errors.password = 'Password is required';
  else if (v.password.length < 6) errors.password = 'Password must be at least 6 characters';
  return errors;
}

export function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = hasFromState(location.state) ? location.state.from : '/';

  const [values, setValues] = useState<LoginFormValues>({ username: '', password: '' });
  const [errors, setErrors] = useState<Errors>({});

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setValues((prev) => ({ ...prev, [name]: value }));
    if (errors[name as keyof LoginFormValues]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const found = validate(values);
    setErrors(found);
    if (Object.keys(found).length > 0) return;
    login(values.username);
    navigate(from, { replace: true });
  };

  return (
    <div className="mx-auto max-w-sm">
      <form onSubmit={handleSubmit} noValidate className="card space-y-4 p-6">
        <h1 className="text-2xl font-bold">Log in</h1>
        {from === '/checkout' && (
          <p className="rounded-lg bg-blue-50 p-3 text-sm text-blue-800 dark:bg-blue-950 dark:text-blue-200">
            Please log in to continue to checkout.
          </p>
        )}
        <TextField
          id="username"
          label="Username"
          value={values.username}
          onChange={handleChange}
          error={errors.username}
          autoComplete="username"
        />
        <TextField
          id="password"
          label="Password"
          type="password"
          value={values.password}
          onChange={handleChange}
          error={errors.password}
          autoComplete="current-password"
        />
        <button type="submit" className="btn-primary w-full">
          Log In
        </button>
        <Link to="/" className="block text-center text-sm text-primary hover:underline">
          ← Back to catalog
        </Link>
      </form>
    </div>
  );
}
