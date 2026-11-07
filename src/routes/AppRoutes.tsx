
import { lazy, Suspense } from 'react';
import { Route, Routes } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { ProtectedRoute } from './ProtectedRoute';

const CatalogPage = lazy(() => import('@/pages/CatalogPage'));
const CartPage = lazy(() => import('@/pages/CartPage'));

const OrdersPage = lazy(() =>
  import('@/pages/OrdersPage').then((module) => ({
    default: module.OrdersPage,
  })),
);

const OrderDetailsPage = lazy(() =>
  import('@/pages/OrderDetailsPage').then((module) => ({
    default: module.OrderDetailsPage,
  })),
);

const ProductPage = lazy(() => import('@/pages/ProductPage'));
const CheckoutPage = lazy(() => import('@/pages/CheckoutPage'));
const LoginPage = lazy(() => import('@/pages/LoginPage'));
const ProfilePage = lazy(() => import('@/pages/ProfilePage'));

function Spinner() {
  return (
    <div className="flex justify-center py-12">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent" />
    </div>
  );
}

function NotFound() {
  return (
    <div className="py-20 text-center">
      <h1 className="mb-2 text-3xl font-bold">Page not found</h1>
      <p className="mb-4 text-gray-500">
        The page you are looking for does not exist.
      </p>
      <a href="/" className="text-indigo-600 hover:underline">
        Go to catalog
      </a>
    </div>
  );
}

export function AppRoutes() {
  return (
    <Suspense fallback={<Spinner />}>
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<CatalogPage />} />
          <Route path="products/:id" element={<ProductPage />} />
          <Route path="cart" element={<CartPage />} />
          <Route path="login" element={<LoginPage />} />

          <Route
            path="checkout"
            element={
              <ProtectedRoute>
                <CheckoutPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="orders"
            element={
              <ProtectedRoute>
                <OrdersPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="orders/:id"
            element={
              <ProtectedRoute>
                <OrderDetailsPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="profile"
            element={
              <ProtectedRoute>
                <ProfilePage />
              </ProtectedRoute>
            }
          />

          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </Suspense>
  );
}
