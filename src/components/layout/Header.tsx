import { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { useTheme } from '../../context/ThemeContext';

const linkClass = ({ isActive }: { isActive: boolean }): string =>
  `inline-flex min-h-11 items-center rounded-lg px-3 text-sm font-medium transition-colors hover:bg-gray-100 dark:hover:bg-gray-800 ${
    isActive ? 'text-primary' : 'text-gray-700 dark:text-gray-300'
  }`;

export function Header() {
  const { user, logout } = useAuth();
  const { itemCount } = useCart();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const close = () => setOpen(false);
  const handleLogout = () => {
    logout();
    close();
    navigate('/');
  };

  return (
    <header className="sticky top-0 z-40 border-b border-gray-200 bg-white/90 backdrop-blur dark:border-gray-700 dark:bg-gray-900/90">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-2 px-4 py-2">
        <Link to="/" onClick={close} className="text-xl font-bold text-primary">
          10X Shop
        </Link>

        <button
          type="button"
          aria-label="Toggle menu"
          aria-expanded={open}
          onClick={() => setOpen((o) => !o)}
          className="inline-flex size-11 items-center justify-center rounded-lg hover:bg-gray-100 md:hidden dark:hover:bg-gray-800"
        >
          {open ? '✕' : '☰'}
        </button>

        <nav
          aria-label="Main"
          className={`${
            open ? 'flex' : 'hidden'
          } absolute inset-x-0 top-full flex-col gap-1 border-b border-gray-200 bg-white p-4 md:static md:flex md:flex-row md:items-center md:border-0 md:bg-transparent md:p-0 dark:border-gray-700 dark:bg-gray-900`}
        >
          <NavLink to="/" end onClick={close} className={linkClass}>
            Catalog
          </NavLink>
          <NavLink to="/cart" onClick={close} className={linkClass}>
            Cart
            {itemCount > 0 && (
              <span
                aria-label={`${itemCount} items in cart`}
                className="ml-1.5 rounded-full bg-primary px-2 py-0.5 text-xs font-semibold text-white"
              >
                {itemCount}
              </span>
            )}
          </NavLink>
          {user.isLoggedIn && (
            <>
              <NavLink to="/orders" onClick={close} className={linkClass}>
                Orders
              </NavLink>
              <NavLink to="/profile" onClick={close} className={linkClass}>
                Profile
              </NavLink>
            </>
          )}
          <button
            type="button"
            onClick={toggleTheme}
            aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} theme`}
            className="inline-flex min-h-11 items-center rounded-lg px-3 text-sm hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            {theme === 'light' ? '🌙 Dark' : '☀️ Light'}
          </button>
          {user.isLoggedIn ? (
            <button type="button" onClick={handleLogout} className="btn-secondary">
              Log out
            </button>
          ) : (
            <Link to="/login" onClick={close} className="btn-primary">
              Log in
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
