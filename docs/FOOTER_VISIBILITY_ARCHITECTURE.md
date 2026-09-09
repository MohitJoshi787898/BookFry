# Footer Visibility Architecture

**BookFry Frontend — Architecture Decision Record**

---

## Problem Statement

Prior to this change, the BookFry codebase had **no `layout.tsx` files** inside any of the public-facing route groups (`(marketing)`, `(auth)`, `(shop)`). Every page individually imported and manually rendered both `<Navbar />` and `<Footer />` directly within its own page component.

This ad-hoc pattern caused:

1. **No layout ownership**: Footer visibility was a per-page decision with no architectural boundary.
2. **Wrong pages had Footer**: The `/sell` page (a multi-step listing creation wizard) incorrectly rendered the full marketing Footer.
3. **No future-safety**: A developer adding a new marketing page had to manually remember to add Footer — easy to forget or add it to the wrong page.
4. **Duplication risk**: `<Footer />` was imported in 6+ page files — design changes required touching all of them.

---

## Why Footer Was Appearing Incorrectly

The root cause was a mismatch between **page intent** and **component placement**:

- The `(shop)` route group contained both public discovery pages (`/books`, `/books/[slug]`) AND focused transactional flows (`/sell`, `/cart`, `/checkout`).
- Because there was no layout boundary, each page independently decided whether to render Footer.
- The `/sell` page is a multi-step, wizard-style listing flow — not a marketing surface — but it had `<Footer />` manually placed at the bottom, likely copied from other pages.

---

## Route/Experience Classification

### ✅ Public Marketing & Discovery — Footer: YES

| Route | Layout Owner | Reason |
|---|---|---|
| `/` (Home) | `(marketing)/layout.tsx` | Core brand/marketing surface |
| `/about` | `(marketing)/layout.tsx` | Brand storytelling, informational |
| `/contact` | `(marketing)/layout.tsx` | Help/support info page |
| `/books` | `(shop)/books/layout.tsx` | Public book discovery catalog |
| `/books/[slug]` | `(shop)/books/layout.tsx` | Public book detail, SEO-critical |

### ❌ Auth Flows — Footer: NO

| Route | Reason |
|---|---|
| `/login` | Focused auth — Footer is distracting |
| `/register` | Focused auth — Footer is distracting |

### ❌ Transactional / Focused Flows — Footer: NO

| Route | Reason |
|---|---|
| `/sell` | Multi-step listing wizard — NOT a marketing surface |
| `/cart` | Transaction entry with mobile sticky bar |
| `/checkout` | Highly focused payment flow |

### ❌ Application Dashboards — Footer: NO

| Route | Layout | Reason |
|---|---|---|
| `/account/**` | `BuyerLayout` | App dashboard with mobile nav dock |
| `/seller/**` | `SellerLayout` | App dashboard with mobile nav dock |
| `/admin/**` | `AdminLayout` | App workspace with mobile nav dock |
| `/vendor/**` | `VendorLayout` | App dashboard with mobile nav dock |
| `/orders/**` | None (bare) | Transactional order detail context |
| `/invoice/**` | None (bare) | Print-focused document rendering |

---

## Final Layout Ownership Architecture

```
Root layout.tsx
  — Providers, AuthModal, global HTML/body shell
  — No Navbar or Footer

  ├── (marketing)/layout.tsx        [PUBLIC MARKETING LAYOUT]
  │     Renders: Navbar + Footer
  │     Owns: /, /about, /contact
  │     Future: all new marketing/informational pages added here auto-get Footer
  │
  ├── (shop)/books/layout.tsx        [BOOK DISCOVERY LAYOUT]
  │     Renders: Navbar + Footer
  │     Owns: /books, /books/[slug]
  │     Scoped to the /books subdirectory only
  │
  ├── (shop)/sell/page.tsx           [TRANSACTIONAL — No Layout]
  │     Renders: Navbar only (manual, correct)
  │     Footer: ABSENT
  │
  ├── (shop)/cart/page.tsx           [TRANSACTIONAL — No Layout]
  │     Renders: Navbar only (manual, correct)
  │     Footer: ABSENT
  │
  ├── (shop)/checkout/page.tsx       [TRANSACTIONAL — No Layout]
  │     Renders: Navbar only (manual, correct)
  │     Footer: ABSENT
  │
  ├── (auth)/login/page.tsx          [AUTH — No Layout]
  │     Renders: Navbar only (manual, correct)
  │     Footer: ABSENT
  │
  ├── (auth)/register/page.tsx       [AUTH — No Layout]
  │     Renders: Navbar only (manual, correct)
  │     Footer: ABSENT
  │
  ├── (customer)/account/layout.tsx  [BUYER DASHBOARD]
  │     Uses: BuyerLayout (sidebar + header + mobile dock)
  │     Footer: ABSENT (app shell)
  │
  ├── (seller)/seller/*              [SELLER DASHBOARD]
  │     Uses: SellerLayout per page (sidebar + header + mobile dock)
  │     Footer: ABSENT (app shell)
  │
  ├── (admin)/admin/*                [ADMIN WORKSPACE]
  │     Uses: AdminLayout per page (sidebar + header + mobile dock)
  │     Footer: ABSENT (app shell)
  │
  └── vendor/*                       [VENDOR PORTAL]
        Uses: VendorLayout per page (sidebar + header + mobile dock)
        Footer: ABSENT (app shell)
```

---

## Where Footer Is Rendered

The canonical `Footer` component lives at:
```
apps/web/src/components/shared/footer.tsx
```

It is now rendered **only** by two layout files:
1. `apps/web/src/app/(marketing)/layout.tsx`
2. `apps/web/src/app/(shop)/books/layout.tsx`

No individual page component should import or render `<Footer />` directly.

---

## Mobile Behavior

### `/books/[slug]` — `BookDetailMobileStickyBar`
The book detail page has a mobile sticky buy bar (`position: fixed`). The Footer renders above it in document flow but the fixed bar floats over it. No conflict.

### `/cart` — `CartMobileStickyBar`
No Footer present. Mobile sticky checkout bar is unobstructed.

### Dashboard pages (Seller/Admin/Buyer/Vendor)
All use native mobile bottom nav docks. No Footer present. Zero conflict.

### Marketing pages on mobile
Footer renders naturally below page content. No sticky elements present.

---

## Rules for Future Routes

### Adding a new **marketing/informational page**
Place it inside `(marketing)/`. It will automatically inherit Navbar + Footer from `(marketing)/layout.tsx`. Do **not** manually import Footer.

### Adding a new **book-related public page**
Place it inside `(shop)/books/`. It will automatically inherit Navbar + Footer from `(shop)/books/layout.tsx`. Do **not** manually import Footer.

### Adding a new **seller, buyer, or admin page**
Place it inside the appropriate route group and wrap it with `SellerLayout`, `BuyerLayout`, or `AdminLayout`. These layouts have **no Footer** by design.

### Adding a new **transactional page** (checkout-adjacent)
Place it inside `(shop)` but **not** inside `(shop)/books/`. Manually include `<Navbar />` only. Do **not** add Footer.

### Adding a new **auth page**
Place it inside `(auth)`. Manually include `<Navbar />` only. Do **not** add Footer.

---

## Edge Cases

| Edge Case | Behavior |
|---|---|
| `/books` Suspense fallback | Shows skeleton inside `(shop)/books/layout.tsx` — Navbar + Footer still render from layout |
| `/books/[slug]` skeleton state | Skeleton renders `<main>` content — layout provides Navbar + Footer around it |
| `/books/[slug]` error/not-found state | Error state renders `<main>` — layout provides Navbar + Footer |
| 404 page | Falls through root layout — no Navbar or Footer (correct for Next.js 404) |
| `/orders/**` | Bare pages — no Footer, transactional context |
| `/invoice/**` | Bare print-doc pages — no Footer |

---

## Files Changed

| File | Change |
|---|---|
| `app/(marketing)/layout.tsx` | **NEW** — Public marketing layout with Navbar + Footer |
| `app/(shop)/books/layout.tsx` | **NEW** — Book discovery layout with Navbar + Footer |
| `app/(marketing)/page.tsx` | Removed manual Navbar + Footer + wrapping div |
| `app/(marketing)/about/page.tsx` | Removed manual Navbar + Footer + wrapping div |
| `app/(marketing)/contact/page.tsx` | Removed manual Navbar + Footer + wrapping div |
| `app/(shop)/books/page.tsx` | Removed manual Navbar + Footer + wrapping divs (incl. Suspense fallback) |
| `app/(shop)/books/[slug]/page.tsx` | Removed manual Navbar + Footer from skeleton, error state, and success state |
| `app/(shop)/sell/page.tsx` | Removed incorrect `<Footer />` render (Navbar kept) |

---

*Document created: 2026-09-09. Maintain this document whenever new route groups or layout patterns are introduced.*
