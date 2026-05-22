# Checkout → Payment → Order Management — Remaining Work

This document tracks what's **not yet implemented** in the checkout/payment/order system.

---

## Phase 3: Customer Order API Routes

| Route | Method | Purpose |
|-------|--------|---------|
| `/api/orders/customer-list` | GET | Paginated list of current user's orders |
| `/api/orders/customer-single` | GET | Single order with items for current user |

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

### Query Keys

**File:** `src/lib/constants.ts`

Already done:
```ts
ORDERS: 'orders',
VENDOR_ORDERS: 'vendor-orders',
VOUCHERS: 'vouchers',
WALLET: 'wallet',
```

---

## File Manifest (Not Yet Created)

### Route Files

```
src/routes/dashboard/vendor/orders/index.tsx          # Phase 4.1 — Vendor order management
src/routes/dashboard/admin/orders/index.tsx           # Phase 5.1 — Admin order list
src/routes/dashboard/admin/orders/$orderId.tsx        # Phase 5.2 — Admin order detail
```

### API Route Files

```
src/routes/api/orders/customer-list.ts                # Phase 3.3 — Customer orders list
src/routes/api/orders/customer-single.ts              # Phase 3.3 — Customer order detail
src/routes/api/orders/vendor-list.ts                  # Phase 4.3 — Vendor order items
src/routes/api/orders/vendor-update-fulfillment.ts    # Phase 4.2 — Update fulfillment
src/routes/api/orders/admin-list.ts                   # Phase 5.3 — Admin order list
src/routes/api/orders/admin-single.ts                 # Phase 5.3 — Admin order detail
src/routes/api/orders/admin-refund.ts                 # Phase 5.3 — Admin refund
```

### Service Files

```
src/services/vendor-order.ts    # Phase 4.4 — Vendor order hooks
```

### Component Files

```
src/components/orders/status-badge.tsx        # Reusable order status badge
src/components/orders/order-items-table.tsx   # Reusable order items table
```

### Action Files

```
src/actions/send-order-email.ts  # Phase 6 — Order confirmation + shipping emails
```

---

## Edge Cases & Considerations (Still Relevant)

| Concern | Solution |
|---------|----------|
| **Stock contention** | Run order creation + stock decrement in a single Prisma `$transaction`; rollback on failure |
| **Partial fulfillment** | Each `OrderItem` has its own `fulfillmentStatus` — vendor only manages their own items |
| **Failed payments** | Order marked `FAILED`; cart intact for retry |
| **COD fake orders** | Vendor chooses whether to ship — no prepayment means some risk. Future: limit COD to verified users with order history |
| **COD phone required** | `shippingPhone` is required for COD — delivery agent needs to call the customer |
| **Zero-total orders** | Skip bKash, mark as `PAID` immediately (for 100% discount/free items) |
| **Voucher stacking conflicts** | 1 GLOBAL + 1 SHOP per shop + 1 PRODUCT per product + free-shipping; duplicates per scope are skipped silently |
| **Cashback on cancelled orders** | Not yet implemented — wallet credit is not reversed on cancel |
| **Flash deal voucher cap** | `claimedCount` on Coupon prevents collecting beyond `maxClaimCount` |
| **First-order voucher fraud** | `firstOrderOnly` checks existing completed orders for the user — cannot be bypassed by collecting first |
| **Auto-apply UX** | Vouchers are auto-collected and pre-selected at checkout; user can uncheck to remove |
| **Platform restriction** | `platformRestriction` validated on the server only — frontend could hide, but backend enforces |
| **BOGO edge case** | Free items are the cheapest matching items in the cart; if fewer items than `bogoBuyQty`, BOGO is not applied |
| **Tier selection** | Picks best matching tier by `minQuantity` (highest <= cart quantity); if no tier matches, falls back to parent value |
| **Guest checkout** | Not in scope — all checkout requires authentication |
| **Multi-currency** | Not in scope — single currency (BDT) for now |
| **Race conditions** | Use bKash `merchantInvoiceNumber` for idempotency; callback handler is idempotent on `paymentRef` |
