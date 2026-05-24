# Oylkka — Audit & Implementation Plan

> Generated from full codebase audit on May 22, 2026


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
| 8.1 | **Set up test with bun** (`bun run test`) | HIGH |
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
