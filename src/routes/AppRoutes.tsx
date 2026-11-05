import { lazy, Suspense } from 'react';
import { Route, Routes } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { ProtectedRoute } from './ProtectedRoute';

// ✅ CatalogPage და CartPage — ახლა default exports (ჩვენ გავასწორეთ)
const CatalogPage = lazy(() => import('@/pages/CatalogPage'));
const CartPage = lazy(() => import('@/pages/CartPage'));

// ✅ OrdersPage — named export (ისევ .then() სჭირდება)
const OrdersPage = lazy(() => import('@/pages/OrdersPage').then(m => ({ default: m.OrdersPage })));

// ✅ დანარჩენები — default exports
const ProductPage = lazy(() => import('@/pages/ProductPage'));
const CheckoutPage = lazy(() => import('@/pages/CheckoutPage'));
const LoginPage = lazy(() => import('@/pages/LoginPage'));
const ProfilePage = lazy(() => import('@/pages/ProfilePage'));

function Spinner() {
  return (
    <div className="flex justify-center py-12">
      <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
    </div>
  );
}

function NotFound() {
  return (
    <div className="text-center py-20">
      <h1 className="text-3xl font-bold mb-2">Page not found</h1>
      <p className="text-gray-500 mb-4">The page you are looking for does not exist.</p>
      <a href="/" className="text-indigo-600 hover:underline">Go to catalog</a>
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
          <Route path="checkout" element={<ProtectedRoute><CheckoutPage /></ProtectedRoute>} />
          <Route path="orders" element={<ProtectedRoute><OrdersPage /></ProtectedRoute>} />
          <Route path="profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </Suspense>
  );
}