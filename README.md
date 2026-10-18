# 10X Shop

A React + TypeScript + Tailwind CSS v4 online shop built with the DummyJSON API (graduation project, FULL scope).

**Live demo:** _add your Vercel/Netlify link here_

## Features
**CORE:** login simulation (React Context), catalog, product details, cart (add / quantity / remove / totals), checkout with controlled form and local order confirmation, responsive layout, Error Boundary, 404 page.

**FULL:** search (debounced) / category filter / sort / pagination with URL state, reviews (localStorage), related products, promo code `10X10`, orders with time-based status simulation, profile editing, dark mode, lazy-loaded routes, `AbortController` request cancellation, skeleton loaders + retry, `ApiClient` / `ApiError`, `Cart` / `OrderService` / `StorageService<T>` classes, type guards.

## Tech stack
Vite, React 19, TypeScript (strict), React Router, Tailwind CSS v4 (`@theme`, `@utility`, data-theme dark mode), DummyJSON.

## Run
```bash
npm install
npm run dev          # development
npm run typecheck    # tsc --noEmit
npm run lint
npm run build
npm run preview
```

## Architecture
```
src/
  api/        ApiClient, ApiError, products.api
  types/      domain models (Product, Cart, Order, User, AsyncState)
  models/     Cart, OrderService, StorageService<T>, storage keys
  context/    Auth, Cart (+ pure reducer), Theme, Toast
  hooks/      useFetch, useDebounce, useNow
  components/ ui/ layout/ product/
  pages/      one file per route
  routes/     AppRoutes (lazy), ProtectedRoute
  utils/      format, url, validation, guards, errors
```
Data flow: user action → event handler → Context/`useState` → immutable update → re-render. The cart reducer is pure; persistence to `shop_cart` happens in a `useEffect` inside `CartProvider`.

## Test account
Login is a local simulation: any non-empty username and a password of 6+ characters works.

## Deploy
`vercel.json` and `public/_redirects` contain the SPA rewrite so `/products/5` survives a refresh.

## Credits
_Write who/what helped you (including AI tools)._
