# AUDIT.md — Comprehensive Codebase Audit Report for BookFry

**Target**: Full monorepo audit (`@bookmarket/web`, `@bookmarket/api`, `@bookmarket/types`)  
**Audit Baseline**: Measured directly against `AGENTS.md`, `docs/DESIGN.md`, and `docs/IMPLEMENTATION_PLAN.md`.  
**Pass Type**: Structured Review & Diagnostic Pass (No code modified in this pass).

---

## 1. SCOPE COVERAGE — Planned vs. Built

Measured against `docs/IMPLEMENTATION_PLAN.md §1 & §4` (Functional Requirements by Role).

| Module | Planned | Built | Partially Built (What's Missing) | Not Started |
| :--- | :--- | :--- | :--- | :--- |
| **Auth** | Register, Login, Refresh, Logout, Verify Email, Forgot Password, Reset Password | Register, Login, Refresh, Logout, Forgot Password | Email verification route (`/auth/verify-email`) exists, but email verification enforcement is missing prior to checkout/listing creation (*AGENTS.md §10*). | None |
| **Customer / Account** | Browse, Search, Book Details, Cart, Checkout, Orders, Wishlist, Reviews, Messaging Seller | Browse, Search, Book Details, Cart, Checkout, Orders, Wishlist, Reviews | Return request modal built on frontend, but return window calculations and refund processing are mock/partial in backend. | Messaging Seller (Peer-to-Peer Chat) |
| **Seller** | List/Edit/Delete Books, Inventory, Sales/Earnings, Order Fulfillment, Payout Setup | List/Edit/Delete Books, Seller Dashboard, Earnings Table, Order Status Updates | Seller Payout Setup form exists on frontend (`seller/earnings/page.tsx`), but backend lacks dedicated `PATCH /api/v1/users/seller-payout` persistence. Rejection notes displayed, but seller appeal flow is missing. | Seller Suspension / Appeal workflow |
| **Admin** | User Management, Listing Moderation, Category Management, Order Oversight, Reports, CMS | User Management, Moderation, Categories, Orders, Reports | CMS Homepage Section editor (`/admin/cms/page.tsx`) is a static UI shell without MongoDB persistence. | Automated Refund Approval Pipeline |
| **Cart** | Guest/User Cart, Sync, Add/Remove, Quantity Updates, Checkout Re-validation, Multi-Seller Splits | Add/Remove, Quantity Updates, Guest-to-User Sync | Cart checkout does not re-validate price or stock changes that occurred after adding to cart (*AGENTS.md §5.3*). Orders with items from multiple sellers do not split into distinct seller sub-orders (*IMPLEMENTATION_PLAN.md §3.2*). | None |
| **Orders** | Create Order, Status Stepper, Timeline, Courier AWB, Return Request, Seller SLA Job | Create Order, Timeline History, Status Updates, Stepper, Return Modal | AWB tracking numbers are generated mock strings. Unshipped order SLA cancellation background job is missing. | Automated Courier Pickup API Sync (Delhivery/Shiprocket API) |
| **Payments** | Razorpay Checkout, Webhook Verification, Transactions, Signature Checks, Partial Refunds | Razorpay Checkout trigger, Backend Verification (`/payments/verify`) | Webhook route `/payments/webhook` exists, but webhook signature verification and idempotency against duplicate webhook events are not enforced inside MongoDB transactions (*AGENTS.md §2*). | Partial Refund API |
| **Wishlist** | Add, Remove, Clear, Real-time Sync | Add, Remove, Real-time Sync (`useWishlist`), Navbar Counter | Fully built. | None |
| **Reviews** | Add Review, List Reviews, Rating Avg, Proof of Purchase Verification, Seller Reply | Add Review, List Reviews, Rating Avg Recalculation | Proof-of-purchase check (`Order.items` verification) is not enforced in `ReviewService.createReview()` (*IMPLEMENTATION_PLAN.md §3.1*). | Seller Reply to Reviews |
| **Search & Discovery** | Full-text Search, Category Filter, Price Range, Condition Filter, Debounced Auto-Suggest | Text Search, Category Filter, Price Range, Condition Filter, Debounced Auto-Suggest | Fully built. | None |
| **Notifications & Email** | In-App Notifications, Transactional Emails (Order Placed, Seller Sale, Tracking, Payout) | In-App Notifications, Email Templates Generator & Dispatcher | Real SMTP / Resend API delivery is set to console-log fallback in `email.service.ts`; BullMQ background queue is missing (*IMPLEMENTATION_PLAN.md §7*). | BullMQ Async Email Queue |

---

## 2. HARDCODED VS. DYNAMIC — Data Audit

Audited across frontend components for static mocks, hardcoded styling, and client-side truth violations.

| File | What's Hardcoded / Static | What It Should Be Instead | Severity | Violation Reference |
| :--- | :--- | :--- | :--- | :--- |
| `apps/web/src/app/(shop)/books/[slug]/page.tsx` (L265) | `ratingBreakdown` array hardcoded (`{ stars: 5, count: 8912 }`). | Calculated dynamically from MongoDB `ReviewModel` aggregations. | **Should Fix** | *AGENTS.md §4* |
| `apps/web/src/app/(seller)/seller/earnings/page.tsx` (L135-L180) | Payout Account Settings form inputs (`upiId`, `accountNumber`) do not submit to an API mutation. | Wired to `PATCH /api/v1/users/seller-payout` API mutation. | **Blocks Launch** | *IMPLEMENTATION_PLAN.md §3.1* |
| `apps/web/src/app/(admin)/admin/cms/page.tsx` | Homepage banner & hero configuration state array is local React state. | Fetched from and persisted to `CmsModel` in MongoDB via `/api/v1/admin/cms`. | **Should Fix** | *IMPLEMENTATION_PLAN.md §1* |
| `apps/web/src/app/cart/page.tsx` & `checkout/page.tsx` | Subtotal, shipping fee, and tax totals computed client-side via JS `.reduce()`. | Server-computed via `/cart/summary` endpoint to prevent client calculation discrepancies. | **Blocks Launch** | *AGENTS.md §5.1 / §5.3* |
| `apps/web/src/components/shared/book-card.tsx` | Condition tag badge colors use raw Tailwind classes (`bg-emerald-50 text-emerald-700`). | Use CSS token variables or design system badges (`bg-surface border-border text-text-primary`). | **Minor** | *AGENTS.md §3.1* |
| `apps/api/src/services/email.service.ts` | Email dispatch logs to `console.log` rather than calling an SMTP/Resend transport. | Active Resend / Nodemailer SMTP transport with environment credentials. | **Should Fix** | *IMPLEMENTATION_PLAN.md §7* |

---

## 3. EDGE CASES — Cross-Check Against AGENTS.md §5 Business Rules

| Core Flow | Specific Edge Case | Status in Code | Diagnostic Finding & File Reference |
| :--- | :--- | :--- | :--- |
| **Cart / Checkout** | Two buyers checkout last unit simultaneously | **Partially Handled** | `OrdersService.createOrder()` checks `listing.stock < item.quantity`. However, stock deduction is not wrapped in a MongoDB transaction session (`session.startTransaction()`), creating a race condition under concurrent requests (*apps/api/src/modules/orders/orders.service.ts:71*). |
| **Cart / Checkout** | Price or stock changes between add-to-cart & checkout | **Partially Handled** | `OrdersService` reads `listing.price` from DB during checkout, but if the seller increased the price after the buyer added it to cart, the buyer is charged the higher amount without a re-validation prompt (*apps/api/src/modules/orders/orders.service.ts:77*). |
| **Cart / Checkout** | Buyer abandons checkout — soft-held inventory release | **Never Considered** | Inventory is deducted only upon order creation. Soft-holds during checkout do not exist (*IMPLEMENTATION_PLAN.md §3.1*). |
| **Orders** | Invalid order status transition attempted | **Partially Handled** | `updateOrderStatus()` accepts any `OrderStatus` enum string. There is no state-machine transition guard preventing invalid jumps (e.g. `pending` -> `delivered` or `cancelled` -> `shipped`) (*apps/api/src/modules/orders/orders.service.ts:175*). |
| **Orders** | Seller never ships order within SLA (48h) | **Documented Not Implemented** | No automated BullMQ job or cron checks for unshipped orders older than 48 hours to trigger automatic cancellation or admin alerts (*IMPLEMENTATION_PLAN.md §7*). |
| **Payments** | Webhook received twice (Idempotency) | **Documented Not Implemented** | Webhook route `/payments/webhook` does not check if the `paymentId` was already processed against a `ProcessedWebhooks` collection (*AGENTS.md §2*). |
| **Payments** | Webhook signature verification enforced | **Fully Handled** | `PaymentsController.handleWebhook()` verifies Razorpay signature against `RAZORPAY_WEBHOOK_SECRET` (*apps/api/src/modules/payments/payments.controller.ts*). |
| **Payments** | Partial refund handling | **Never Considered** | Only full order refunds are supported in `OrderModel` and `TransactionModel`. |
| **Auth** | Refresh token rotation & reuse detection | **Partially Handled** | `refreshTokenHash` is stored on user model, but token family rotation and invalidation of old refresh tokens on use are missing (*IMPLEMENTATION_PLAN.md §5*). |
| **Auth** | JWT expires mid-request (Silent Refresh) | **Fully Handled** | `api-client.ts` intercepts 401 responses, executes `/auth/refresh`, updates `useAuthStore`, and seamlessly retries the original request (*apps/web/src/lib/api-client.ts:62-135*). |
| **Auth** | Rate limiting on Login / Search routes | **Documented Not Implemented** | `rateLimiter.middleware.ts` exists in the repository structure but is NOT mounted on express routes in `apps/api/src/app.ts` (*AGENTS.md §11*). |

---

## 4. CONSISTENCY — Design System Adherence

1. **Design Token Compliance (*AGENTS.md §3 & §9*)**:
   - Core shell (`Navbar`, `Footer`, `HeroSection`, `AnnouncementBar`) strictly uses HSL design tokens (`bg-primary`, `bg-secondary`, `bg-card`, `border-border`).
   - *Finding*: Some secondary badge components in `book-card.tsx` and `seller-offers-list.tsx` still rely on ad-hoc Tailwind colors (`bg-emerald-50`, `bg-blue-50`, `bg-amber-50`).

2. **Required 8-State UI Coverage (*AGENTS.md §5*)**:
   - `books/page.tsx` (Catalog) implements Loading, Content, Empty, Error, and No Results states.
   - *Finding*: `account/orders/page.tsx` and `seller/listings/page.tsx` lack explicit **Offline** and **Network Timeout Retry** state banners.

3. **Shared Component Reuse (*AGENTS.md §4*)**:
   - `<BookCard />`, `<SearchBar />`, `<OrderTimelineStepper />`, and `<SellerOffersList />` are standardized and reused cleanly across marketing and shop routes.

4. **Dark Mode Audit (*AGENTS.md §3*)**:
   - Verified across main customer storefront and header shells.
   - *Finding*: Admin dashboard data tables (`/admin/users`, `/admin/orders`) need `dark:bg-card` table row background overrides to prevent high-contrast white row bleed in dark mode.

---

## 5. SECURITY & VALIDATION GAPS

1. **RBAC & Middleware Coverage (*AGENTS.md §11*)**:
   - All mutating API routes (`POST`, `PATCH`, `DELETE`) in `books`, `orders`, `cart`, `categories`, `admin` enforce `authMiddleware` and `rbacMiddleware`.
2. **Missing Proof-of-Purchase Verification**:
   - `ReviewService.createReview()` in `apps/api/src/modules/reviews/reviews.service.ts` does NOT verify that the author has a completed `Order` containing `bookId` before allowing review creation (*IMPLEMENTATION_PLAN.md §3.1*).
3. **Un-mounted Rate Limiter Middleware**:
   - `rateLimiter.middleware.ts` is not active on `/api/v1/auth/login` or `/api/v1/books` search routes, exposing the API to brute-force credential stuffing and DDoS scraping (*IMPLEMENTATION_PLAN.md §4 & §5*).
4. **File Upload MIME Validation**:
   - Multer middleware accepts image uploads but does not validate file magic numbers server-side before passing to Cloudinary storage.

---

## 6. PERFORMANCE & CORE WEB VITALS

1. **Unbounded Database Queries (*AGENTS.md §11*)**:
   - `WishlistService.getUserWishlist()` and `NotificationsService.getUserNotifications()` execute `.find({ userId })` without pagination (`limit`/`page`), creating memory bloat for high-volume users.
2. **N+1 Query Bottlenecks**:
   - `BooksService.getBookBySlug()` and `getListingsForCatalog()` iterate through active listings using `activeListings.map(async (l) => l.populate('sellerId'))` instead of performing a single `.populate('sellerId')` on the initial query cursor (*apps/api/src/modules/books/books.service.ts:64*).
3. **Image Optimization (*AGENTS.md §8*)**:
   - Standard HTML `<img>` tags are used in `search-bar.tsx` suggestions to render dynamic external covers, bypassing Next.js image optimization pipeline.

---

## 7. GAPS NOT YET SPECIFIED — Scope Clarifications

The following marketplace features are essential for production operations but are currently unspecified in existing documentation:

1. **Seller Payout Backend Persistence**: Need a dedicated `PATCH /api/v1/users/seller-payout` API route to store UPI VPA and Bank Account details in `User.sellerProfile.payoutDetails`.
2. **Listing Reporting & Flagging**: Buyers need a "Report Listing" button to report counterfeit, stolen, or offensive book listings to Admin moderation.
3. **Seller Order Sub-Shipment Split**: When a buyer orders books from 3 different sellers in a single cart checkout, the platform must split the master order into 3 distinct seller sub-shipments (*IMPLEMENTATION_PLAN.md §3.2*).
4. **Express Rate Limiting & Helmet Security Headers**: Express app assembly in `apps/api/src/app.ts` needs `helmet()`, `cors()`, and `express-rate-limit` actively mounted.

---

## PRIORITIZED TOP-10 FIX LIST

Ranked by **(a) Financial / Security Risk** first, then **(b) Implementation Effort**:

| Rank | Issue | File / Location | Impact & Risk | Effort |
| :--- | :--- | :--- | :--- | :--- |
| **1** | **Cart & Checkout MongoDB Transaction Lock** | `apps/api/src/modules/orders/orders.service.ts:71` | High risk of overselling stock when multiple buyers check out the last copy simultaneously. Needs `session.startTransaction()`. | Medium |
| **2** | **Proof-of-Purchase Review Validation** | `apps/api/src/modules/reviews/reviews.service.ts` | Fake reviews can be posted for any book without buying. Needs `Order` purchase verification. | Low |
| **3** | **Seller Payout Details API Persistence** | `apps/api/src/modules/users/users.service.ts` & `seller/earnings/page.tsx` | Seller bank & UPI payout settings form on frontend is un-wired and does not save to DB. | Low |
| **4** | **Multi-Seller Order Sub-Shipment Split** | `apps/api/src/modules/orders/orders.service.ts` | Multi-seller orders currently share a single status instead of splitting into distinct seller sub-shipments. | High |
| **5** | **Mount Rate Limiting & Security Headers** | `apps/api/src/app.ts` | Auth login and search endpoints vulnerable to brute-force credential stuffing and scraping. | Low |
| **6** | **Order Status Transition State-Machine Guard** | `apps/api/src/modules/orders/orders.service.ts:175` | Sellers or admins can jump orders to invalid states (e.g. `pending` -> `delivered`). | Medium |
| **7** | **Webhook Signature & Idempotency Lock** | `apps/api/src/modules/payments/payments.controller.ts` | Duplicate Razorpay webhook triggers could double-confirm or double-release transactions. | Medium |
| **8** | **N+1 Query Optimization in Books Service** | `apps/api/src/modules/books/books.service.ts:64` | `await l.populate()` inside array map loop causes high DB latency on book detail page. | Low |
| **9** | **Paginate Wishlist & Notifications Queries** | `apps/api/src/modules/notifications/notifications.service.ts` | Unbounded `.find()` queries cause memory spikes for heavy users. | Low |
| **10** | **Server-Side Checkout Total Calculation** | `apps/web/src/app/checkout/page.tsx` | Frontend calculates order subtotal/tax instead of relying solely on server `/cart/summary`. | Medium |

---

*End of Audit Report.*
