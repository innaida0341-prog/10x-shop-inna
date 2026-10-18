# 10X Shop — Project Plan

## Goal & Scope

Build a fully functional e-commerce SPA (CORE + FULL) with React, TypeScript and Tailwind CSS v4 according to the official PRD.

- **CORE**: Login, Catalog, Product details, Cart, Checkout, responsive UI, basic debugging.
- **FULL**: Search/filter/sort/pagination (URL state), Orders, Profile, Reviews, Related products, Promo codes, Theme, lazy routes.

## WBS (3 weeks)

### Week 1 (17–23 Oct) — Foundation
| Task | Hours | DoD |
|------|-------|-----|
| Vite + React + TS + Tailwind setup | 2 | typecheck & build pass |
| Types (Product, Cart, Auth, Order) | 2 | all domain models in types/ |
| Layout, Header, Router, 404 | 3 | all routes work without reload |
| AuthContext + Login form | 3 | validation, Context state, redirect |
| Catalog CORE (fetch, ProductCard, grid) | 4 | products render, add to cart |
| PLAN.md + GitHub repo | 1 | plan committed first week |

### Week 2 (24–30 Oct) — Product, Cart, Checkout
| Task | Hours | DoD |
|------|-------|-----|
| Product details + gallery | 3 | useParams, images, stock, add |
| CartContext + Cart page | 4 | immutable updates, badge, totals |
| Checkout form + validation | 3 | controlled inputs, Thank you |
| Search / Category / Sort / Pagination | 5 | URL state, debounce, AbortController |
| Promo codes | 1 | SAVE10/20/FREESHIP |

### Week 3 (31 Oct – 6 Nov) — FULL + Polish
| Task | Hours | DoD |
|------|-------|-----|
| Orders list + detail + status sim | 4 | live status every 30s |
| Profile + Theme | 2 | edit form, dark mode |
| Reviews, Related products | 2 | reuse ProductCard |
| Responsive polish, hover/focus | 2 | 375px no horizontal scroll |
| Error Boundary, DEBUG-LOG | 2 | fallback works |
| README, REPORT, Deploy | 3 | live link, typecheck 0 |

## Risks

1. **DummyJSON downtime** → local JSON fallback (mitigated by simple mock).
2. **URL-state complexity** → implement after CORE Catalog works.
3. **TypeScript strict errors late** → typecheck after every feature.

## Definition of Done (per task)

- Compiles with `npm run typecheck` (0 errors)
- Matches PRD Measurable Outcome for that page
- Responsive on 375px and desktop
- Committed with meaningful message
