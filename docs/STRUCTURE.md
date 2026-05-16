# Oylkka — Project Structure

A reference document for understanding the codebase layout, conventions, and patterns used across the Oylkka multi-vendor e-commerce platform.

---

## 1. Tech Stack

| Layer | Technology |
|---|---|
| Runtime | Bun |
| Framework | TanStack Start (React 19, SSR, file-based routing) |
| Routing | `@tanstack/react-router` (file-based) |
| Styling | Tailwind CSS v4 + `@tailwindcss/vite` |
| UI Library | shadcn/ui (31 Radix primitives) |
| Animation | `motion` v12 (framer-motion) |
| Server State | TanStack React Query |
| Forms | React Hook Form + Zod resolvers |
| Database ORM | Prisma 7 + PostgreSQL (Neon) |
| Auth | better-auth |
| Images | Cloudinary |
| Linting | Biome |
| Icons | lucide-react |
| Toasts | sonner |

---

## 2. Directory Map

```
oylkka/
├── prisma/
│   ├── schema.prisma           # Main schema (concatenates all)
│   ├── shop.prisma             # Shop, Payout, Order, OrderItem models
│   ├── product.prisma          # Product, ProductVariant, Category models
│   ├── user.prisma             # User, Session, Account models
│   ├── review.prisma           # Review model
│   ├── content.prisma          # Banner model
│   ├── enums.prisma            # All enums
│   └── migrations/             # Prisma migrations
│
├── src/
│   ├── actions/                # Server actions
│   │   ├── check-slug.ts
│   │   └── send-email.ts
│   │
│   ├── cloudinary/             # Cloudinary helpers
│   │   ├── cloudinary.ts       # Client config
│   │   ├── upload-image.ts
│   │   ├── delete-image.ts
│   │   └── index.ts
│   │
│   ├── components/
│   │   ├── forms/
│   │   │   ├── shop-form.tsx                    # Shop create/edit form
│   │   │   ├── product/                         # 15 files — multi-step product form
│   │   │   │   ├── basic-info.tsx
│   │   │   │   ├── pricing.tsx
│   │   │   │   ├── variants.tsx
│   │   │   │   ├── dimensions.tsx
│   │   │   │   ├── images.tsx
│   │   │   │   ├── seo.tsx
│   │   │   │   ├── status.tsx
│   │   │   │   ├── new-product-page.tsx         # Orchestrator
│   │   │   │   └── ...
│   │   │   ├── category-form.tsx
│   │   │   └── banner-form.tsx
│   │   │
│   │   ├── layout/
│   │   │   ├── dashboard/
│   │   │   │   ├── app-sidebar.tsx              # Sidebar shell
│   │   │   │   ├── nav-main.tsx                 # Role-based nav items
│   │   │   │   ├── nav-user-dropdown.tsx
│   │   │   │   ├── team-switcher.tsx
│   │   │   │   └── breadcrumb.tsx
│   │   │   ├── footer/
│   │   │   ├── header/
│   │   │   └── home/                            # Home page sections
│   │   │
│   │   ├── pages/
│   │   │   └── home/                            # Hero, category carousel, etc.
│   │   │
│   │   └── ui/                 # 31 shadcn/ui primitives
│   │       ├── button.tsx
│   │       ├── card.tsx
│   │       ├── badge.tsx
│   │       ├── skeleton.tsx
│   │       ├── dialog.tsx
│   │       ├── alert-dialog.tsx
│   │       ├── sidebar.tsx
│   │       ├── field.tsx
│   │       ├── input.tsx
│   │       ├── textarea.tsx
│   │       ├── select.tsx
│   │       ├── dropdown-menu.tsx
│   │       └── ... (31 total)
│   │
│   ├── context/
│   │   └── theme-provider.tsx
│   │
│   ├── generated/prisma/       # Auto-generated Prisma types
│   │
│   ├── hooks/
│   │   ├── use-mobile.ts
│   │   ├── use-product-image.ts
│   │   └── use-sku-check.ts
│   │
│   ├── lib/
│   │   ├── auth.ts             # better-auth server instance
│   │   ├── constants.ts        # React Query keys
│   │   ├── db.ts               # Prisma client
│   │   ├── slug.ts             # Slugify utility
│   │   ├── utils.ts            # cn() helper (clsx + tailwind-merge)
│   │   └── email.ts
│   │
│   ├── routes/                 # All application routes (file-based)
│   │   ├── __root.tsx          # Root layout — QueryClient, ThemeProvider, Toaster, Devtools
│   │   ├── index.tsx           # Public home page
│   │   ├── routeTree.gen.ts    # Auto-generated route tree
│   │   ├── router.tsx          # Router factory
│   │   │
│   │   ├── auth/
│   │   │   └── signin.tsx      # Sign-in page
│   │   │
│   │   ├── shop/
│   │   │   └── category.$slug.tsx  # Public category page (placeholder)
│   │   │
│   │   ├── api/                # Server-side API routes
│   │   │   ├── auth/$
│   │   │   ├── banners/        # CRUD
│   │   │   ├── categories/     # CRUD
│   │   │   ├── product/        # CRUD
│   │   │   └── shop/
│   │   │       ├── apply.ts         # POST — create shop
│   │   │       ├── update.ts        # PATCH — update shop
│   │   │       ├── approve.ts       # POST — admin approve
│   │   │       ├── reject.ts        # POST — admin reject
│   │   │       ├── my-shop.ts       # GET  — current user's shop
│   │   │       ├── get-single.ts    # POST — get by ID
│   │   │       ├── admin-list.ts    # GET  — list all (admin)
│   │   │       └── pending-list.ts  # GET  — pending shops (admin)
│   │   │
│   │   └── dashboard/
│   │       ├── route.tsx        # Dashboard layout — auth guard + sidebar + header + breadcrumb + footer + <Outlet />
│   │       ├── index.tsx        # Dashboard home — "Welcome, {user.name}!"
│   │       │
│   │       ├── admin/
│   │       │   ├── route.tsx    # Admin layout — <Outlet />
│   │       │   ├── banner/      # add, edit, list
│   │       │   ├── category/    # add, all, edit
│   │       │   └── vendors/     # index (list), detail (approve/reject)
│   │       │
│   │       ├── become-vendor/
│   │       │   ├── route.tsx    # Layout — <Outlet />
│   │       │   ├── apply.tsx    # Shop application form
│   │       │   └── pending.tsx  # Application status (pending/rejected)
│   │       │
│   │       └── vendor/
│   │           ├── route.tsx    # Vendor layout — role guard (VENDOR only) + <Outlet />
│   │           ├── products/    # index (list), add, edit
│   │           └── shop/        # index (profile), branding, policies, messages
│   │
│   ├── schemas/                 # Zod validation schemas
│   │   ├── shop-schema.ts       # ShopApplicationFormSchema, EditShopFormSchema, ShopApiSchema
│   │   ├── banner-schema.ts
│   │   ├── category-schema.ts
│   │   └── product-schema.ts
│   │
│   ├── services/                # React Query hooks (one file per domain)
│   │   ├── shop.ts              # useMyShop, useAdminShops, useShopDetail, useApplyShopMutation, useUpdateShopMutation, useApproveShopMutation, useRejectShopMutation
│   │   ├── product.ts           # useVendorProducts, useProduct, useCreateProduct, useUpdateProduct, useDeleteProduct
│   │   ├── banner.ts            # useHeroBanner, useAdminBanners, useCreateBanner, useUpdateBanner, useDeleteBanner
│   │   └── category.ts          # useCategories, useCreateCategory, useUpdateCategory, useDeleteCategory
│   │
│   ├── styles.css               # Tailwind entry + shadcn CSS variables + fonts
│   ├── types/                   # TypeScript declarations
│   └── utils/
│
├── docs/
│   ├── DESIGN.md                # Design system reference
│   └── STRUCTURE.md             # This file
│
├── public/                      # Static assets (favicon, logos, manifest)
├── .env
├── .cta.json
├── biome.json                   # Biome (linter/formatter) config
├── components.json              # shadcn/ui config
├── package.json
├── tsconfig.json
├── vite.config.ts               # Vite + Tailwind v4 + TanStack Start
└── prisma.config.ts
```

---

## 3. Routing Conventions

TanStack Router file-based routing maps `src/routes/` paths directly to URL paths.

### File → URL mapping

| File path | URL |
|---|---|
| `src/routes/index.tsx` | `/` |
| `src/routes/__root.tsx` | Root layout (wraps all routes) |
| `src/routes/dashboard/vendor/products/index.tsx` | `/dashboard/vendor/products/` |
| `src/routes/dashboard/vendor/products/add.tsx` | `/dashboard/vendor/products/add` |
| `src/routes/shop/category.$slug.tsx` | `/shop/category/:slug` |
| `src/routes/api/shop/apply.ts` | `/api/shop/apply` (server handler) |

### Route anatomy

Every route file exports:

```ts
export const Route = createFileRoute('/path/to/route')({
  beforeLoad: ({ context }) => {
    // Optional auth/role guard
    if (!context.user?.role || context.user.role !== 'VENDOR') {
      throw redirect({ to: '/dashboard' });
    }
    return { user: context.user };
  },
  component: RouteComponent,
});
```

### Route types

- **Layout route** — `route.tsx` with `<Outlet />` for child routes
- **Index route** — `index.tsx` renders at the parent path
- **Page route** — `add.tsx`, `edit.tsx`, `detail.tsx`, etc.
- **API route** — uses `server.handlers` object with HTTP method keys

### API route pattern

```ts
export const Route = createFileRoute('/api/shop/apply')({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const headers = getRequestHeaders();
        const session = await auth.api.getSession({ headers });
        // ... handle request, return Response.json(...)
      },
    },
  },
});
```

---

## 4. Page Component Pattern

Every page follows the same state handling pattern:

```tsx
function RouteComponent() {
  const { data, isLoading, isError } = useSomeQuery();

  if (isLoading) return <Skeleton />;            // Loading skeleton
  if (isError || !data) return <EmptyState />;    // Empty/error state
  return <div> {/* Data rendered here */ }</div>; // Content
}
```

### Loading state

Use `<Skeleton>` components that match the real content dimensions to prevent layout shift.

### Empty state

```
w-16 h-16 rounded-2xl bg-muted flex items-center justify-center
  → icon (w-7 h-7 text-muted-foreground)
  → title (text-sm font-semibold)
  → description (text-sm text-muted-foreground mt-1 max-w-xs)
  → optional CTA button (mt-2)
```

### Error state

Same as empty state but with error message and optional "Back" or "Retry" button.

---

## 5. Data Flow

```
User Action → Component → React Query Mutation → API Route (server handler)
                                                       ↓
                                              Prisma (database)
                                                  ↓  Cloudinary
                                              Response.json()
                                                       ↓
                                              Query invalidation
                                                       ↓
                                              UI re-render
```

### Queries (useQuery)

```ts
export function useMyShop() {
  return useQuery<ShopResponse | null>({
    queryKey: [QUERY_KEYS.SHOPS, 'my-shop'],
    queryFn: async () => {
      const response = await axios.get('/api/shop/my-shop');
      return response.data;
    },
  });
}
```

### Mutations (useMutation)

```ts
export function useUpdateShopMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (values) => { /* ... FormData, axios.patch */ },
    onMutate: () => toast.loading('...', { id: '...' }),
    onSuccess: () => {
      toast.success('...', { id: '...' });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.SHOPS] });
    },
    onError: (error) => {
      const message = axios.isAxiosError(error)
        ? (error.response?.data?.error ?? error.message)
        : 'Failed...';
      toast.error(`Error: ${message}`, { id: '...' });
    },
  });
}
```

### FormData mutations (file uploads)

- Create `FormData`, append fields (text strings) + files (File objects)
- Set `Content-Type: multipart/form-data` header
- Server reads via `request.formData()`, parses text fields with Zod, uploads files to Cloudinary

---

## 6. Database Models (Prisma)

| Model | Key fields | Purpose |
|---|---|---|
| **User** | id, name, email, role (enum) | better-auth user |
| **Shop** | name, slug, description, logoUrl, bannerUrl, email, phone, address fields, status, commissionRate, totalSales, totalOrders, rating, totalReviews, ownerId | Vendor shop profile |
| **Product** | productName, sku, description, price, discountPrice, stock, status, images (JSON), categoryId, shopId | Product listing |
| **ProductVariant** | name, price, stock, sku, productId | Product variants |
| **Category** | name, slug, description, imageUrl, parentId | Product categories |
| **Order** | orderNumber, customerId, shipping address, subtotal, total, status, paymentStatus | Customer order |
| **OrderItem** | orderId, shopId, productId, variantId, productName, unitPrice, quantity, total, commissionRate, fulfillmentStatus | Per-shop order line |
| **Payout** | shopId, amount, status | Vendor payout |
| **PayoutItem** | payoutId, orderItemId, amount, commission | Payout line items |
| **Review** | rating, comment, userId, orderItemId | Product review |
| **Banner** | title, imageUrl, linkUrl, active | Homepage banners |

### Shop statuses

`PENDING → APPROVED → ACTIVE` (or `REJECTED`, `SUSPENDED`)

### Order statuses

`PENDING → CONFIRMED → PROCESSING → SHIPPED → DELIVERED` (or `CANCELLED`, `REFUNDED`)

---

## 7. Services Layer (React Query)

| File | Hooks |
|---|---|
| `src/services/shop.ts` | `useMyShop()`, `useAdminShops()`, `useShopDetail()`, `useApplyShopMutation()`, `useUpdateShopMutation()`, `useApproveShopMutation()`, `useRejectShopMutation()` |
| `src/services/product.ts` | `useVendorProducts()`, `useProduct()`, `useVendorCategories()`, `useCreateProduct()`, `useUpdateProduct()`, `useDeleteProduct()`, `useAdminUpdateProduct()` |
| `src/services/banner.ts` | `useHeroBanner()`, `useAdminBanners()`, `useCreateBanner()`, `useUpdateBanner()`, `useDeleteBanner()` |
| `src/services/category.ts` | `useCategories()`, `useCreateCategory()`, `useUpdateCategory()`, `useDeleteCategory()` |

Query keys are centralized in `src/lib/constants.ts`:

```ts
export const QUERY_KEYS = {
  HERO_BANNER: 'hero-banner',
  ADMIN_BANNERS: 'admin-banners',
  CATEGORIES: 'categories',
  SHOPS: 'shops',
  PRODUCTS: 'products',
};
```

---

## 8. Component Patterns

### Card styling

```tsx
<Card className='rounded-2xl border-border shadow-none'>
```

### Info row with icon

```tsx
<div className='flex items-start gap-3'>
  <div className='w-8 h-8 rounded-lg bg-muted flex items-center justify-center shrink-0'>
    <Icon className='w-3.5 h-3.5 text-muted-foreground' />
  </div>
  <div className='min-w-0'>
    <p className='text-xs text-muted-foreground'>{label}</p>
    <p className='text-sm font-medium truncate'>{value}</p>
  </div>
</div>
```

### Section header (eyebrow row)

```tsx
<div className='flex items-center gap-3 mb-3'>
  <div className='h-px w-8 bg-primary' />
  <span className='text-xs font-semibold tracking-[0.18em] uppercase text-primary'>
    Label
  </span>
</div>
```

### Delete confirmation

```tsx
<AlertDialog open={!!deleteId} onOpenChange={...}>
  <AlertDialogContent size='sm'>
    <AlertDialogHeader>
      <AlertDialogTitle>Delete item?</AlertDialogTitle>
      <AlertDialogDescription>This action cannot be undone.</AlertDialogDescription>
    </AlertDialogHeader>
    <AlertDialogFooter>
      <AlertDialogCancel>Cancel</AlertDialogCancel>
      <AlertDialogAction variant='destructive' onClick={...}>Delete</AlertDialogAction>
    </AlertDialogFooter>
  </AlertDialogContent>
</AlertDialog>
```

---

## 9. Form Patterns

All forms use React Hook Form + Zod:

```tsx
const schema = z.object({ /* ... */ });
const form = useForm<FormValues>({
  resolver: zodResolver(schema),
  defaultValues: { /* ... */ },
});

<form onSubmit={handleSubmit(onSubmit)}>
  <Field data-invalid={!!errors.name}>
    <FieldLabel htmlFor='name'>Field Name</FieldLabel>
    <Input id='name' {...register('name')} />
    {errors.name && <FieldError>{errors.name.message}</FieldError>}
  </Field>
  <Button type='submit'>Submit</Button>
</form>
```

File upload inputs use hidden `<Input type='file'>` with `onChange` handler creating `URL.createObjectURL` previews and storing the `File` in form state.

---

## 10. Auth System

- **Library**: better-auth with Prisma adapter + PostgreSQL
- **Session**: Server-side via `auth.api.getSession({ headers })`
- **Route guard**: `beforeLoad` in route definition checks `context.user`
- **Role-based access**: `context.user.role` — `USER`, `VENDOR`, `ADMIN`, `MANAGER`, `CUSTOMER_SERVICE`
- **Vendor layout**: Guards `role !== 'VENDOR'`, redirects to `/dashboard`

---

## 11. Image Handling (Cloudinary)

```ts
// Upload
import { UploadImage } from '@/cloudinary';
const result = await UploadImage(file, 'shops'); // folder name
// Returns: { secure_url, public_id }

// Delete
import { DeleteImage } from '@/cloudinary/delete-image';
await DeleteImage(publicId);
```

Used for shop logos/banners, product images, banner images. Validation: JPEG/PNG/WebP only, max 500KB.

---

## 12. Key Conventions Summary

| Convention | Rule |
|---|---|
| Imports | `@/` maps to `src/` |
| CSS | shadcn CSS variables only — never hard-coded hex |
| Icons | lucide-react |
| Toast | sonner (`toast.loading`, `toast.success`, `toast.error`) |
| cn() | `clsx` + `tailwind-merge` via `src/lib/utils.ts` |
| Loading | `<Skeleton>` matching real dimensions |
| Empty state | Icon + title + description + optional CTA |
| Forms | React Hook Form + Zod + `<Field>` wrapper |
| File upload | FormData + Cloudinary server handler |
| Roles | USER, VENDOR, ADMIN, MANAGER, CUSTOMER_SERVICE |
| Navigation | `useNavigate()` with literal `to` strings |
| API validation | Zod schema on server before processing |
| Animations | `motion/react` — see `docs/DESIGN.md` §5 |

---

## 13. Design System Reference

See `docs/DESIGN.md` for detailed documentation on:

- Color tokens and commerce-specific semantic layer (§2)
- Typography scale with italic contrast pattern (§3)
- Spacing and layout grid breakpoints (§4)
- Animation system with easing, variants, and scroll triggers (§5)
- Component patterns — product card, vendor card, banner, stats strip (§6)
- Button conventions (§7)
- Image overlay gradients (§8)
- Skeleton and empty state patterns (§15-16)
- Master checklist for page sections (§17)
