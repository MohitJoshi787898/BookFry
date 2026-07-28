# System Architecture & Directory Structure

---

## 1. High-Level System Architecture

BookFry operates as a TypeScript monorepo managed via `pnpm` workspace tooling and `turbo` build orchestration.

```
[ Browser / Next.js 15 Client ]
          │
          │ HTTP / REST API (JSON + Cookie Auth)
          ▼
[ Express.js REST API Server ]
    ├── Authentication & RBAC Middlewares
    ├── Modular Domain Services (Auth, Books, Orders, Payments, Admin)
    ├── MongoDB Mongoose ODM (Persistent Collections)
    ├── Redis (ioredis connection pool for caching & recommendations)
    └── BullMQ Worker Pool (Page Views, Recommendations Decay, Order SLA, Email Dispatch)
          │
          ├── Razorpay Payment Gateway (Standard Web Checkout & Webhooks)
          └── Resend / SMTP Transports (Transactional Mailers)
```

### Architectural Realities & Runtime Components
- **Web Frontend (`apps/web`)**: Next.js 15 App Router using React Server Components (RSC) by default for static pages, with `"use client"` directive for interactive pages, TanStack Query v5 for server state, Zustand for client state, and TailwindCSS for styling.
- **Backend API (`apps/api`)**: Node.js Express server adopting a strict 4-layer architecture: `Route → Controller → Service → Repository/Model`.
- **Database Layer**: MongoDB via Mongoose ODM. Transactions (`mongoose.startSession()`) are used during order creation and inventory deduction.
- **Async Job Queue & Redis Telemetry**: BullMQ queues (`pageViewQueue`, `recommendationsQueue`, `orderSlaQueue`, `emailQueue`) backed by Redis. BullMQ workers run initialized inside `apps/api/src/server.ts` process loop on server boot, with an optional standalone `worker-runner.ts` entrypoint for distributed deployment.
- **Bull Board Dashboard**: Mounted at `/api/v1/admin/queues` under strict admin RBAC authorization.

---

## 2. Monorepo File System Structure

### `apps/web/` — Next.js 15 Frontend
```
apps/web/
├── public/                 # Favicon icons, brand logos, PWA manifest
├── src/
│   ├── app/                # Next.js App Router route groups
│   │   ├── (admin)/        # Protected admin management suite
│   │   │   └── admin/      # /admin (dashboard, users, listings, orders, cms, promotions, settings, reports, support, reviews, categories)
│   │   ├── (auth)/         # Unauthenticated auth pages (/login, /register)
│   │   ├── (customer)/     # Customer account pages (/account/profile, orders, wishlist, notifications)
│   │   ├── (marketing)/    # Public landing page (/), /about
│   │   ├── (seller)/       # Seller management portal (/seller/dashboard, listings, orders, earnings)
│   │   ├── (shop)/         # Public catalog search (/books) and book details (/books/[slug])
│   │   ├── cart/           # Shopping cart & checkout drawer (/cart)
│   │   ├── checkout/       # Checkout page with Razorpay integration (/checkout)
│   │   ├── contact/        # Customer support contact form (/contact)
│   │   └── sell/           # Multi-step book listing wizard (/sell)
│   ├── components/         # Reusable UI component catalog
│   │   ├── admin/          # Admin layout & data table components
│   │   ├── auth/           # Login / Register modals & forms
│   │   ├── illustrations/ # Vector SVG empty state & process illustrations
│   │   ├── marketing/      # Hero section, feature grids, FAQ section, testimonials
│   │   ├── navbar/         # Storefront search bar, navigation links, quick filter bar
│   │   ├── sell/           # Listing step wizard forms & image uploader
│   │   ├── seo/            # Dynamic JSON-LD structured data generators
│   │   ├── shared/         # BookCard, AnnouncementBar, Pagination, Footer, Toast
│   │   └── ui/             # Atomic shadcn/ui primitives (Button, Dialog, Input, Select, Badge, Skeleton)
│   ├── hooks/              # Custom React hooks (useWishlist, useDebounce, useMediaQuery)
│   ├── lib/                # API client fetch wrapper, formatters, utility functions
│   ├── stores/             # Zustand client state stores (useAuthStore, useCartStore, useAuthModalStore)
│   └── styles/             # global.css containing HSL CSS tokens & utility rules
```

### `apps/api/` — Express.js REST API Server
```
apps/api/
├── src/
│   ├── config/             # Environment variable schemas & MongoDB/Redis client setup
│   ├── jobs/               # BullMQ queues setup, worker processors, and Bull Board adapter
│   │   ├── workers/        # pageView.worker.ts, recommendations.worker.ts, orderSla.worker.ts, worker-runner.ts
│   │   ├── bull-board.ts   # Express UI adapter mounted at /admin/queues
│   │   └── queues.ts       # Queue definitions sharing ioredis connection pool
│   ├── middlewares/        # Express middleware pipeline (auth, rbac, error, validate, rateLimiter)
│   ├── models/             # Mongoose document schemas (16 collections)
│   ├── modules/            # Domain module slice folders (Route, Controller, Service, Validation)
│   │   ├── admin/          # System management, analytics, CMS, coupons, settings, reports
│   │   ├── auth/           # JWT authentication, register, login, refresh, logout
│   │   ├── books/          # Book catalog & listing management, multi-seller offers
│   │   ├── cart/           # User & guest shopping cart operations
│   │   ├── categories/     # Category hierarchy management
│   │   ├── contact/        # Public support tickets & public CMS endpoints
│   │   ├── events/         # Analytics view event ingestion endpoint
│   │   ├── notifications/  # User notification inbox management
│   │   ├── orders/         # Order creation, status state machine, SLA checks, returns
│   │   ├── payments/       # Razorpay order generation & webhook verification
│   │   ├── recommendations/# Popular, trending velocity, and co-occurrence recommendations
│   │   ├── reviews/        # Book reviews & rating average recalculations
│   │   ├── seller/         # Seller dashboard stats, listings, and payout configuration
│   │   ├── users/          # User profile management & seller payout account setup
│   │   └── wishlist/       # Customer wishlist operations
│   ├── routes/             # Central Express Router index mounting all v1 modules
│   ├── services/           # Shared utilities (Email service with transactional templates)
│   └── utils/              # AppError class, ApiResponse handler, AsyncHandler wrapper
```

---

## 3. Core Technical Data Flows

### Flow 1: User Authentication & Token Lifecycle
1. **Registration/Login Request**: User submits credentials via `/login` or `/register` form.
2. **Controller & Service**: `AuthController.login()` forwards payload to `AuthService.loginUser()`.
3. **Password Verification**: `bcryptjs.compare()` checks plaintext password against stored `passwordHash`.
4. **Token Generation**:
   - Short-lived **Access Token** (JWT, 15m expiration) signed with `JWT_ACCESS_SECRET`.
   - Long-lived **Refresh Token** (JWT, 7d expiration) signed with `JWT_REFRESH_SECRET`. Hash stored on `UserModel.refreshTokenHash`.
5. **Cookie & Response**: Refresh token set as httpOnly cookie; access token returned in JSON response payload.
6. **Client Store Sync**: `useAuthStore.getState().setAuth(user, token)` updates Zustand store.
7. **Silent Refresh Interception**: When API requests return `401 Unauthorized`, `api-client.ts` automatically pauses execution, calls `POST /auth/refresh`, receives a fresh access token, updates `useAuthStore`, and retries the failed API call.

### Flow 2: Cart Checkout & Razorpay Payment Verification
1. **Cart Selection**: User selects seller offer and adds item to cart via `CartService.addItem()`.
2. **Order Generation**: User submits checkout form at `/checkout`. Frontend invokes `POST /api/v1/orders`.
3. **MongoDB Transaction Session**:
   - `OrdersService.createOrder()` starts a Mongoose transaction session.
   - Verifies item stock: `listing.stock >= item.quantity`.
   - Calculates item subtotal, flat shipping fee, tax, and optional coupon discount.
   - Creates `OrderModel` document with status `'pending'` and paymentStatus `'unpaid'`.
   - Decrements listing stock: `listing.stock -= item.quantity`. If stock reaches `0`, listing status changes to `'out_of_stock'`.
   - Clears buyer cart items. Transaction commits.
4. **Razorpay Web Checkout**:
   - Frontend invokes `POST /api/v1/payments/create-razorpay-order` with `orderId`.
   - API communicates with Razorpay SDK to create Razorpay Order ID (`order_xxxxxx`).
   - Razorpay Modal opens on client browser. User completes payment (UPI, Netbanking, Card).
5. **Payment Verification**:
   - Razorpay returns `razorpay_order_id`, `razorpay_payment_id`, and `razorpay_signature`.
   - Frontend posts signatures to `POST /api/v1/payments/verify`.
   - `PaymentsService.verifyPayment()` verifies HMAC SHA256 signature against `RAZORPAY_KEY_SECRET`.
   - Updates `OrderModel.paymentStatus` to `'paid'`, sets `status` to `'confirmed'`, and logs `TransactionModel` entry.
   - Triggers transactional emails to buyer and seller via `EmailService`.

### Flow 3: Order Fulfillment, SLA Checks & Escrow Payout
1. **Seller Dispatch**: Seller views pending orders in `/seller/orders` and updates status to `'shipped'` with tracking carrier and AWB number via `PATCH /api/v1/seller/orders/:id/status`.
2. **Status Guard Verification**: `OrdersService.updateOrderStatus()` validates state machine transitions (`pending` -> `confirmed` -> `shipped` -> `delivered`). Invalid state jumps are rejected.
3. **Background Order SLA Check**:
   - `orderSla.worker.ts` runs repeatably every hour via BullMQ.
   - Identifies orders in `'confirmed'` status older than 48 hours without shipping. Logs SLA violation alerts for admin review.
4. **Delivery Confirmation & Escrow**:
   - Seller or Admin updates status to `'delivered'`. Sets `deliveredAt` timestamp.
   - `orderSla.worker.ts` scans delivered orders older than 7 days (beyond buyer return window).
   - Automatically sets `escrowStatus` to `'released'` and credits seller earnings balance.
