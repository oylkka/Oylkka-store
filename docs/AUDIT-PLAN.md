# Oylkka — Audit & Implementation Plan

> Generated from full codebase audit on May 22, 2026

---

## Phase 2: Broken User Flows

| # | Task | Files | Priority |
|---|------|-------|----------|
| 2.1 | **Create `/terms` and `/privacy` routes** | `src/routes/terms.tsx`, `privacy.tsx` (new) | HIGH |
| 2.2 | **Create `/dashboard/my-account` route** | `src/routes/dashboard/my-account.tsx` (new) | HIGH |
| 2.3 | **Create `/auth/error` route** | `src/routes/auth/error.tsx` (new) | HIGH |
| 2.4 | **Wire wishlist (heart icon) to real API** | `src/routes/product.$slug.tsx`, `src/routes/api/wishlist/` (new) | HIGH |
| 2.5 | **Wire "Message Seller" or replace with contact form** | `src/routes/product.$slug.tsx`, `src/routes/api/messages/` (new) | HIGH |
| 2.6 | **Add BD phone/postalCode validation on checkout** | `src/routes/checkout.tsx`, `src/schemas/` | HIGH |
| 2.7 | **Add inline field validation (not just submit toasts)** | `src/routes/checkout.tsx` | MEDIUM |

---

## Phase 3: Backend Models & Missing Features

### 3A. Database Models

| # | Model | Priority | Notes |
|---|-------|----------|-------|
| 3a.1 | `ReturnRequest` | HIGH | RMA workflow (status, reason, images, tracking) |
| 3a.2 | `ShippingZone` + `ShippingRate` | HIGH | Zone-based rates for BD districts |
| 3a.3 | `AuditLog` | HIGH | Track all admin actions |
| 3a.4 | `UserAddress` | MEDIUM | Address book for repeat customers |
| 3a.5 | `ProductReport` | MEDIUM | User-reported listings |
| 3a.6 | `ShopFollow` | MEDIUM | Follow/favorite shops |
| 3a.7 | `RecentlyViewed` | MEDIUM | Recently viewed products |
| 3a.8 | `Message` / `Conversation` | MEDIUM | Buyer-vendor messaging |
| 3a.9 | `Page` / `ContentBlock` | MEDIUM | CMS for static pages (About, FAQ, ToS) |
| 3a.10 | `SiteSetting` | MEDIUM | Platform-wide configuration |
| 3a.11 | `NotificationPreference` | LOW | In-app notification settings |
| 3a.12 | `Sale` / `Promotion` | LOW | Scheduled flash deals |

### 3B. Wire Up Existing Models

| # | Task | Priority |
|---|------|----------|
| 3b.1 | **Invoice PDF generation** (connect Invoice model) | MEDIUM |
| 3b.2 | **Wishlist API + frontend** (WishlistItem model exists, no UI) | HIGH |
| 3b.3 | **Wallet page for users** (Wallet model exists, API exists, no page) | HIGH |
| 3b.4 | **Payout admin/vendor UI** (Payout model exists, no management) | HIGH |

### 3C. Payment Methods

| # | Task | Priority |
|---|------|----------|
| 3c.1 | **Nagad integration** | MEDIUM |
| 3c.2 | **Wallet balance as payment method** | MEDIUM |
| 3c.3 | **Credit/debit card (SSLCommerz or ShurjoPay)** | LOW |
| 3c.4 | **Rocket integration** | LOW |

---

## Phase 4: Missing Public Pages

| # | Page | Priority | Notes |
|---|------|----------|-------|
| 4.1 | `/about` | MEDIUM | Brand story |
| 4.2 | `/contact` | MEDIUM | Contact form / info |
| 4.3 | `/faq` | MEDIUM | FAQ with search |
| 4.4 | `/shipping-policy` | LOW | Standalone shipping info |
| 4.5 | `/return-policy` | LOW | Return/refund policy |
| 4.6 | `/compare` | LOW | Product comparison |
| 4.7 | `/deals` | LOW | Flash deals page |
| 4.8 | `/blog` | LOW | Blog/news for SEO |

---

## Phase 5: Missing Dashboard Pages

### 5A. Admin Dashboard

| # | Page | Priority |
|---|------|----------|
| 5a.1 | `/dashboard/admin/` (index with stats) | HIGH |
| 5a.2 | `/dashboard/admin/coupons/` (list, create, edit) | HIGH |
| 5a.3 | `/dashboard/admin/payouts/` (manage vendor payouts) | MEDIUM |
| 5a.4 | `/dashboard/admin/reviews/` (moderate reviews) | MEDIUM |
| 5a.5 | `/dashboard/admin/customers/` (user list) | LOW |
| 5a.6 | `/dashboard/admin/settings/` (site configuration) | LOW |

### 5B. Vendor Dashboard

| # | Page | Priority |
|---|------|----------|
| 5b.1 | `/dashboard/vendor/analytics/` (sales charts, revenue) | HIGH |
| 5b.2 | `/dashboard/vendor/shop/branding` (implement, not placeholder) | MEDIUM |
| 5b.3 | `/dashboard/vendor/shop/policies` (implement, not placeholder) | MEDIUM |
| 5b.4 | `/dashboard/vendor/shop/messages` (implement after backend) | MEDIUM |
| 5b.5 | `/dashboard/vendor/payouts/` (payout history) | MEDIUM |

### 5C. User Dashboard

| # | Page | Priority |
|---|------|----------|
| 5c.1 | `/dashboard/` (stats, recent orders, quick links) | HIGH |
| 5c.2 | `/dashboard/wallet/` (balance, transactions, top-up) | MEDIUM |
| 5c.3 | `/dashboard/wishlist/` (saved items) | MEDIUM |
| 5c.4 | `/dashboard/addresses/` (address book) | LOW |
| 5c.5 | `/dashboard/reviews/` (my reviews) | LOW |

---

## Phase 6: Code Quality & Refactoring

| # | Task | Files | Priority |
|---|------|-------|----------|
| 6.1 | **Add Zod validation to product create/edit** | `src/routes/api/product/create.ts`, `edit.ts` | HIGH |
| 6.2 | **Add SKU uniqueness check server-side** | `src/routes/api/product/create.ts`, `edit.ts` | HIGH |
| 6.3 | **Fix variant stock check in cart update** | `src/routes/api/cart/update.ts` | HIGH |
| 6.4 | **Add role-check middleware** | `src/lib/auth-middleware.ts` (new) | HIGH |
| 6.5 | **Fix inconsistent error responses (401 vs 403)** | All admin routes | MEDIUM |
| 6.6 | **Replace string-based role checks with enum** | All route files | MEDIUM |
| 6.7 | **Enforce fulfillment state machine for admin** | `src/routes/api/orders/admin-fulfill.ts` | MEDIUM |
| 6.8 | **Extract monolithic checkout logic into services** | `checkout/create.ts` (703 lines), `validate-coupon.ts` (407 lines) | MEDIUM |
| 6.9 | **Add React error boundaries** | `src/components/error-boundary.tsx` (new), `__root.tsx` | MEDIUM |
| 6.10 | **Remove dead code (`usePendingShops`, unused query keys)** | `src/services/shop.ts`, `src/lib/constants.ts` | LOW |
| 6.11 | **Deduplicate `usePublicCategories`** | `src/services/product.ts`, `category.ts` | LOW |
| 6.12 | **Add React Query hooks for voucher/wallet endpoints** | `src/services/voucher.ts`, `wallet.ts` (new) | MEDIUM |
| 6.13 | **Fix order number generation (collision risk)** | `src/routes/api/checkout/create.ts` | MEDIUM |
| 6.14 | **Type the `metadata` Json field** | All order-related files | MEDIUM |
| 6.15 | **N+1 query fix in voucher loop** | `src/routes/api/checkout/create.ts` | LOW |
| 6.16 | **Fix vendor order list missing CONFIRMED tab** | `src/routes/dashboard/vendor/orders/index.tsx` | LOW |
| 6.17 | **Fix vendor product filter missing OUT_OF_STOCK** | `src/routes/dashboard/vendor/products/index.tsx` | LOW |
| 6.18 | **Add vendor pending page auto-refresh** | `src/routes/dashboard/become-vendor/pending.tsx` | LOW |
| 6.19 | **Adjust banner image max size (500KB too small)** | `src/schemas/banner-schema.ts` | MEDIUM |
| 6.20 | **Adjust banner title min length (5 chars too restrictive)** | `src/schemas/banner-schema.ts` | LOW |
| 6.21 | **Adjust product stock min(1) to allow 0 for drafts** | `src/components/forms/product/product-form-type.ts` | LOW |

---

## Phase 7: Email System

| # | Task | Priority |
|---|------|----------|
| 7.1 | **Vendor approval/rejection email** | HIGH |
| 7.2 | **Order cancellation email** | HIGH |
| 7.3 | **Refund notification email** | HIGH |
| 7.4 | **Password reset confirmation email** | MEDIUM |
| 7.5 | **Welcome email after email verification** | MEDIUM |
| 7.6 | **Payout notification emails** | LOW |
| 7.7 | **Add email queue (async sending)** | MEDIUM |

---

## Phase 8: Testing

| # | Task | Priority |
|---|------|----------|
| 8.1 | **Set up Vitest with bun** (`bun run test`) | HIGH |
| 8.2 | **Unit tests for utility functions** (slug, SKU service, cn, etc.) | MEDIUM |
| 8.3 | **Unit tests for Zod schemas** | MEDIUM |
| 8.4 | **Integration tests for checkout flow** | HIGH |
| 8.5 | **Integration tests for bKash payment** | HIGH |
| 8.6 | **API route tests (auth, CRUD operations)** | MEDIUM |
| 8.7 | **Test stock decrement race condition fix** | HIGH |
| 8.8 | **Component tests for key UI** | LOW |

---

## Phase 9: Branding & Polish

| # | Task | Priority |
|---|------|----------|
| 9.1 | **Update `public/manifest.json`** ("Create TanStack App" → "Oylkka") | LOW |
| 9.2 | **Update root `<title>` in `__root.tsx`** | LOW |
| 9.3 | **Customize README.md for Oylkka** | LOW |
| 9.4 | **Remove generic placeholder SVG** | LOW |
| 9.5 | **Add Bengali (bn) localization** | LOW |

---

## Phase 10: CI/CD

| # | Task | Priority |
|---|------|----------|
| 10.1 | **GitHub Actions: lint + typecheck** | MEDIUM |
| 10.2 | **GitHub Actions: test suite** | MEDIUM |
| 10.3 | **GitHub Actions: deploy** | LOW |
| 10.4 | **Dockerfile / docker-compose** | LOW |

---

## Summary Dashboard

| Phase | Tasks | Est. Effort |
|-------|-------|-------------|
| 0 — Security Hotfixes | 4 | ~1 day |
| 1 — Payment & Order Integrity | 10 | ~3 days |
| 2 — Broken User Flows | 7 | ~2 days |
| 3 — Backend Models & Features | 16 | ~5 days |
| 4 — Missing Public Pages | 8 | ~3 days |
| 5 — Missing Dashboard Pages | 16 | ~5 days |
| 6 — Code Quality & Refactoring | 21 | ~4 days |
| 7 — Email System | 7 | ~2 days |
| 8 — Testing | 8 | ~4 days |
| 9 — Branding & Polish | 5 | ~1 day |
| 10 — CI/CD | 4 | ~1 day |
| **Total** | **106 tasks** | **~31 days** |
