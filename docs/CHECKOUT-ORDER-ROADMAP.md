# Checkout → Payment → Order Management — Implementation Roadmap

This document outlines the full implementation plan for building the checkout flow, payment gateway integration, and order management system for the Oylkka multivendor marketplace. Each phase is designed to be implemented one at a time, in order.

---

## Phase 1: Prerequisites

### 1.1 bKash API Setup

| Item | Detail |
|------|--------|
| **Env vars** | Add `BKASH_APP_KEY`, `BKASH_APP_SECRET`, `BKASH_USERNAME`, `BKASH_PASSWORD`, `BKASH_BASE_URL` to `.env` |
| **No SDK** | bKash uses server-side API calls — no frontend SDK needed |
| **Prisma** | No new migrations — `Order` already has `paymentMethod`, `paymentRef`, `paymentStatus` |

---

## Phase 2: Checkout Flow (Customer Facing)

### 2.1 Enable Checkout Button

| File | Change |
|------|--------|
| `src/routes/cart.tsx` (lines 176-182) | Remove `disabled` prop from "Proceed to Checkout" button, wire to `navigate({ to: '/checkout' })` |

### 2.2 Checkout Page (`/checkout`)

| Item | Detail |
|------|--------|
| **Route** | `src/routes/checkout.tsx` |
| **Guard** | `beforeLoad` — require authenticated user (`context.user`) |
| **Layout** | Minimal header + main + footer |

**Sections on page:**
1. **Shipping Address Form** — name, email, phone, addressLine1/2, city, state, country, postalCode. Pre-fill from last order if available.
2. **Order Summary** — items grouped by shop, quantities, prices, subtotal, shipping estimate
3. **Order Notes** — optional textarea
4. **Payment Method** — bKash — redirect to bKash hosted payment page
5. **Place Order** — submits shipping, creates Order, initiates bKash payment

**States:** Loading skeleton, empty cart redirect (`/cart` if cart is empty), error state.

### 2.3 Create Order API (`POST /api/checkout/create`)

| Item | Detail |
|------|--------|
| **Route** | `src/routes/api/checkout/create.ts` |

**Flow:**
1. Validate session (must be logged in)
2. Fetch cart with items; validate stock for each product/variant
3. Generate `orderNumber` — format: `ORD-${Date.now().toString(36).toUpperCase()}`
4. Calculate pricing from cart data:
   - `subtotal` = sum of `savedPrice` × `quantity` per item
   - `shippingCost` = flat rate or free shipping per item flags
   - `tax` = (if applicable)
   - `total` = subtotal + shippingCost + tax
5. In a **Prisma transaction**:
   - Create `Order` with shipping address snapshot
   - Create `OrderItem` for each cart item — snapshot product/variant details, copy `commissionRate` from shop
   - Decrement product/variant stock
   - Delete cart items / clear cart
6. Return `{ orderId, orderNumber, total }`

### 2.4 Create bKash Payment API (`POST /api/checkout/bkash-pay`)

| Item | Detail |
|------|--------|
| **Route** | `src/routes/api/checkout/bkash-pay.ts` |

**Flow:**
1. Call bKash `POST /tokenized/checkout/create` with order amount, merchant info, and `callbackURL` pointing to your callback endpoint
2. Store `paymentRef` (bKash `merchantInvoiceNumber`) on the Order
3. Return `{ checkoutURL }` to frontend
4. Frontend redirects user to bKash checkout URL
5. User completes payment on bKash hosted page
6. bKash redirects back to callback endpoint

### 2.5 bKash Callback + Verify (`GET /api/checkout/bkash-callback`)

| Item | Detail |
|------|--------|
| **Route** | `src/routes/api/checkout/bkash-callback.ts` |

**Flow:**
1. bKash redirects user back with query params: `?paymentID=xxx&status=success&orderID=xxx`
2. Call bKash `POST /tokenized/checkout/execute` with the `paymentID` to confirm payment
3. On success → update `Order.paymentStatus = PAID`, `Order.status = CONFIRMED`, trigger confirmation email
4. On failure → update `Order.paymentStatus = FAILED`
5. Redirect user to `/checkout/confirmation?orderId=xxx` (or show error page)

### 2.6 Order Confirmation Page (`/checkout/confirmation`)

| Item | Detail |
|------|--------|
| **Route** | `src/routes/checkout/confirmation.tsx` |
| **Query param** | `orderId` |

**Content:** Success checkmark animation, order number display, order summary, "View Order" link → `/dashboard/orders/$orderId`, "Continue Shopping" → `/products`

---

## Phase 3: Customer Order Management

### 3.1 Customer Orders List (`/dashboard/orders`)

| Item | Detail |
|------|--------|
| **Route** | `src/routes/dashboard/orders/index.tsx` |
| **Already linked** | `nav-main.tsx` has `{ title: 'My Orders', url: '/dashboard/orders' }` |

**Content:**
- List of orders with: order number, date, total, status badge, item count
- Click row → `/dashboard/orders/$orderId`
- Filter by status tabs (All, Pending, Confirmed, Processing, Shipped, Delivered, Cancelled)
- Empty state: "No orders yet"

### 3.2 Customer Order Detail (`/dashboard/orders/$orderId`)

| Item | Detail |
|------|--------|
| **Route** | `src/routes/dashboard/orders/$orderId.tsx` |

**Content:**
- Order header: order number, placed date, status timeline
- Shipping address card
- Items grouped by shop — each shop section shows `fulfillmentStatus`
- Price breakdown: subtotal, shipping, tax, total
- Payment status badge
- "Track Order" link if tracking number set
- "Write a Review" button for delivered items (links to product page)

### 3.3 Customer Order API Routes

| Route | Method | Purpose |
|-------|--------|---------|
| `/api/orders/customer-list` | GET | Paginated list of current user's orders |
| `/api/orders/customer-single` | GET | Single order with items for current user |

### 3.4 Order Service (`src/services/order.ts`)

Hooks to add:
- `useCustomerOrders(page, status?)` — `useQuery`
- `useCustomerOrder(orderId)` — `useQuery`

Follow existing patterns from `src/services/product.ts`.

---

## Phase 4: Vendor Order Management

### 4.1 Vendor Orders List (`/dashboard/vendor/orders`)

| Item | Detail |
|------|--------|
| **Route** | `src/routes/dashboard/vendor/orders/index.tsx` |
| **Already linked** | `nav-main.tsx` has full sub-nav with status tabs |

**Content:**
- List of `OrderItem` records belonging to this vendor's shop
- Columns: Order #, product image+name, variant, quantity, unit price, total, fulfillment status, actions
- Status filter tabs (all links already in nav-main)
- Search by order number or product name
- Empty state: "No orders yet"

### 4.2 Fulfillment Actions

| Action | API | Description |
|--------|-----|-------------|
| Mark Processing | `PUT /api/orders/vendor-update-fulfillment` | Change `PENDING → PROCESSING` |
| Mark Shipped | `PUT /api/orders/vendor-update-fulfillment` | Change `PROCESSING → SHIPPED`; add tracking number + URL |
| Mark Delivered | `PUT /api/orders/vendor-update-fulfillment` | Change `SHIPPED → DELIVERED`; set `deliveredAt` |

- Inline buttons per row (or dropdown)
- Modal for tracking info when marking as shipped
- Batch select + bulk update

### 4.3 Vendor Order API Routes

| Route | Method | Purpose |
|-------|--------|---------|
| `/api/orders/vendor-list` | GET | OrderItems for vendor's shop with filters |
| `/api/orders/vendor-update-fulfillment` | PUT | Update fulfillment status + tracking |

### 4.4 Vendor Order Service (`src/services/vendor-order.ts`)

Hooks to add:
- `useVendorOrders(status?, search?)` — `useQuery`
- `useUpdateFulfillmentMutation()` — `useMutation`

---

## Phase 5: Admin Order Management

### 5.1 Admin Orders List (`/dashboard/admin/orders`)

| Item | Detail |
|------|--------|
| **Route** | `src/routes/dashboard/admin/orders/index.tsx` |
| **Already linked** | `nav-main.tsx` has full sub-nav with status tabs |

**Content:**
- All orders across the platform
- Columns: Order #, customer name, total, payment status, order status, item count, date
- Filters: status, payment status, date range, vendor search, customer search
- Quick stats bar: total orders, total revenue, pending count
- Click row → `/dashboard/admin/orders/$orderId`

### 5.2 Admin Order Detail (`/dashboard/admin/orders/$orderId`)

| Item | Detail |
|------|--------|
| **Route** | `src/routes/dashboard/admin/orders/$orderId.tsx` |

**Content:**
- Full order info + customer info + shipping address
- All items across all shops with their fulfillment statuses
- Actions:
  - Update any item's fulfillment status (override)
  - Process full or partial refund (via bKash)
  - View payment details (bKash paymentID, status)
  - Cancel order

### 5.3 Admin Order API Routes

| Route | Method | Purpose |
|-------|--------|---------|
| `/api/orders/admin-list` | GET | All orders with filters/pagination |
| `/api/orders/admin-single` | GET | Full order detail (admin view) |
| `/api/orders/admin-refund` | POST | Process refund (full/partial), trigger bKash refund |

---

## Phase 6: Email Notifications

### 6.1 Order Confirmation Email

| Item | Detail |
|------|--------|
| **Trigger** | bKash callback execute success → `Order.status = CONFIRMED` |
| **Template** | Use existing `sendEmail()` from `src/lib/send-email.ts` |
| **Content** | Order number, items summary table, total, estimated delivery, "View Order" CTA button |
| **File** | `src/actions/send-order-email.ts` |

### 6.2 Shipping Update Email

| Item | Detail |
|------|--------|
| **Trigger** | Vendor marks item as `SHIPPED` (sets tracking) |
| **Content** | Product name, tracking number, tracking URL, "Track Package" CTA |
| **File** | `src/actions/send-order-email.ts` (same file, separate function) |

### 6.3 Email Template Update

The existing `send-email.ts` uses a generic template. For order emails, extend it or create a richer HTML template with order item tables.

---

## Phase 7: Supporting Changes

### 7.1 Query Keys

**File:** `src/lib/constants.ts`

Add:
```ts
ORDERS: 'orders',
VENDOR_ORDERS: 'vendor-orders',
```

### 7.2 Nav-Main

No changes needed — `nav-main.tsx` already has all nav items for orders/payouts. Routes just need to exist for them to work.

---

## Full File Manifest

### New Route Files

```
src/routes/checkout.tsx                        # Phase 2.2 — Checkout page
src/routes/checkout/confirmation.tsx           # Phase 2.6 — Order success page
src/routes/dashboard/orders/index.tsx          # Phase 3.1 — Customer order list
src/routes/dashboard/orders/$orderId.tsx       # Phase 3.2 — Customer order detail
src/routes/dashboard/vendor/orders/index.tsx   # Phase 4.1 — Vendor order management
src/routes/dashboard/admin/orders/index.tsx    # Phase 5.1 — Admin order list
src/routes/dashboard/admin/orders/$orderId.tsx # Phase 5.2 — Admin order detail
```

### New API Route Files

```
src/routes/api/checkout/create.ts              # Phase 2.3 — Create order
src/routes/api/checkout/bkash-pay.ts           # Phase 2.4 — Create bKash payment session
src/routes/api/checkout/bkash-callback.ts      # Phase 2.5 — bKash callback + verify
src/routes/api/orders/customer-list.ts         # Phase 3.3 — Customer orders list
src/routes/api/orders/customer-single.ts       # Phase 3.3 — Customer order detail
src/routes/api/orders/vendor-list.ts           # Phase 4.3 — Vendor order items
src/routes/api/orders/vendor-update-fulfillment.ts # Phase 4.2 — Update fulfillment
src/routes/api/orders/admin-list.ts            # Phase 5.3 — Admin order list
src/routes/api/orders/admin-single.ts          # Phase 5.3 — Admin order detail
src/routes/api/orders/admin-refund.ts          # Phase 5.3 — Admin refund
```

### New Service Files

```
src/services/order.ts           # Phase 3.4 — Customer order hooks
src/services/vendor-order.ts    # Phase 4.4 — Vendor order hooks
```

### New Component Files

```
src/components/checkout/shipping-form.tsx   # Phase 2.2 — Shipping address form
src/components/checkout/order-summary.tsx   # Phase 2.2 — Order summary
src/components/orders/status-badge.tsx      # Reusable order status badge
src/components/orders/order-items-table.tsx # Reusable order items table
```

### New Action Files

```
src/actions/send-order-email.ts  # Phase 6 — Order confirmation + shipping emails
```

---

## Edge Cases & Considerations

| Concern | Solution |
|---------|----------|
| **Stock contention** | Run order creation + stock decrement in a single Prisma `$transaction`; rollback on failure |
| **Partial fulfillment** | Each `OrderItem` has its own `fulfillmentStatus` — vendor only manages their own items |
| **Failed payments** | Keep order as `PENDING`; allow retry with fresh bKash payment session; expire after 30 min |
| **Zero-total orders** | Skip bKash, mark as `PAID` immediately (for 100% discount/free items) |
| **Guest checkout** | Not in scope — all checkout requires authentication |
| **Multi-currency** | Not in scope — single currency (BDT) for now |
| **Race conditions** | Use bKash `merchantInvoiceNumber` for idempotency; callback handler is idempotent on `paymentRef` |

---

## Data Flow Diagram

```
Cart Page                    Checkout Page                  Success
  │                             │                             │
  │ [Proceed to Checkout]       │                             │
  └────────► Shipping Form ──►  │                             │
              Order Summary     │                             │
              Pay with bKash ──►│                             │
                    │           │                             │
                    ▼           │                             │
            /api/checkout/create│                             │
                    │           │                             │
                    ▼           │                             │
            Order + OrderItems  │                             │
            Stock decremented   │                             │
            Cart cleared        │                             │
                    │           │                             │
                    ▼           │                             │
            /api/checkout/bkash-pay                           │
            bKash tokenized/checkout/create                   │
                    │                                         │
                    ▼                                         │
            bKash checkoutURL                                 │
                    │                                         │
         ┌──────────┴──────────┐                              │
         ▼                     ▼                              │
    Redirect to bKash     bKash API Error                     │
    (hosted payment page)  Show error, retry                  │
         │                                                     │
         │  User pays on bKash                                 │
         ▼                                                     │
    bKash redirects back                                       │
    /api/checkout/bkash-callback                               │
    ?paymentID=xxx&status=success                              │
         │                                                     │
         ▼                                                     │
    /api/checkout/bkash-callback                               │
    bKash tokenized/checkout/execute                           │
         │                                                     │
   ┌─────┴──────────┐                                          │
   ▼                 ▼                                         │
Payment Succeeded   Payment Failed                             │
   │                 │                                         │
   │            Show Error                                     │
   │            "Try again"                                    │
   │                 │                                         │
   │            Back to Checkout                               │
   │                                                           │
   ├── Email: Confirmation                                     │
   │                                                           │
   └──► Thank You Page ◄──────────────────────────────────────┘
        (Order #, summary)
        │
        ▼
  Customer Dashboard          Vendor Dashboard        Admin Dashboard
  /dashboard/orders           /dashboard/vendor/      /dashboard/admin/
       │                      /orders                 /orders
       ▼                          ▼                       ▼
  Order Detail              Fulfillment Actions      Manage All Orders
  - Status timeline         - Mark Processing        - View any order
  - Items by shop           - Mark Shipped           - Process refunds
  - Write reviews           - Add tracking           - Cancel orders
```
