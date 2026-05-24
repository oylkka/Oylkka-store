# Oylkka — Bangladesh Marketplace

A full-featured e-commerce marketplace built for Bangladesh. Buyers can browse thousands of products from verified vendors, pay via bKash, COD, or wallet, and track orders in real time. Vendors get their own dashboard to manage products, orders, and payouts.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Runtime | [Bun](https://bun.sh) 1.3+ |
| Framework | [TanStack Start](https://tanstack.com/start/latest) (React 19) |
| Database | [PostgreSQL](https://neon.tech) via [Prisma](https://prisma.io) |
| Auth | [better-auth](https://better-auth.com) |
| Payments | bKash (tokenized checkout) + Cash on Delivery + Wallet |
| Email | Brevo SMTP via Nodemailer |
| Rate Limiting | Upstash Redis |
| Media | Cloudinary |
| Styling | Tailwind CSS 4 + shadcn/ui |

## Getting Started

```bash
bun install
bun run dev
```

The app starts at `http://localhost:3000`.

### Environment Variables

Copy `.env` from your team or set the following:

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | PostgreSQL connection string |
| `BETTER_AUTH_URL` | App base URL (e.g. `http://localhost:3000`) |
| `SMTP_SERVER` | SMTP host (e.g. `smtp-relay.brevo.com`) |
| `SMTP_PORT` | SMTP port |
| `SMTP_USER` | SMTP username |
| `SMTP_PASS` | SMTP password |
| `SMTP_SENDER` | From email address |
| `BKASH_APP_KEY` | bKash merchant app key |
| `BKASH_APP_SECRET` | bKash merchant app secret |
| `GOOGLE_CLIENT_ID` | Google OAuth client ID |
| `GOOGLE_CLIENT_SECRET` | Google OAuth client secret |
| `UPSTASH_REDIS_URL` | Upstash Redis URL |
| `UPSTASH_REDIS_TOKEN` | Upstash Redis token |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary cloud name |
| `CLOUDINARY_API_KEY` | Cloudinary API key |
| `CLOUDINARY_API_SECRET` | Cloudinary API secret |

## Project Structure

```
src/
├── components/      # Reusable UI components (shadcn/ui + custom)
├── lib/             # Server utilities (auth, email, db, etc.)
├── routes/          # TanStack Start file-based routes + API
│   ├── api/         # Server API handlers
│   ├── auth/        # Auth pages
│   ├── vendor/      # Vendor dashboard
│   └── dashboard/   # Admin dashboard
├── schemas/         # Zod validation schemas
├── services/        # Business logic services
├── types/           # Shared TypeScript types
└── generated/       # Prisma client (auto-generated)
```

## Key Features

- **Product browsing** with category filters, search, and sorting
- **Shopping cart** with real-time stock validation
- **Checkout** supporting bKash, COD, and Wallet payments
- **Order tracking** with per-item fulfillment status
- **Vendor dashboard** for product management and order fulfillment
- **Admin panel** for managing shops, orders, payouts, and content
- **Coupon & voucher system** with tiered discounts and BOGO
- **Email notifications** for orders, shipping, refunds, and more
- **Bengali language support** (partial)

## Scripts

| Command | Description |
|---------|-------------|
| `bun run dev` | Start dev server on port 3000 |
| `bun run build` | Build for production |
| `bun run preview` | Preview production build |
| `bun test` | Run unit tests |
| `bun run test:components` | Run component tests (jsdom) |
| `bun run check` | Lint and format with Biome |

## Deployment

The app is deployed via Nitro. Build output goes to `.output/`.

```bash
bun run build
bun run preview
```

## License

Private — all rights reserved.
