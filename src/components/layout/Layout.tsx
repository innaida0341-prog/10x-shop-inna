import { Suspense } from 'react';
import { Outlet } from 'react-router-dom';
import { Header } from './Header';
import { Footer } from './Footer';
import { ScrollToTop } from './ScrollToTop';
import { Spinner } from '../ui/Spinner';
import { ToastProvider } from '../../context/ToastContext';

export function Layout() {
  return (
    <ToastProvider>
      <ScrollToTop />
      <div className="flex min-h-screen flex-col">
        <Header />
        <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6">
          <Suspense fallback={<Spinner />}>
            <Outlet />
          </Suspense>
        </main>
        <Footer />
      </div>
    </ToastProvider>
  );
}
