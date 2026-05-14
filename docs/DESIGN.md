# Oylkka — Design System

A reference document for replicating the visual language, animation patterns, and component conventions used across the Oylkka multi-vendor e-commerce Next.js / shadcn-ui codebase.

---

## 1. Design Philosophy

| Principle | Description |
|---|---|
| **Commerce-first clarity** | Product and price information takes visual priority over decoration; every pixel earns its place by aiding discovery or conversion |
| **Trust through consistency** | Verified vendor badges, rating displays, and trust strips appear in exactly the same form everywhere — users rely on pattern recognition |
| **Motion with purpose** | Sections animate in via `useInView`; product cards respond to hover; nothing animates purely for aesthetics |
| **Grid discipline** | `max-w-7xl` container, consistent `px-4 sm:px-6 lg:px-8` gutters; product grids are always CSS grid, never flex-wrap |
| **Token-only color** | All color consumed via shadcn CSS variables — never hard-coded hex; primary is green (your existing theme), commerce accents come from semantic roles defined below |

---

## 2. Color Tokens

All colors consumed via Tailwind / shadcn CSS variables. Your existing `globals.css` is the source of truth. Never hard-code values.

```
bg-background              — page background
bg-card                    — product cards, vendor cards, modals
text-foreground            — primary text
text-muted-foreground      — secondary text, meta info, labels
bg-primary / text-primary  — brand green (used for primary CTAs, verified badges, in-stock labels)
bg-primary/10              — tinted icon backgrounds, tag fills
bg-primary/15              — hover tint on cards
text-primary-foreground    — text on green backgrounds
border-border              — all dividers, card borders, table lines
border-primary/30          — hover border on cards
bg-secondary               — pill backgrounds, filter chips
bg-destructive             — sale/discount badges, out-of-stock
text-destructive           — sale price, error states
bg-muted                   — skeleton loaders, empty state fills
```

### Commerce-specific semantic layer

Layer these on top of shadcn tokens using Tailwind utility composition — do not introduce new CSS variables.

| Role | Token composition | Usage |
|---|---|---|
| **Sale badge** | `bg-destructive/10 text-destructive` | Discount percentage pill |
| **New badge** | `bg-primary/10 text-primary` | New arrival label |
| **Hot badge** | `bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400` | Trending product |
| **Verified vendor** | `bg-primary/10 text-primary` | Vendor trust mark |
| **In stock** | `text-primary` | Availability label |
| **Low stock** | `text-amber-600 dark:text-amber-400` | Urgency label |
| **Out of stock** | `text-muted-foreground` | Unavailability label |
| **Rating star** | `text-amber-400` | Star icons |
| **Price main** | `text-foreground font-bold` | Current price |
| **Price old** | `text-muted-foreground line-through` | Original price |
| **Flash sale strip** | `bg-primary text-primary-foreground` | Timed promotion banner |

---

## 3. Typography

Font stack inherits from your `globals.css` (`--font-sans`).

### Scale

| Role | Classes |
|---|---|
| Hero H1 | `text-4xl sm:text-5xl md:text-6xl font-bold leading-[1.05] tracking-tight` |
| Section H2 | `text-2xl md:text-3xl font-bold leading-tight tracking-tight` |
| Section H2 italic contrast word | `italic font-bold text-primary` |
| Card product title | `text-sm font-semibold leading-snug` |
| Card vendor name | `text-xs font-medium text-primary` |
| Price — current | `text-lg font-bold tabular-nums` |
| Price — original | `text-sm font-normal text-muted-foreground line-through tabular-nums` |
| Body / description | `text-sm leading-relaxed text-muted-foreground` |
| Eyebrow label | `text-xs font-semibold tracking-[0.18em] uppercase text-primary` |
| Badge / tag | `text-[10px] font-semibold tracking-[0.12em] uppercase` |
| Rating count | `text-xs text-muted-foreground` |
| Stat number | `text-3xl md:text-4xl font-bold tabular-nums text-primary` |

### Italic contrast pattern

Section headings use `italic font-bold text-primary` for one contrast word. Apply to H1 heroes and H2 section headings.

```jsx
<h2>
  Top{' '}
  <span className="italic font-bold text-primary">Vendors</span>
  <span className="text-primary">.</span>
</h2>
```

### Punctuation accent

Terminal period always in `text-primary` on section headings.

### Taka symbol

Use `৳` (Bengali Taka sign, U+09F3) or the string `"BDT"` — never mix. Wrap in a `<span className="font-normal">` inside a price to reduce its visual weight against the bold number.

---

## 4. Spacing & Layout

```
Container:        max-w-7xl mx-auto px-4 sm:px-6 lg:px-8
Page section gap: py-16 md:py-24
Card gap:         gap-4 (product grids) / gap-5 (vendor/feature grids)
Card pad:         p-4 (product cards) / p-5 (vendor/feature cards)
```

### Product grid breakpoints

```
grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5   — dense (default)
grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4   — comfortable
grid-cols-1 sm:grid-cols-2 lg:grid-cols-3                  — featured / editorial
```

### Section anatomy

Every content section follows this structure:

1. **Eyebrow row** — `h-px w-8 bg-primary` rule + small-caps label + optional live badge
2. **Heading** — bold + italic contrast word + primary period
3. **Sub-action row** — secondary CTA aligned right (`flex justify-between items-end`)
4. **Content grid / carousel**
5. `border-b border-border` bottom separator (omit on last section)

---

## 5. Animation System

### Easing curve

```ts
const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];
```

### Core variants

```ts
const fadeUp: Variants = {
  hidden: { opacity: 0, y: 20 },
  show: (delay: number = 0) => ({
    opacity: 1, y: 0,
    transition: { duration: 0.45, ease: EASE, delay },
  }),
};

const gridVariants: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06 } },
};

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.38, ease: EASE } },
};
```

### Scroll trigger pattern

```ts
const ref = useRef<HTMLDivElement>(null);
const inView = useInView(ref, { once: true, margin: '-80px' });
// Attach ref to the section header row
// animate={inView ? 'show' : 'hidden'}
```

### Stagger delay convention

```
Eyebrow row   → custom={0}
Heading       → custom={0.08}
Sub-action    → custom={0.12}
First para    → custom={0.14}
CTA button    → custom={0.2}
```

### Card hover interactions

```ts
// Product card — subtle lift
whileHover={{ y: -3, scale: 1.01 }}
transition={{ type: 'spring', stiffness: 320, damping: 24 }}

// Image zoom — applied to inner image wrapper
whileHover={{ scale: 1.04 }}
transition={{ duration: 0.4, ease: EASE }}
```

### Countdown timer

Flash sale and limited-offer banners must render a live `HH:MM:SS` countdown using a `useInterval` hook updating every second. The timer blocks use `tabular-nums` to prevent layout shift.

---

## 6. Component Patterns

### 6.1 Eyebrow row

```jsx
<div className="flex items-center gap-3 mb-4">
  <div className="h-px w-8 bg-primary" />
  <span className="text-xs font-semibold tracking-[0.18em] uppercase text-primary">
    Section Label
  </span>
</div>
```

With a live badge (flash sale, new arrivals):

```jsx
<div className="flex items-center gap-3 mb-4">
  <div className="h-px w-8 bg-primary" />
  <span className="text-xs font-semibold tracking-[0.18em] uppercase text-primary">
    Flash Sale
  </span>
  <span className="text-[10px] font-semibold bg-destructive/10 text-destructive
    px-2 py-0.5 rounded-full animate-pulse">
    LIVE
  </span>
</div>
```

### 6.2 Section header row

Always includes an eyebrow, heading, and a right-aligned secondary action:

```jsx
<div ref={ref} className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
  <div>
    {/* Eyebrow row */}
    <div className="flex items-center gap-3 mb-3">
      <div className="h-px w-8 bg-primary" />
      <span className="text-xs font-semibold tracking-[0.18em] uppercase text-primary">
        Featured
      </span>
    </div>
    <h2 className="text-2xl md:text-3xl font-bold tracking-tight leading-tight">
      Top{' '}
      <span className="italic font-bold text-primary">Vendors</span>
      <span className="text-primary">.</span>
    </h2>
  </div>
  <Button variant="ghost" size="sm" asChild className="text-primary gap-1 self-start sm:self-auto">
    <Link href="/vendors">View all <ArrowRight className="w-3.5 h-3.5" /></Link>
  </Button>
</div>
```

### 6.3 Product card

The most common component. Two variants: default (grid) and horizontal (list view).

**Grid variant:**

```jsx
<motion.div
  variants={cardVariants}
  whileHover={{ y: -3 }}
  transition={{ type: 'spring', stiffness: 320, damping: 24 }}
  className="group rounded-2xl border border-border bg-card overflow-hidden
    hover:border-primary/30 hover:shadow-lg hover:shadow-black/5 transition-shadow duration-300"
>
  {/* Image */}
  <div className="relative overflow-hidden aspect-square bg-muted">
    <Image
      src={product.image}
      alt={product.name}
      fill
      className="object-cover group-hover:scale-105 transition-transform duration-500"
    />
    {/* Badges — top-left stack */}
    <div className="absolute top-2 left-2 flex flex-col gap-1">
      {product.discountPct && (
        <span className="text-[10px] font-semibold tracking-wide bg-destructive/90
          text-destructive-foreground px-2 py-0.5 rounded-md">
          -{product.discountPct}%
        </span>
      )}
      {product.isNew && (
        <span className="text-[10px] font-semibold tracking-wide bg-primary/90
          text-primary-foreground px-2 py-0.5 rounded-md">
          New
        </span>
      )}
    </div>
    {/* Wishlist — top-right */}
    <button className="absolute top-2 right-2 w-7 h-7 rounded-full bg-background/80
      backdrop-blur-sm flex items-center justify-center
      opacity-0 group-hover:opacity-100 transition-opacity duration-200
      hover:bg-background">
      <Heart className="w-3.5 h-3.5 text-muted-foreground hover:text-destructive transition-colors" />
    </button>
  </div>

  {/* Body */}
  <div className="p-4 flex flex-col gap-2">
    {/* Vendor */}
    <div className="flex items-center gap-1.5">
      <span className="w-1.5 h-1.5 rounded-full bg-primary" />
      <span className="text-xs font-medium text-primary truncate">{product.vendorName}</span>
    </div>

    {/* Title */}
    <h3 className="text-sm font-semibold leading-snug line-clamp-2">{product.name}</h3>

    {/* Rating */}
    <div className="flex items-center gap-1.5">
      <div className="flex items-center gap-0.5">
        {Array.from({ length: 5 }).map((_, i) => (
          <Star
            key={i}
            className={cn('w-3 h-3', i < Math.round(product.rating)
              ? 'text-amber-400 fill-amber-400'
              : 'text-muted-foreground')}
          />
        ))}
      </div>
      <span className="text-xs text-muted-foreground">({product.reviewCount.toLocaleString()})</span>
    </div>

    {/* Price row */}
    <div className="flex items-baseline gap-2">
      <span className="text-base font-bold tabular-nums">
        ৳{product.price.toLocaleString()}
      </span>
      {product.originalPrice && (
        <span className="text-sm text-muted-foreground line-through tabular-nums">
          ৳{product.originalPrice.toLocaleString()}
        </span>
      )}
    </div>

    {/* Add to cart */}
    <Button size="sm" className="w-full mt-1 gap-1.5 h-8 text-xs">
      <ShoppingCart className="w-3.5 h-3.5" />
      Add to Cart
    </Button>
  </div>
</motion.div>
```

**Stock indicator** — append above the Add to Cart button:

```jsx
{product.stock <= 5 && product.stock > 0 && (
  <p className="text-[11px] font-medium text-amber-600 dark:text-amber-400">
    Only {product.stock} left
  </p>
)}
{product.stock === 0 && (
  <p className="text-[11px] font-medium text-muted-foreground">Out of stock</p>
)}
```

### 6.4 Vendor card

```jsx
<motion.div
  variants={cardVariants}
  whileHover={{ y: -3 }}
  transition={{ type: 'spring', stiffness: 320, damping: 24 }}
  className="group rounded-2xl border border-border bg-card p-5
    hover:border-primary/30 hover:bg-primary/[0.02] transition-colors duration-300
    flex items-center gap-4 cursor-pointer"
>
  {/* Avatar or logo */}
  <div className="relative w-14 h-14 rounded-xl overflow-hidden bg-muted shrink-0
    ring-2 ring-border group-hover:ring-primary/30 transition-all duration-300">
    <Image src={vendor.logo} alt={vendor.name} fill className="object-cover" />
  </div>

  <div className="flex-1 min-w-0">
    <div className="flex items-center gap-2">
      <h3 className="text-sm font-semibold truncate">{vendor.name}</h3>
      {vendor.verified && (
        <BadgeCheck className="w-4 h-4 text-primary shrink-0" />
      )}
    </div>
    <p className="text-xs text-muted-foreground mt-0.5">
      {vendor.productCount.toLocaleString()} products
    </p>
    {/* Animated rule + rating */}
    <div className="flex items-center gap-2 mt-2">
      <div className="h-px w-4 bg-primary/40 group-hover:w-6 transition-all duration-300" />
      <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
      <span className="text-[11px] text-muted-foreground font-medium">{vendor.rating}</span>
    </div>
  </div>

  <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary
    group-hover:translate-x-0.5 transition-all duration-200 shrink-0" />
</motion.div>
```

### 6.5 Flash sale banner

Full-width stripe above product grids. Always includes a live countdown.

```jsx
<div className="rounded-2xl bg-primary px-6 py-4 flex flex-col sm:flex-row
  items-start sm:items-center justify-between gap-4">

  <div className="flex items-center gap-3">
    <Zap className="w-5 h-5 text-primary-foreground shrink-0" />
    <div>
      <p className="text-sm font-bold text-primary-foreground">Flash Sale — Up to 60% off</p>
      <p className="text-xs text-primary-foreground/70 mt-0.5">
        Verified vendors only · Deals refresh every hour
      </p>
    </div>
  </div>

  {/* Countdown */}
  <div className="flex items-center gap-1.5 shrink-0">
    {[
      { value: hours, label: 'HRS' },
      { value: minutes, label: 'MIN' },
      { value: seconds, label: 'SEC' },
    ].map(({ value, label }, i) => (
      <Fragment key={label}>
        {i > 0 && <span className="text-primary-foreground/50 font-bold text-sm mb-3">:</span>}
        <div className="flex flex-col items-center bg-black/20 rounded-lg px-2.5 py-1.5">
          <span className="text-lg font-bold tabular-nums text-primary-foreground leading-none">
            {String(value).padStart(2, '0')}
          </span>
          <span className="text-[9px] text-primary-foreground/60 tracking-wider mt-0.5">
            {label}
          </span>
        </div>
      </Fragment>
    ))}
  </div>
</div>
```

### 6.6 Category pill strip

Horizontally scrollable filter row. Used on listing pages and home section headers.

```jsx
<div className="flex gap-2 overflow-x-auto scrollbar-none pb-1 -mx-4 px-4 sm:mx-0 sm:px-0 sm:flex-wrap">
  {categories.map((cat) => (
    <button
      key={cat.slug}
      onClick={() => setActive(cat.slug)}
      className={cn(
        'flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium',
        'border whitespace-nowrap transition-colors duration-200',
        active === cat.slug
          ? 'bg-primary text-primary-foreground border-primary'
          : 'bg-background text-foreground border-border hover:border-primary/50 hover:text-primary'
      )}
    >
      <span className="text-base leading-none">{cat.emoji}</span>
      {cat.name}
    </button>
  ))}
</div>
```

### 6.7 Search bar

Global site search — always present in navbar, optionally shown full-width as a hero element.

```jsx
<div className="flex items-center gap-0 rounded-xl border border-border bg-background
  focus-within:ring-2 focus-within:ring-primary/30 focus-within:border-primary/50
  transition-all duration-200 overflow-hidden">

  {/* Category selector */}
  <select className="h-11 px-3 text-xs text-muted-foreground bg-transparent
    border-r border-border focus:outline-none cursor-pointer shrink-0">
    <option value="">All</option>
    {categories.map(c => <option key={c.slug} value={c.slug}>{c.name}</option>)}
  </select>

  {/* Input */}
  <div className="flex-1 flex items-center gap-2 px-3">
    <Search className="w-4 h-4 text-muted-foreground shrink-0" />
    <input
      type="search"
      placeholder="Search products, brands, vendors…"
      className="flex-1 h-11 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
    />
  </div>

  {/* Submit */}
  <Button className="rounded-none rounded-r-xl h-11 px-5 gap-1.5 text-sm shrink-0">
    <Search className="w-4 h-4" />
    <span className="hidden sm:inline">Search</span>
  </Button>
</div>
```

### 6.8 Trust badge strip

Horizontal row of trust signals. Always lives at the top of checkout pages and below the hero on the homepage.

```jsx
<div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-y md:divide-y-0 divide-border">
  {[
    { icon: ShieldCheck, label: 'Secure Payment', sub: 'SSL encrypted checkout' },
    { icon: BadgeCheck,  label: 'Verified Vendors', sub: '100% vetted sellers' },
    { icon: RefreshCw,  label: 'Easy Returns', sub: '7-day return policy' },
    { icon: Truck,      label: 'Fast Delivery', sub: 'Nationwide coverage' },
  ].map(({ icon: Icon, label, sub }) => (
    <div key={label} className="flex items-center gap-3 px-5 py-5">
      <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
        <Icon className="w-4.5 h-4.5 text-primary" />
      </div>
      <div>
        <p className="text-sm font-semibold">{label}</p>
        <p className="text-xs text-muted-foreground mt-0.5">{sub}</p>
      </div>
    </div>
  ))}
</div>
```

### 6.9 Product image gallery (PDP)

```jsx
<div className="grid grid-cols-1 md:grid-cols-[96px_1fr] gap-3">
  {/* Thumbnails — vertical strip on md+ */}
  <div className="flex md:flex-col gap-2 order-2 md:order-1 overflow-x-auto scrollbar-none">
    {product.images.map((img, i) => (
      <button
        key={i}
        onClick={() => setActive(i)}
        className={cn(
          'w-16 h-16 md:w-full md:aspect-square rounded-xl border-2 overflow-hidden shrink-0 transition-colors',
          active === i ? 'border-primary' : 'border-border hover:border-primary/50'
        )}
      >
        <Image src={img} alt="" fill className="object-cover" />
      </button>
    ))}
  </div>

  {/* Main image */}
  <div className="relative aspect-square rounded-2xl overflow-hidden bg-muted order-1 md:order-2">
    <Image src={product.images[active]} alt={product.name} fill className="object-cover" />
    {product.discountPct && (
      <span className="absolute top-4 left-4 text-xs font-bold bg-destructive/90
        text-destructive-foreground px-3 py-1 rounded-lg">
        -{product.discountPct}%
      </span>
    )}
  </div>
</div>
```

### 6.10 Vendor verification badge (inline)

Used anywhere vendor name appears alongside trust signal:

```jsx
<div className="flex items-center gap-1.5">
  <span className="text-xs font-medium text-primary">{vendor.name}</span>
  {vendor.verified && (
    <div className="flex items-center gap-1 bg-primary/10 text-primary
      text-[10px] font-semibold tracking-wide px-2 py-0.5 rounded-full">
      <BadgeCheck className="w-3 h-3" />
      Verified
    </div>
  )}
</div>
```

### 6.11 Review / rating summary

```jsx
<div className="flex items-start gap-6 p-5 rounded-2xl border border-border bg-card">
  {/* Big number */}
  <div className="text-center shrink-0">
    <p className="text-4xl font-bold tabular-nums">{product.rating.toFixed(1)}</p>
    <div className="flex items-center justify-center gap-0.5 mt-1">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star key={i} className={cn('w-3.5 h-3.5',
          i < Math.round(product.rating)
            ? 'text-amber-400 fill-amber-400'
            : 'text-muted-foreground')} />
      ))}
    </div>
    <p className="text-xs text-muted-foreground mt-1">{product.reviewCount.toLocaleString()} reviews</p>
  </div>

  {/* Bar chart */}
  <div className="flex-1 flex flex-col gap-1.5">
    {[5, 4, 3, 2, 1].map((star) => {
      const pct = product.ratingBreakdown[star] ?? 0;
      return (
        <div key={star} className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground w-3 shrink-0">{star}</span>
          <div className="flex-1 h-1.5 rounded-full bg-muted overflow-hidden">
            <div
              className="h-full bg-amber-400 rounded-full transition-all duration-500"
              style={{ width: `${pct}%` }}
            />
          </div>
          <span className="text-xs text-muted-foreground w-6 text-right">{pct}%</span>
        </div>
      );
    })}
  </div>
</div>
```

### 6.12 Cart item row

```jsx
<div className="flex items-start gap-4 py-4 border-b border-border last:border-0">
  <div className="relative w-16 h-16 rounded-xl overflow-hidden bg-muted shrink-0">
    <Image src={item.image} alt={item.name} fill className="object-cover" />
  </div>

  <div className="flex-1 min-w-0">
    <div className="flex items-start justify-between gap-2">
      <div>
        <p className="text-sm font-semibold line-clamp-1">{item.name}</p>
        <p className="text-xs text-primary mt-0.5">{item.vendorName}</p>
        {item.variant && (
          <p className="text-xs text-muted-foreground mt-0.5">{item.variant}</p>
        )}
      </div>
      <button className="text-muted-foreground hover:text-destructive transition-colors shrink-0">
        <X className="w-4 h-4" />
      </button>
    </div>

    <div className="flex items-center justify-between mt-3">
      {/* Quantity stepper */}
      <div className="flex items-center gap-1 border border-border rounded-lg overflow-hidden">
        <button
          onClick={() => decrement(item.id)}
          className="w-7 h-7 flex items-center justify-center text-muted-foreground
            hover:bg-muted hover:text-foreground transition-colors">
          <Minus className="w-3 h-3" />
        </button>
        <span className="w-8 text-center text-sm font-medium tabular-nums">{item.qty}</span>
        <button
          onClick={() => increment(item.id)}
          className="w-7 h-7 flex items-center justify-center text-muted-foreground
            hover:bg-muted hover:text-foreground transition-colors">
          <Plus className="w-3 h-3" />
        </button>
      </div>

      <span className="text-sm font-bold tabular-nums">
        ৳{(item.price * item.qty).toLocaleString()}
      </span>
    </div>
  </div>
</div>
```

### 6.13 Stats strip (homepage / vendor profile)

```jsx
<div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-y md:divide-y-0 divide-border">
  {stats.map(({ value, label, icon: Icon }) => (
    <div key={label} className="py-8 px-6 flex flex-col items-center justify-center gap-2">
      <p className="text-3xl md:text-4xl font-bold tabular-nums text-primary">{value}</p>
      <div className="flex items-center gap-1.5">
        <Icon className="w-3.5 h-3.5 text-muted-foreground" />
        <p className="text-xs text-muted-foreground tracking-wide uppercase font-medium">{label}</p>
      </div>
    </div>
  ))}
</div>
```

### 6.14 Animated rule (micro-detail)

The expanding horizontal rule beneath role/category labels inside cards. Identical to the original system.

```jsx
<div className="flex items-center gap-2">
  <div className="h-px w-4 bg-primary/40 group-hover:w-6 transition-all duration-300" />
  <span className="text-[10px] font-semibold tracking-[0.15em] uppercase text-primary/60">
    {label}
  </span>
</div>
```

---

## 7. Button Conventions

```jsx
/* Primary CTA — Add to cart, Buy now, Place order */
<Button className="h-10 px-6 gap-2">
  <ShoppingCart className="w-4 h-4" />
  Add to Cart
</Button>

/* Secondary CTA */
<Button variant="outline" className="h-10 px-6">Browse Vendors</Button>

/* Ghost / text link */
<Button variant="ghost" className="text-primary gap-1 px-0 h-auto">
  View all <ArrowRight className="w-3.5 h-3.5" />
</Button>

/* Icon button (wishlist, share, etc.) */
<Button variant="outline" size="icon" className="w-9 h-9 rounded-xl">
  <Heart className="w-4 h-4" />
</Button>

/* Destructive (remove from cart) */
<Button variant="ghost" size="icon" className="w-8 h-8 text-muted-foreground hover:text-destructive">
  <Trash2 className="w-4 h-4" />
</Button>

/* Side-by-side layout — never stacked */
<div className="flex gap-3">
  <Button className="flex-1 sm:flex-none gap-2">
    <ShoppingCart className="w-4 h-4" />Add to Cart
  </Button>
  <Button variant="outline" className="flex-1 sm:flex-none gap-2">
    <Heart className="w-4 h-4" />Wishlist
  </Button>
</div>
```

---

## 8. Image Overlay Gradients

| Context | Gradient |
|---|---|
| Hero (left-heavy) | `bg-gradient-to-r from-background/95 via-background/70 to-transparent` |
| Product card hover (bottom-up) | `bg-gradient-to-t from-black/60 via-black/20 to-transparent` |
| Vendor banner (bottom-up) | `bg-gradient-to-t from-black/80 via-black/30 to-transparent` |
| Category card overlay | `bg-gradient-to-b from-transparent via-black/20 to-black/70` |

Always use `from-background/…` (not `from-black/…`) in contexts where the text sits on the left side of the gradient, so dark mode renders correctly.

---

## 9. Navbar

### Structure

```
<nav>
  <div max-w-7xl h-14 flex items-center gap-4>
    <Logo />
    <SearchBar className="flex-1 max-w-xl hidden md:flex" />
    <NavActions />   {/* wishlist count, cart count, user menu */}
  </div>
  <CategoryBar />   {/* border-b, horizontally scrollable category pills — desktop only */}
</nav>
```

### Cart / wishlist icon with badge

```jsx
<Button variant="ghost" size="icon" className="relative w-9 h-9">
  <ShoppingCart className="w-5 h-5" />
  {cartCount > 0 && (
    <span className="absolute -top-1 -right-1 w-4.5 h-4.5 rounded-full bg-primary
      text-primary-foreground text-[10px] font-bold flex items-center justify-center tabular-nums">
      {cartCount > 99 ? '99+' : cartCount}
    </span>
  )}
</Button>
```

---

## 10. Footer

### Structure

```
<footer>
  <NewsletterStrip />        ← border-b
  <TrustBadgeStrip />        ← border-b
  <div py-12>                ← main content
    grid lg:grid-cols-5      ← brand col (col-span-2) + 3 nav cols
    <BottomBar />            ← border-t pt-8
  </div>
</footer>
```

### Brand column (col-span-2)

Four stacked blocks with `space-y-5`:

1. **Logo** — icon square + wordmark (see §11)
2. **Tagline** — `text-sm text-muted-foreground leading-relaxed max-w-xs`
3. **Contact list** — icon + label, links `hover:text-primary transition-colors`
4. **Social icon row** — square icon buttons (see §12)

### Nav columns

Column header uses eyebrow rule pattern with `w-4` rule:

```jsx
<div className="flex items-center gap-2 mb-4">
  <div className="h-px w-4 bg-primary" />
  <span className="text-[10px] font-semibold tracking-[0.18em] uppercase text-primary">
    Company
  </span>
</div>
<ul className="space-y-2.5">
  <li>
    <Link className="text-sm text-muted-foreground hover:text-primary transition-colors duration-200">
      Link
    </Link>
  </li>
</ul>
```

### Bottom bar

```jsx
<div className="border-t border-border pt-6">
  <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
    <p className="text-xs text-muted-foreground">
      © {new Date().getFullYear()} Oylkka. All rights reserved.
    </p>
    <div className="flex items-center gap-1.5 text-xs text-muted-foreground flex-wrap justify-center">
      <span className="w-1 h-1 rounded-full bg-primary/50" />
      <span>Secure Checkout</span>
      <span className="w-1 h-1 rounded-full bg-primary/50 ml-1" />
      <span>Verified Vendors</span>
      <span className="w-1 h-1 rounded-full bg-primary/50 ml-1" />
      <span>7-Day Returns</span>
      <span className="w-1 h-1 rounded-full bg-primary/50 ml-1" />
      <span>Nationwide Delivery</span>
    </div>
  </div>
</div>
```

---

## 11. Logo / Brand Mark

```jsx
<div className="flex items-center gap-2.5">
  <div className="w-8 h-8 bg-primary rounded-xl flex items-center justify-center shrink-0">
    <ShoppingBag className="w-4.5 h-4.5 text-primary-foreground" />
  </div>
  <span className="font-bold text-lg tracking-tight">Oylkka</span>
</div>
```

---

## 12. Social Icon Button

```jsx
<a
  href={href}
  target="_blank"
  rel="noopener noreferrer"
  aria-label={label}
  className="w-8 h-8 rounded-xl border border-border flex items-center justify-center
    text-muted-foreground hover:text-primary hover:border-primary/30 hover:bg-primary/5
    transition-all duration-200"
>
  <Icon className="w-4 h-4" />
</a>
```

---

## 13. Newsletter Strip

```jsx
<div className="border-b border-border">
  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
    <div className="grid md:grid-cols-2 gap-8 items-center">

      {/* Left */}
      <div className="space-y-3">
        <div className="flex items-center gap-3">
          <div className="h-px w-8 bg-primary" />
          <span className="text-xs font-semibold tracking-[0.18em] uppercase text-primary">
            Newsletter
          </span>
        </div>
        <h3 className="text-2xl md:text-3xl font-bold tracking-tight leading-tight">
          Get the best{' '}
          <span className="italic font-bold text-primary">deals</span>
          <span className="text-primary">.</span>
        </h3>
        <p className="text-sm text-muted-foreground leading-relaxed max-w-sm">
          Flash sales, new vendor arrivals, and exclusive offers — straight to your inbox.
        </p>
      </div>

      {/* Right — form */}
      <div className="flex flex-col sm:flex-row gap-3">
        <Input
          type="email"
          placeholder="your@email.com"
          className="flex-1 h-11 rounded-xl"
          {...register('email')}
        />
        <Button type="submit" className="h-11 px-6 gap-2 whitespace-nowrap self-start">
          <Send className="w-4 h-4" />
          Subscribe
        </Button>
      </div>
    </div>
  </div>
</div>
```

---

## 14. Eyebrow Rule Width Convention

| Context | Width |
|---|---|
| Full page section header | `w-8` |
| Column header inside footer | `w-4` |
| Compact strip (newsletter, flash banner) | `w-6` |
| Inside image overlay caption | `w-4 bg-white/60` |
| Animated card rule (hover expand) | `w-4 → w-6 on hover` |

---

## 15. Skeleton / Loading States

All loading states use shadcn's `<Skeleton>` component. Product grid skeletons must match the exact dimensions of the real card to prevent layout shift.

```jsx
/* Product card skeleton */
<div className="rounded-2xl border border-border overflow-hidden">
  <Skeleton className="aspect-square w-full" />
  <div className="p-4 space-y-2">
    <Skeleton className="h-3 w-20" />
    <Skeleton className="h-4 w-full" />
    <Skeleton className="h-4 w-3/4" />
    <Skeleton className="h-4 w-16" />
    <Skeleton className="h-8 w-full mt-2" />
  </div>
</div>
```

---

## 16. Empty States

```jsx
<div className="flex flex-col items-center justify-center py-20 gap-4 text-center">
  <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center">
    <Icon className="w-7 h-7 text-muted-foreground" />
  </div>
  <div>
    <p className="text-sm font-semibold">{title}</p>
    <p className="text-sm text-muted-foreground mt-1 max-w-xs">{description}</p>
  </div>
  {cta && (
    <Button size="sm" asChild className="mt-2">
      <Link href={cta.href}>{cta.label}</Link>
    </Button>
  )}
</div>
```

---

## 17. Master Checklist

### Page section

- [ ] Eyebrow row: `h-px w-8 bg-primary` rule + small-caps label in `text-primary`
- [ ] Heading uses bold + `italic font-bold text-primary` contrast word + primary period
- [ ] Section header row has right-aligned "View all" ghost link
- [ ] `useRef` + `useInView({ once: true, margin: '-80px' })` on section header wrapper
- [ ] Text blocks use `fadeUp` with staggered `custom` delays
- [ ] Product/vendor grids wrapped in `gridVariants` with `cardVariants` children
- [ ] Product cards have `whileHover={{ y: -3 }}` spring + image `scale-105` on hover
- [ ] Section ends with `border-b border-border` (except last)
- [ ] Container: `max-w-7xl mx-auto px-4 sm:px-6 lg:px-8`
- [ ] Section padding: `py-16 md:py-24`

### Product card

- [ ] Badges (sale, new, hot) positioned `absolute top-2 left-2` as a flex column
- [ ] Wishlist button `absolute top-2 right-2`, visible only on hover (`opacity-0 group-hover:opacity-100`)
- [ ] Vendor name has colored dot indicator (`bg-primary`)
- [ ] Rating rendered with filled/unfilled `Star` icons from lucide-react
- [ ] Price uses `tabular-nums` to prevent layout shift
- [ ] Stock warning shown when `stock <= 5`
- [ ] "Add to Cart" button is full-width, `h-8 text-xs`

### Vendor card

- [ ] Logo in `ring-2 ring-border group-hover:ring-primary/30` container
- [ ] Verified status shown with `BadgeCheck` icon
- [ ] Animated rule + rating row at bottom of info block
- [ ] Trailing `ArrowRight` icon that translates on hover

### Commerce-specific

- [ ] All prices display `৳` prefix, formatted with `.toLocaleString()`
- [ ] Flash sale banners include live countdown (`HH:MM:SS`, `tabular-nums`)
- [ ] Category pill strip is horizontally scrollable on mobile (`scrollbar-none`)
- [ ] Search bar includes category dropdown and submit button
- [ ] Trust badge strip included on homepage and checkout
- [ ] Cart icon in navbar includes live count badge
- [ ] Skeleton loaders match real card dimensions exactly

### Footer

- [ ] Newsletter strip rendered above main content, separated by `border-b`
- [ ] Trust badge strip rendered below newsletter, separated by `border-b`
- [ ] Brand column spans `col-span-2` in `lg:grid-cols-5` grid
- [ ] Nav column headers use `w-4` eyebrow rule
- [ ] Bottom bar uses `w-1 h-1 rounded-full bg-primary/50` dot separators
- [ ] Trust badges in bottom bar: Secure Checkout · Verified Vendors · 7-Day Returns · Nationwide Delivery