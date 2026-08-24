# BookFry -- Project Context Document

> **Living Document** -- Last audited: August 2026. Source of truth: current codebase.
> Brand Slogan: "क्योंकि.. पढ़ाई रुकनी नहीं चाहिए" -- Education must never stop.

---

## AI Agent Quick Start

Every future AI agent MUST follow this process before writing a single line of code:

1. **Read `AGENTS.md` completely** -- All coding conventions, rules, and non-negotiable constraints.
2. **Read this file (`docs/PROJECT_CONTEXT.md`) completely** -- Current state, architecture, business rules.
3. **Read `docs/DESIGN.md`** -- Brand identity, color tokens, typography.
4. **Read `docs/IMPLEMENTATION_PLAN.md`** -- Cross-reference if the requested feature is covered.
5. **Analyze the relevant existing module** before changing any code (grep/list the directory first).
6. **Reuse existing models, APIs, components, hooks, and patterns** -- Never duplicate what exists.
7. **Never assume old documentation is current** -- Check the actual code file to confirm.
8. **Before implementing a major feature**, explain the approach, identify impacted modules, and list open questions.
9. **Update this file** after completing any significant architectural, business, or feature change.

> **PROJECT_CONTEXT.md is a living document.** After every major completed feature or important change, update this document so future AI agents always have current context.

---

## 1. What is BookFry?

BookFry is a **production-grade digital marketplace for buying, selling, and exchanging new and used books across India**, targeted primarily at students and lifelong learners.

### Core Value Proposition
- Buy and sell **new books** at discounted prices from multiple verified sellers.
- Buy **used/pre-owned books** directly from peer sellers (students, teachers) with a direct-contact model.
- Save up to **80% off retail prices** on textbooks, entrance exam guides, and novels.
- Enable **circular book economy**: books should never be discarded -- they pass from reader to reader.

### Target Audience
- Students (school to college: NEET, JEE, UPSC, engineering, CA, law, arts)
- Teachers and academic professionals
- General readers (fiction, non-fiction, literature)
- Small-scale book re-sellers

### Brand Identity
- **Primary Colors**: Deep Navy `#1A3B5C` ("Book") + Fiery Orange `#F26522` ("Fry")
- **Slogan**: "क्योंकि.. पढ़ाई रुकनी नहीं चाहिए" (Education must never stop)
- **Mascot**: BookFry Fox -- a reading fox character (`fox_reading_178491148655455.png`)
- **Domain**: `bookfry.in` (canonical URL set in landing SEO model)
- **Backend deployed at**: `bookfry.onrender.com`

### Important Naming Note
The IMPLEMENTATION_PLAN.md still references the old name "BookMarket" in its header. The codebase, brand, and all current documentation use **BookFry** exclusively. The Zustand store keys (`bookmarket-auth`, `bookmarket-cart`) still carry the legacy "bookmarket" string in localStorage -- a known naming inconsistency requiring cleanup.

---

## 2. Business Model

### 2.1 User Roles

| Role | Capabilities |
|------|-------------|
| Guest | Browse catalog, search books, view book details, view seller info |
| Customer | All guest actions + cart, checkout, order history, wishlist, reviews, used book requests |
| Seller | All customer actions + list books, manage inventory, view orders/earnings, fulfill orders |
| Admin | Full platform control: user management, listing moderation, CMS, promotions, reports, settings |

A single user account can hold multiple roles simultaneously. `seller` is a profile extension (`sellerProfile` sub-document on `UserModel`), not a separate collection. The roles array supports `['customer', 'seller', 'admin']` combinations.

### 2.2 New Books -- Purchase Flow (Implemented)

1. **Listing**: Seller creates a listing via the multi-step wizard at `/sell`. Creates `BookCatalog` (one per ISBN) + `BookListing` (seller-specific offer). Starts `status: 'pending'` awaiting admin moderation.
2. **Admin Approval**: Admin moderates listing to `active` or `rejected` with a reason.
3. **Discovery**: Buyers browse `/books` (client-side filtered search) or landing page carousels.
4. **Book Detail**: `/books/[slug]` shows all active seller listings for that ISBN (multi-seller offers panel).
5. **Cart**: Buyer adds a specific seller's listing. Cart is server-persisted when authenticated; guest cart uses Zustand localStorage persist.
6. **Checkout**: Buyer submits address + coupon. `POST /api/v1/orders` creates `OrderModel` in `pending` state, decrements stock atomically (Mongoose transaction).
7. **Payment**: Razorpay Web Checkout triggered. User pays via UPI, Netbanking, or Card.
8. **Verification**: Backend verifies HMAC SHA256 signature. Sets `paymentStatus: 'paid'`, `status: 'confirmed'`, logs `TransactionModel`.
9. **Notifications**: Buyer + seller both receive in-app notifications and email confirmations.
10. **Fulfillment**: Seller updates order to `shipped` via `/seller/orders`.
11. **Delivery and Escrow**: After 7-day buyer return window, `orderSla.worker.ts` auto-releases escrow.

### 2.3 Used / Old Books -- Request Flow (Implemented)

Used book transactions follow a **direct peer-to-peer contact model** -- there is NO online payment for used books.

1. **Listing**: Seller lists a used book (condition: `like_new`, `good`, or `fair`) via the same wizard.
2. **Discovery**: Buyers find used books on `/books` with the "Used Books" filter.
3. **Request Submission**: `POST /api/v1/used-book-requests`. Buyer's contact info (name, email, phone, WhatsApp) is stored in `UsedBookRequest.buyerContact`.
4. **Seller Notification**: System sends seller an in-app notification + email with buyer's contact details.
5. **Direct Contact**: Seller contacts buyer via email or WhatsApp to arrange offline price negotiation, condition inspection, and payment (cash, UPI).
6. **Status Tracking**: `UsedBookRequest` follows: `requested` -> `seller_notified` -> `seller_contacted_buyer` -> `accepted`/`in_discussion` -> `completed`/`declined`/`cancelled`/`expired`
7. **Platform Role**: BookFry facilitates the introduction but does NOT intermediate payment or delivery for used books.

**Key Privacy Note**: Buyer contact info (email, phone, WhatsApp) is shared directly with the seller after request submission. No privacy shield exists currently. This is a pending product decision.

### 2.4 Multi-Seller Architecture (Implemented)

BookFry uses a **two-layer book model**:

```
BookCatalog (1 per ISBN)
  -- title, author, isbn, description, category, images
  -- ratingAvg, ratingCount, viewsCount (aggregated)
  -- slug (URL routing key)

BookListing (1 per seller per catalog entry)
  -- catalogId -> BookCatalog
  -- sellerId -> User
  -- condition, price, discountPrice, stock
  -- city, state, pincode (seller location)
  -- status (pending / active / rejected / archived / sold)

Constraint: UNIQUE index on (catalogId, sellerId)
A seller cannot list the same ISBN twice; they update their existing listing.
```

On `/books/[slug]`, all active `BookListing` records for a given `BookCatalog` slug are displayed as a "Seller Offers" panel.

### 2.5 Cart Behavior

- Cart items reference `listingId` (a specific seller's BookListing), not a generic book ID.
- One cart per authenticated user (persisted in `CartModel`); guest cart stored in Zustand localStorage.
- On login, guest cart is merged with server cart via `POST /api/v1/cart/merge`.
- Multi-seller items coexist in a single cart. Current `OrderModel` groups all items under one order header -- **Known architectural limitation**.
- Stock validation occurs at both add-to-cart and checkout time.

### 2.6 Platform Commission and Financials

- `PlatformSettingsModel` stores commission rate, flat shipping fee, and tax rate -- configurable by admin.
- `TransactionModel` records `amount`, `platformFee`, `netPayout` per order.
- Actual payout disbursement to seller is NOT yet automated.

---

## 3. Technology Stack

| Domain | Technology |
|--------|-----------|
| Monorepo Tooling | Turborepo + pnpm workspaces |
| Web Framework | Next.js 15 (App Router, React Server Components) |
| Backend | Node.js + Express.js (4-layer: Route -> Controller -> Service -> Repository/Model) |
| Database | MongoDB via Mongoose ODM |
| Shared Types | `@bookmarket/types` package (`packages/types/src/index.ts`) |
| Language | TypeScript (strict mode, both apps) |
| Styling | TailwindCSS + shadcn/ui primitives + CSS custom properties in `global.css` |
| Client State | Zustand (`useAuthStore`, `useCartStore`, `useAuthModalStore`) |
| Server State | TanStack Query v5 (`useQuery`, `useMutation`) |
| Animations | Framer Motion |
| Forms | React Hook Form + Zod |
| Authentication | JWT (Access: 15m, Refresh: 7d, httpOnly cookie) + bcryptjs (salt rounds: 12) |
| Payments | Razorpay Web Checkout (primary) + Stripe (exists, not primary) + Mock (testing) |
| Background Jobs | BullMQ + Redis (4 queues: page-view, recommendations, order-sla, email) |
| Email | `EmailService` in `apps/api/src/services/email.service.ts` |
| Image Upload | Multer -> Cloudinary pipeline |
| Rate Limiting | `express-rate-limit` (100 req / 15 min per IP globally) |
| Security | Helmet, CORS allowlist, Zod input validation, RBAC middleware |
| Queue Dashboard | Bull Board at `/api/v1/admin/queues` (admin auth required) |
| Font | `Plus Jakarta Sans` via `next/font` -- NOTE: DESIGN.md specifies Source Serif 4/Inter but code uses Plus Jakarta Sans only |

---

## 4. Monorepo Structure

```
project/
+-- apps/
|   +-- api/              # Express.js REST API
|   +-- web/              # Next.js 15 frontend
+-- packages/
|   +-- types/            # Shared TypeScript types (@bookmarket/types)
+-- docs/                 # All project documentation
+-- docker-compose.yml    # MongoDB + Redis local dev containers
+-- turbo.json            # Turborepo task pipeline
+-- pnpm-workspace.yaml   # pnpm workspace config
+-- package.json          # Root workspace scripts
```

### Frontend Route Groups (`apps/web/src/app/`)

| Route Group | Routes | Rendering |
|-------------|--------|-----------|
| `(marketing)/` | `/` (landing), `/about`, `/contact` | Server Components (SSR) |
| `(shop)/` | `/books`, `/books/[slug]`, `/cart`, `/checkout`, `/sell` | Mixed (CSR-heavy) |
| `(auth)/` | `/login`, `/register` | Client Components |
| `(customer)/account/` | `/account/profile`, `/account/orders`, `/account/wishlist`, `/account/notifications`, `/account/requests` | Client Components |
| `(seller)/seller/` | `/seller/dashboard`, `/seller/listings`, `/seller/orders`, `/seller/earnings`, `/seller/requests` | Client Components |
| `(admin)/admin/` | `/admin/dashboard`, `/admin/users`, `/admin/listings`, `/admin/categories`, `/admin/orders`, `/admin/cms`, `/admin/promotions`, `/admin/reports`, `/admin/reviews`, `/admin/requests`, `/admin/settings`, `/admin/support` | Client Components |

### Backend Module Structure (`apps/api/src/`)

```
src/
+-- app.ts                 # Express app assembly
+-- server.ts              # Entry point (DB, Redis, BullMQ workers boot)
+-- config/                # env.ts, db.ts, redis.ts, cloudinary.ts
+-- middlewares/           # auth, rbac, errorHandler, rateLimiter, upload, validate
+-- models/                # 19 Mongoose schemas
+-- modules/               # 18 domain modules (routes, controller, service, repository, validation)
+-- routes/index.ts        # Central router mounting all modules under /api/v1
+-- services/              # email.service.ts (shared transactional emailer)
+-- jobs/                  # BullMQ queues, workers, Bull Board
|   +-- queues.ts          # 4 queues: page-view, recommendations, order-sla, email
|   +-- workers/           # pageView.worker.ts, recommendations.worker.ts, orderSla.worker.ts
+-- utils/                 # AppError, ApiResponse, asyncHandler, logger
```

---

## 5. Database Architecture

### 5.1 Implemented Collections (19 models)

| Collection | Model File | Description |
|------------|-----------|-------------|
| `users` | `user.model.ts` | Unified user + seller profile (role array + sellerProfile sub-doc) |
| `bookcatalogs` | `book-catalog.model.ts` | Canonical book record per ISBN (deduplication key) |
| `booklistings` | `book-listing.model.ts` | Seller-specific offer per catalog entry |
| `books` | `book.model.ts` | **LEGACY** single-seller book model (pre-catalog architecture) |
| `carts` | `cart.model.ts` | One cart per user (items reference listingId) |
| `orders` | `order.model.ts` | Purchase orders with timeline state machine |
| `usedBookRequests` | `used-book-request.model.ts` | Peer-to-peer contact requests for used books |
| `transactions` | `transaction.model.ts` | Financial records per order (platformFee, netPayout, escrow) |
| `notifications` | `notification.model.ts` | In-app notification inbox per user |
| `reviews` | `review.model.ts` | Book reviews with seller reply support |
| `wishlists` | `wishlist.model.ts` | User wishlist (bookIds array) |
| `categories` | `category.model.ts` | Hierarchical categories (parentId for subcategories) |
| `cms` | `cms.model.ts` | Singleton CMS: announcement bar text + FAQ items |
| `landingsections` | `landing-section.model.ts` | CMS-controlled homepage sections (ordered, enabled/disabled) |
| `landingseos` | `landing-seo.model.ts` | CMS-controlled SEO metadata for homepage |
| `platformsettings` | `platform-settings.model.ts` | Commission %, shipping fee, tax rate, maintenance mode |
| `coupons` | `coupon.model.ts` | Promotional discount coupons |
| `contacts` | `contact.model.ts` | Contact form submissions |
| `supporttickets` | `support-ticket.model.ts` | Admin-managed support ticket pipeline |

### 5.2 Status Machines

**UsedBookRequest:** `requested` -> `seller_notified` -> `seller_contacted_buyer` -> `accepted`/`declined`/`in_discussion` -> `completed`/`cancelled`/`expired`

**Order:** `pending` -> `confirmed` -> `shipped` -> `delivered` -> `return_requested` -> `return_approved`/`return_rejected`; also `cancelled` and `refunded` branches.

**BookListing:** `draft` -> `pending` -> `active` (or `rejected`); active can go to `archived`/`sold`/`removed`.

### 5.3 Notable Database Indexes

| Collection | Index | Purpose |
|------------|-------|---------|
| `users` | `email` unique | Login lookup |
| `bookcatalogs` | `isbn` unique | Deduplication key |
| `bookcatalogs` | `slug` unique | URL routing |
| `bookcatalogs` | `{title, author, description, tags}` text | Full-text search |
| `booklistings` | `{catalogId, sellerId}` unique | One listing per seller per book |
| `booklistings` | `{status, price}` compound | Filter queries |
| `orders` | `{buyerId, createdAt}` | Buyer order history |
| `orders` | `{items.sellerId, createdAt}` | Seller order view |
| `usedBookRequests` | `{buyerId}`, `{sellerId}`, `{status, createdAt}` | Request queries |
| `notifications` | `{userId, createdAt}` | Inbox queries |

---

## 6. Backend API Architecture

### 6.1 Base URL and Response Envelope

All API routes are prefixed `/api/v1`.

**Success:** `{ "success": true, "data": {}, "meta": { "page": 1, "limit": 20, "total": 134 }, "error": null }`

**Error:** `{ "success": false, "data": null, "error": { "code": "VALIDATION_ERROR", "message": "...", "details": [] } }`

### 6.2 All Registered API Routes

| Route Prefix | Module | Key Endpoints |
|-------------|--------|--------------|
| `/` (public) | landing | `GET /landing` -- full CMS landing page data |
| `/admin/landing` | landing (admin) | CRUD for landing sections and SEO |
| `/auth` | auth | `POST /register`, `/login`, `/refresh`, `/logout`, `/verify-email`, `/forgot-password`, `/reset-password` |
| `/categories` | categories | `GET /categories`, admin CRUD |
| `/books` | books | `GET /books` (search/filter), `GET /books/:slug`, `POST /books` (seller), `PATCH`, `DELETE` |
| `/cart` | cart | `GET /cart`, `POST /cart/items`, `PATCH /cart/items/:id`, `DELETE /cart/items/:id`, `POST /cart/merge` |
| `/payments` | payments | `POST /payments/create-intent`, `POST /payments/verify`, `POST /payments/webhook` |
| `/orders` | orders | `POST /orders`, `POST /orders/checkout-mixed`, `GET /orders`, `GET /orders/seller` (isolated), `GET /orders/:id`, `PATCH /orders/:id/status`, `PATCH /orders/:orderId/sub-orders/:subOrderId/status` (package tracking), `POST /orders/:id/return` |
| `/wishlist` | wishlist | `GET /wishlist`, `POST /wishlist/:bookId`, `DELETE /wishlist/:bookId` |
| `/reviews` | reviews | `POST /reviews`, `PATCH /reviews/:id`, `DELETE /reviews/:id` |
| `/notifications` | notifications | `GET /notifications`, `PATCH /notifications/:id/read`, `PATCH /notifications/read-all` |
| `/seller` | seller | `GET /seller/dashboard` (isolated stats), `/seller/orders`, `/seller/listings`, `/seller/earnings` |
| `/admin` | admin | User mgmt, listing moderation, reports, CMS, support, coupons, settings |
| `/contact` | contact | `POST /contact` (public support form) |
| `/users` | users | `GET /users/me`, `PATCH /users/me`, profile and address management |
| `/events` | events | `POST /events/view` (async page view ingestion) |
| `/recommendations` | recommendations | `GET /recommendations/popular`, `/trending`, `/similar/:id` |
| `/coupons` | coupons | `POST /coupons/validate` (public), admin CRUD |
| `/used-book-requests` | used-book-requests | `POST /used-book-requests`, `POST /used-book-requests/batch`, `GET /used-book-requests/buyer`, `GET /used-book-requests/seller`, `PATCH /used-book-requests/:id/accept` (unlocks contact), `PATCH /used-book-requests/:id/decline`, `PATCH /used-book-requests/:id/status` |
| `/api/v1/admin/queues` | Bull Board | BullMQ monitoring dashboard (admin auth required) |

### 6.3 Middleware Pipeline

```
Request -> Helmet -> CORS (allowlist) -> cookieParser
        -> express.json (rawBody for webhooks)
        -> rateLimit (100/15min/IP, disabled in test)
        -> requireAuth (JWT validation)
        -> requireAdmin/requireRoles (RBAC)
        -> validate (Zod schema runner)
        -> Controller -> errorHandler
```

### 6.4 Payment Provider Abstraction

Three implementations behind `PaymentProvider` interface:
- `RazorpayProvider` -- **Primary** (India, UPI, Netbanking, Cards)
- `StripeProvider` -- Exists, not primary
- `MockProvider` -- Test environment only

Factory `payment-provider.factory.ts` selects provider based on env config.

### 6.5 BullMQ Background Workers

| Queue | Worker | Purpose |
|-------|--------|---------|
| `page-view-queue` | `pageView.worker.ts` | Async view count increment to BookCatalog |
| `recommendations-queue` | `recommendations.worker.ts` | Popular, trending (velocity decay), co-occurrence |
| `order-sla-queue` | `orderSla.worker.ts` | 48h unshipped alert + 7-day escrow auto-release |
| `email-queue` | `email.worker.ts` | Asynchronous transactional emails (Nodemailer + Google App Password SMTP) |
| `push-queue` | `push.worker.ts` | Web Push / Firebase Cloud Messaging alerts to buyer and seller devices |

Workers gracefully degrade: if Redis is unavailable, queues return `null` and jobs are skipped with a log warning.

---

## 7. Frontend Architecture

### 7.1 Rendering Strategy

| Page | Rendering | Rationale |
|------|-----------|-----------|
| Landing `/` | SSR (React Server Component) | SEO-first, CMS-controlled, 60s ISR revalidation |
| Books listing `/books` | CSR (`'use client'`) | Complex filter state, TanStack Query |
| Book detail `/books/[slug]` | SSR + Client islands | SEO critical, multi-seller offers server-side |
| Cart `/cart` | CSR | Real-time state, user-specific |
| Checkout `/checkout` | CSR | Payment flow, auth required |
| Sell wizard `/sell` | CSR | Multi-step form, image upload |
| Admin pages | CSR | Data-heavy tables, admin-only |
| Seller pages | CSR | User-specific dashboards |
| Customer account | CSR | User-specific data |

### 7.2 Component Catalog

```
src/components/
+-- admin/          # AdminDataTable, admin layout shell
+-- auth/           # AuthModal (login + register + forgot password)
+-- illustrations/  # SVG vector illustrations for empty states
+-- marketing/      # All landing page section components
|   +-- section-renderer.tsx     <- CMS section type dispatcher
|   +-- hero-section.tsx, book-carousel.tsx, category-grid.tsx
|   +-- exchange-knowledge-section.tsx, faq-section.tsx, features-bar.tsx
|   +-- newsletter-section.tsx, promotional-banner-section.tsx
|   +-- quick-filter-bar.tsx, reading-journey-cta.tsx
|   +-- sell-your-books-strip.tsx, testimonials-section.tsx
|   +-- why-bookfry-section.tsx
+-- navbar/         # Storefront search bar
+-- sell/           # Listing wizard step forms, image uploader
+-- seo/            # OrganizationJsonLd, WebsiteJsonLd generators
+-- shared/         # BookCard, AnnouncementBar, Footer, Navbar, Skeletons, EmptyState
|   +-- book-card.tsx            # Primary product card (hover-page-turn)
|   +-- navbar.tsx               # Main storefront nav (29KB -- needs decomposition)
|   +-- skeletons.tsx            # BookCard, list, grid skeleton states
|   +-- empty-state.tsx          # Generic empty state component
|   +-- seller-offers-list.tsx   # Multi-seller comparison panel on book detail
+-- ui/             # shadcn/ui atomic primitives (Button, Dialog, Input, Badge, Skeleton, etc.)
```

### 7.3 Zustand Stores

| Store | File | Persisted Key | State |
|-------|------|---------------|-------|
| `useAuthStore` | `auth.store.ts` | `bookmarket-auth` | `user`, `accessToken`, `isAuthenticated` |
| `useCartStore` | `cart.store.ts` | `bookmarket-cart` | `items[]`, syncs with server on auth |
| `useAuthModalStore` | `auth-modal.store.ts` | None | `isOpen`, `mode` (login/register) |

Auth store also sets `bookmarket_logged_in` cookie (7-day, SameSite=Lax) that Next.js middleware reads for route protection.

### 7.4 Route Protection

File: `apps/web/src/middleware.ts`

Protected (redirect to `/login` if no auth cookie): `/seller/*`, `/admin/*`, `/account/*`, `/checkout`

Auth routes (redirect to `/` if authenticated): `/login`, `/register`

### 7.5 API Client

File: `apps/web/src/lib/api-client.ts`
- Typed fetch wrapper with Bearer token injection from `useAuthStore`
- **Silent refresh**: On 401, calls `POST /auth/refresh`, updates store, retries original request

---

## 8. Authentication Flow

### 8.1 Registration
1. User submits form -> `POST /api/v1/auth/register`
2. Password bcrypt hash (12 rounds). Creates `UserModel` with `roles: ['customer']`, `isEmailVerified: false`
3. Returns access token + sets refresh token httpOnly cookie
4. Frontend `useAuthStore.setAuth()` stores user + access token

**Gap**: Email verification endpoint exists but `isEmailVerified` is NOT enforced at checkout.

### 8.2 Login
1. `POST /api/v1/auth/login` with email + password
2. `bcrypt.compare()` validates password
3. **CRITICAL**: If `email === 'admin@bookfry.com'` and missing `admin` role, auto-adds all roles -- MUST be removed before production (`auth.service.ts:47`)
4. Issues access token (15m JWT) + refresh token (7d JWT); refresh token hash stored on user; raw token set as httpOnly cookie

### 8.3 Session Refresh
- On any 401 in `api-client.ts`, silent refresh triggers automatically
- `POST /api/v1/auth/refresh` validates against stored hash, rotates both tokens

### 8.4 Seller Role Acquisition
- Any customer can become a seller via `/sell`
- Backend creates minimal `sellerProfile` sub-document; adds `'seller'` to `roles[]`

---

## 9. Landing Page Architecture

### 9.1 Overview
The landing page (`/`) is an SSR React Server Component:
1. Fetches `GET /api/v1/landing` with `next: { tags: ['landing-page'], revalidate: 60 }` (60-second ISR)
2. Passes sections to `<SectionRenderer />` which dispatches each to the correct React component
3. Renders SEO metadata via `generateMetadata()`

### 9.2 CMS-Controlled Section Types

| Section Type | Component | Renders |
|-------------|-----------|---------|
| `hero` | `HeroSection` | Search bar, CTAs, mascot image, stats |
| `features` | `FeaturesBar` | Trust bar: "Up to 80% Off", "Express Delivery" |
| `quick_filter` | `QuickFilterBar` | Category filter pills |
| `book_carousel` | `BookCarousel` | Horizontal scrollable book cards |
| `knowledge_story` | `ExchangeKnowledgeSection` | How BookFry works (buy/sell steps) |
| `category_grid` | `CategoryGrid` | Category image grid |
| `why_us` | `WhyBookFrySection` | Brand pillars / value propositions |
| `testimonials` | `TestimonialsSection` | Student testimonials |
| `cta` | `ReadingJourneyCTA` | Final CTA banner |
| `newsletter` | `NewsletterSection` | Email newsletter signup |
| `faq` | `FAQSection` | FAQ accordion |
| `banner` | `PromotionalBannerSection` | Promotional banner strip |

### 9.3 Data Flow
```
Next.js Server Render (60s ISR)
  -> GET /api/v1/landing
    -> LandingService.getPublicLandingData()
      -> Redis cache check (key: 'landing:public_data', TTL: 1 hour)
      -> Cache miss: fetch LandingSections + CmsModel + LandingSeoModel from MongoDB
      -> Populate book_carousel sections with live book data
      -> Write to Redis cache
  -> Returns: { seo, announcement, sections[] }
  -> SectionRenderer filters sections where enabled=false
```

### 9.4 Auto-Seeding
If `landingsections` collection is empty, `LandingService.ensureDefaultSectionsExist()` seeds 12 default sections on first request.

### 9.5 What Is NOT CMS-Controlled
- Footer content (hardcoded in `footer.tsx`)
- Navbar category links (fetched live from categories API)
- Actual book data in carousels (fetched live from books API)

---

## 10. Admin Dashboard

### 10.1 Module Status Matrix

| Module | Route | Status | Backend | Frontend | Notes |
|--------|-------|--------|---------|----------|-------|
| Dashboard | `/admin/dashboard` | Done | GMV, user count, order count, recent data | KPI cards | Real data from AdminService |
| Users | `/admin/users` | Done | Paginated, search, role filter, ban/unban | Data table + actions | |
| Listings | `/admin/listings` | Done | Moderate to active/rejected | Review queue | Moderation history tracked |
| Categories | `/admin/categories` | Done | CRUD, hierarchy support | Management UI | parentId for subcategories |
| Orders | `/admin/orders` | Done | All orders, status updates | Data table | Admin can update any order |
| Used Book Requests | `/admin/requests` | Done | View all, status management | Request list | |
| Reviews | `/admin/reviews` | Done | View, delete | Moderation UI | |
| Promotions/Coupons | `/admin/promotions` | Done | Full CRUD CouponModel | Coupon management | Code, %, min order, expiry |
| CMS | `/admin/cms` | Done | Announcement bar + FAQ | Edit UI | Singleton CmsModel |
| Landing Page CMS | API only | Backend Done | Full CRUD sections + SEO | Needs Verification | API complete; frontend editor uncertain |
| Reports/Analytics | `/admin/reports` | Done | CSV export stream, GMV aggregate | Download trigger | GET /admin/reports/export |
| Settings | `/admin/settings` | Done | PlatformSettingsModel | Settings form | Commission, shipping, tax |
| Support | `/admin/support` | Done | ContactModel saved to DB | Ticket list | |
| Bull Board (Queues) | `/api/v1/admin/queues` | Done | BullMQ monitoring | Browser UI | Admin RBAC protected |
| Seller Verification | N/A | Not Started | No verification workflow | None | Sellers self-register freely |
| Payout Management | N/A | Not Started | TransactionModel exists | No payout UI | Escrow to ledger only |
| Email Templates | N/A | Not Started | EmailService hardcodes templates | None | |
| Roles and Permissions | N/A | Not Started | Hard-coded RBAC | None | |
| Audit Logs | N/A | Not Started | No audit log model | None | |
| SEO (per-page) | N/A | Partial | Landing SEO CMS done | Other pages missing | Only landing SEO is CMS-controlled |

---

## 11. Design System

Primary Source of Truth: `docs/DESIGN.md` + `apps/web/src/styles/global.css`

### 11.1 Brand Colors (from global.css -- source of truth)

| CSS Variable | Light Mode HSL | Hex | Usage |
|-------------|----------------|-----|-------|
| `--primary` | `210 56% 23%` | `#1A3B5C` | Deep Navy -- CTAs, headers, brand |
| `--secondary` | `20 89% 54%` | `#F26522` | Fiery Orange -- badges, secondary CTAs, announcement bar |
| `--accent` | `36 100% 50%` | `#FF9900` | Warm Gold -- star ratings, deal highlights |
| `--background` | `0 0% 100%` | `#FFFFFF` | Page background |
| `--foreground` | `210 50% 10%` | -- | Primary text |
| `--muted` | `28 40% 98%` | -- | Subtle fills |
| `--border` | `0 0% 93%` | -- | Borders, dividers |
| `--success` | `142 71% 36%` | `#1E8E5A` | Verified, delivered |
| `--warning` | `38 92% 50%` | `#D97706` | Pending, low stock |
| `--danger` | `0 84% 60%` | `#DC2626` | Error, banned, out of stock |
| `--info` | `217 91% 60%` | `#2563EB` | Informational |

Dark mode defined in `.dark` CSS class. Toggle uses `localStorage.theme` via inline `<head>` script to prevent flash.

### 11.2 Typography

**ACTUAL font loaded**: `Plus Jakarta Sans` (via `next/font/google`).

**Discrepancy**: `DESIGN.md` specifies `Source Serif 4` for headings and `Inter` for body. However `layout.tsx` only loads `Plus Jakarta Sans`. The `--font-serif` and `--font-mono` CSS variables are aliased to `--font-sans` in `global.css`. Resolve intentionally before production.

### 11.3 CSS Utility Classes (from global.css)

| Class | Purpose |
|-------|---------|
| `.hover-page-turn` | Tactile book card hover (translateY -4px + shadow) |
| `.bookmark-badge` | Clip-path ribbon shape for condition/discount badges |
| `.glass-surface` | Glassmorphism card (backdrop-blur, semi-transparent) |
| `.glass-header` | Sticky nav glassmorphism |
| `.bg-gradient-brand` | Navy gradient (hero backgrounds) |
| `.bg-gradient-flame` | Orange-gold gradient (CTA elements) |
| `.bg-bookshelf-pattern` | Dot grid decorative backgrounds |
| `.surface-0/1/2` | Elevation surface tiers |
| `.tap-scale` | Mobile tap active scale (0.96) |
| `.focus-ring` | Accessible focus ring utility |
| `.no-scrollbar` | Hide scrollbar for carousels |
| `.pb-mobile-nav` | Mobile safe area padding (64px + safe-area-inset) |

### 11.4 Illustration and Icon Rules

- **Illustrations**: SVG illustrations in `components/illustrations/`. Preferred for empty states and marketing content.
- **Lucide Icons**: Only for functional UI controls. NOT for decorative or marketing use.
- **BookFry Fox Mascot**: `fox_reading_178491148655455.png` -- used in hero section.

---

## 12. Feature Status Matrix

| Feature | Status | Notes |
|---------|--------|-------|
| User Registration | Done | Auth modal + bcrypt + UserModel |
| User Login / JWT | Done | Auth modal + Zustand + JWT + refreshTokenHash |
| Silent Token Refresh | Done | api-client interceptor + /auth/refresh endpoint |
| Email Verification | Partial | Token endpoint exists; NOT enforced at checkout |
| Password Reset | Done | Token + reset endpoint exists |
| Book Catalog (multi-seller) | Done | Two-layer BookCatalog + BookListing model |
| Full-Text Book Search | Done | MongoDB $text + category, condition, price filters |
| New vs Used Filter | Done | conditionType filter in /books UI |
| Book Detail + Multi-Seller Offers | Done | /books/[slug] + SellerOffersList component |
| Seller Listing Wizard | Done | Multi-step /sell + ISBN, images, condition, price |
| Admin Listing Moderation | Done | Admin listings page + AdminService.moderateListing |
| Shopping Cart | Done | Cart store + /cart + CartModel; guest + auth, merge on login |
| Checkout | Done | /checkout + Razorpay + OrdersService + Mongoose tx |
| Razorpay Payment | Done | Razorpay provider + HMAC verify + TransactionModel |
| Coupon Discounts | Done | Checkout coupon input + CouponModel validation |
| Order History (Buyer) | Done | /account/orders + OrdersService |
| Order Status (Seller) | Done | /seller/orders + status machine guard |
| Return Requests | Done | ReturnRequestModal + 7-day window |
| Used Book Request (P2P) | Done | No payment; contact-based + UsedBookRequestModel |
| Seller Notifications | Done | In-app + email on new order + used book request |
| Wishlist | Done | /account/wishlist + WishlistService + WishlistModel |
| Reviews | Done | Book detail reviews; proof-of-purchase gate partially enforced |
| Recommendation Engine | Done | BullMQ workers + Redis sorted sets (popular, trending) |
| Landing Page (CMS) | Done | SectionRenderer SSR + LandingService + Redis cache |
| Announcement Bar | Done | AnnouncementBar component + CmsModel (admin-togglable) |
| FAQ (CMS) | Done | FAQSection + CmsModel.faqs |
| Admin Dashboard | Done | KPI cards + GMV, users, orders from AdminService |
| Admin User Management | Done | Data table + ban/unban |
| Admin Reports / CSV Export | Done | CSV stream endpoint + download button |
| Platform Settings | Done | PlatformSettingsModel (commission, shipping, tax) |
| Support Tickets | Done | Contact form + ContactModel + admin list |
| Bull Board Queue Monitor | Done | /api/v1/admin/queues |
| Geolocation/Distance Sorting | Partial | Fields exist (city/state/pincode) but no actual geo query |
| Seller Payout Disbursement | Partial | Bank/UPI details stored; no automated transfer |
| ISBN Auto-Fill | Not Started | High seller friction currently |
| Shipping Integration | Not Started | No Shiprocket/Delhivery; mock AWB only |
| Buyer-Seller Chat | Not Started | Socket.io dependency exists but unused |
| Book Exchange/Barter | Not Started | Not in any model or route |
| Seller Verification/KYC | Not Started | Sellers self-register freely |
| Automated Payout Transfer | Not Started | Escrow to ledger only |
| Admin Landing Page Editor (UI) | Needs Verify | API complete; frontend editor status uncertain |
| PWA Manifest / Offline | Not Started | No service worker |
| Frontend Tests | Not Started | 0 frontend unit tests |
| Backend Integration Tests | Done | 33 tests passing |

---

## 13. Recent Architectural Changes

### 13.1 BookMarket Renamed to BookFry
What: Project was "BookMarket". Rebranded to "BookFry" with new logo, colors, and mascot.
Status: Fully renamed in all production code. Residual: Zustand keys (`bookmarket-auth`, `bookmarket-cart`), MongoDB DB name in `.env.example` (`bookmarket`), `IMPLEMENTATION_PLAN.md` header still says "BookMarket".

### 13.2 Two-Layer Book Model (Catalog + Listing)
What: Single `Book` model replaced by `BookCatalog` (one per ISBN) + `BookListing` (seller-specific).
Why: Multi-seller support, proper deduplication, cleaner price comparison.
Status: Fully implemented. Legacy `book.model.ts` still exists -- likely dead code, needs audit.
Risk: Confusion between legacy `Book` type (view-model combining catalog + listing) and new separate models.

### 13.3 Landing Page Became CMS-Controlled SSR
What: Static React components replaced by CMS-driven `LandingSection` MongoDB collection + `SectionRenderer` + Redis cache.
Why: Marketing team needs to update content without code deployments.
Status: Fully implemented. 60s ISR + 1-hour Redis cache.
Remaining: Admin frontend editor for landing sections may not be complete.

### 13.4 Used Book Request Flow Defined
What: Used books use no-payment P2P contact model instead of standard checkout.
Why: Used books require physical inspection, negotiation, campus pickup.
Status: Fully implemented. Buyer contact info shared with seller.
Remaining: Privacy anonymization layer (pending product decision).

### 13.5 Razorpay as Primary Payment Provider
What: Razorpay added as primary payment provider for India alongside existing Stripe stub.
Status: Implemented. Factory pattern selects provider. Mock provider for testing.

### 13.6 BullMQ Worker Architecture
What: Async job queue system added for page views, recommendations, order SLA, and email.
Why: Prevent blocking API responses.
Status: 4 queues + 3 workers. Graceful Redis degradation.

---

## 14. Known Issues and Technical Debt

### CRITICAL

| Issue | Impact | Location |
|-------|--------|----------|
| Admin auto-promote by email (admin@bookfry.com hardcoded) | Anyone knowing this email gets admin access | `auth.service.ts:47` |
| Email verification not enforced at checkout | Fake emails can purchase books | `auth.service.ts`, `orders.service.ts` |
| No seller verification/KYC | Anyone can list books; fraud risk | Missing module entirely |
| Legacy `book.model.ts` coexists with new two-layer model | Dead code, schema confusion, potential bugs | `models/book.model.ts` |

### HIGH PRIORITY

| Issue | Impact | Location |
|-------|--------|----------|
| Multi-seller orders not split | Fulfillment complexity; sellers see each other's items | `orders.service.ts` |
| Buyer contact info directly shared with seller | Privacy risk on used book requests | `used-book-requests.service.ts` |
| No shipping/logistics integration | Manual AWB strings; no real tracking | Missing module |
| No automated payout disbursement | Sellers cannot withdraw earnings | Missing module |
| Proof-of-purchase review gate may not be fully enforced | Trust integrity issues | `reviews` module |
| Zustand store keys still use `bookmarket-*` | Breaking migration risk | `auth.store.ts`, `cart.store.ts` |
| `IMPLEMENTATION_PLAN.md` header says "BookMarket" | Confuses new AI agents | `docs/IMPLEMENTATION_PLAN.md:1` |

### MEDIUM PRIORITY

| Issue | Impact | Location |
|-------|--------|----------|
| Font discrepancy: DESIGN.md says Source Serif 4/Inter but code uses Plus Jakarta Sans | Design incoherence | `layout.tsx`, `DESIGN.md` |
| `/books/page.tsx` is 722 lines with `'use client'` | Violates 250-line AGENTS.md limit | `(shop)/books/page.tsx` |
| `navbar.tsx` is 29KB | Oversized, hard to maintain | `shared/navbar.tsx` |
| No Redis cache invalidation on admin CMS updates | Landing shows stale content for up to 1 hour | `landing.service.ts` |
| No soft inventory hold during checkout | Concurrent checkouts could oversell | `orders.service.ts` |
| No E2E tests (Playwright) | Critical paths untested | Missing |
| Geolocation incomplete -- distanceKm in types but no actual geo query | Feature partially promised | Types, listing repository |

### LOW PRIORITY

| Issue | Impact | Location |
|-------|--------|----------|
| `app/globals.css` is 32 bytes; actual styles in `src/styles/global.css` | Non-standard location | `app/globals.css` |
| `a.md` and `query` files at project root | Clutter | Root |
| `logindemodata.json` at root | Should not be in repo | Root |
| No `canonical` URL on book detail pages | SEO duplicate content risk | Book detail page |
| No PWA manifest | Mobile engagement missed | Frontend |

---

## 15. Pending Product Decisions

### 15.1 Used Book Payment Responsibility
Question: Should BookFry intermediate the payment for used book transactions, or keep it peer-to-peer?
Options: A. Keep current (contact-based, offline payment). B. Add escrow for used books. C. Hybrid (seller opts in).
Recommendation: Option A for private beta; Option B for production scale.

### 15.2 Buyer-Seller Privacy for Used Book Requests
Question: Should buyer's phone/WhatsApp be directly shared with sellers on request submission?
Options: A. Keep direct sharing (current). B. Anonymize via in-app messaging. C. Masked phone via Exotel/Twilio. D. WhatsApp Business API.
Recommendation: Option B long-term; Option A for private beta.

### 15.3 Multi-Seller Order Splitting
Question: One order or multiple sub-orders when cart has items from multiple sellers?
Options: A. Keep single order (current). B. Split into sub-orders. C. Parent order + child seller-orders.
Recommendation: Option C for production; Option A for MVP if seller dashboard correctly filters items.

### 15.4 Seller Verification Requirements
Question: What is required to become a verified seller?
Options: A. Self-declaration (current). B. Phone OTP. C. Aadhaar/PAN via Digilocker. D. Admin approval of first listing.
Recommendation: Option B (phone OTP) + Option D (first listing admin review).

### 15.5 Platform Commission Structure
Question: What percentage does BookFry take? How is GST handled?
`PlatformSettingsModel.commissionRate` exists but actual deduction logic and GST handling are not defined.

### 15.6 Shipping Ownership
Question: Who arranges shipping for new books -- seller or BookFry?
Options: A. Seller-managed (current). B. Platform-managed (Shiprocket/Delhivery). C. Hybrid.
This decision determines Shiprocket integration priority and pricing model.

### 15.7 Recommendation Ranking Rules
Question: How should books be ranked in search results and carousels?
Current state: MongoDB `$text` relevance + price/condition for search; BullMQ velocity decay for trending. No paid promotion tiers.

---

## 16. Next Development Priorities

### Priority 0 -- Must Fix Before Any Production Traffic

| Task | Why | Complexity |
|------|-----|-----------|
| Remove admin@bookfry.com auto-promote from `auth.service.ts` | Critical security flaw | Low |
| Audit and migrate/remove legacy `book.model.ts` | Dead code risk, schema confusion | Medium |
| Enforce email verification as checkout gate | Fraud prevention | Medium |
| Rename Zustand store keys from `bookmarket-*` to `bookfry-*` | Data integrity, branding | Low |
| Fix `IMPLEMENTATION_PLAN.md` "BookMarket" header | New agent confusion | Low |

### Priority 1 -- Core Marketplace Completion

| Task | Why | Complexity | Module |
|------|-----|-----------|--------|
| Admin Landing Page Frontend Editor | Complete CMS control for marketing | Medium | admin pages |
| Seller Dashboard -- filter items to own listings | Multi-seller order confusion | Medium | seller.service.ts |
| Email verification UI flow + checkout enforcement | Trust and fraud prevention | Medium | Auth, orders |
| ISBN Auto-Fill via Google Books/OpenLibrary API | Reduce seller friction | Medium | Books module |
| Geolocation -- real 2dsphere distance query | Used book campus discovery | High | Books, listing |
| Privacy layer for used book buyer contact | Buyer safety | High | Used-book-requests |

### Priority 2 -- Production Hardening

| Task | Why | Complexity |
|------|-----|-----------|
| Shiprocket/Delhivery integration | Real tracking, automated AWB | High |
| Automated seller payout disbursement | Sellers need actual withdrawals | High |
| Proof-of-purchase review enforcement | Trust integrity | Low |
| Playwright E2E tests (register->buy, list->order) | Catch regressions | High |
| Frontend component unit tests (Vitest/RTL) | Component stability | Medium |
| Redis cache invalidation on CMS admin updates | Stale landing content | Low |
| Soft inventory hold during checkout | Prevent overselling | Medium |
| Per-route rate limiting (stricter for auth) | Security hardening | Low |

### Priority 3 -- Growth Features

| Task | Why | Complexity |
|------|-----|-----------|
| Buyer-Seller in-app chat (Socket.io) | Used book negotiation | High |
| Seller phone OTP verification | Platform trust, fraud reduction | Medium |
| Price drop notifications for wishlist | Re-engagement | Medium |
| Exam/curriculum tagging (NEET, JEE, UPSC) | Discovery for target audience | Medium |
| Hyper-local campus search (GeoJSON 2dsphere) | Zero-shipping student use case | High |
| PWA manifest + offline mode | Mobile installability | Medium |

### Priority 4 -- Future Scale

| Task | Why | Complexity |
|------|-----|-----------|
| Book exchange/barter system | Core brand promise | Very High |
| AI visual condition grading (Gemini Vision) | Buyer trust for used books | High |
| BookFry Wallet (buyback credit) | Student retention | Very High |
| Atlas Search migration | Better full-text relevance at scale | Medium |
| Multi-language support (Hindi UI) | India market penetration | High |
| Seller analytics dashboard | Data-driven seller retention | Medium |

---

*End of PROJECT_CONTEXT.md*

*This document was generated by deep codebase audit on August 21, 2026.*
*Update this file after every significant architectural, business, or feature change.*
