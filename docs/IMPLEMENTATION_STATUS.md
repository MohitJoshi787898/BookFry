# Monorepo Implementation Status & Domain Matrix

> **Note**: This document reflects the true empirical state of the BookFry codebase following the recent audit and implementation passes. It should be periodically re-verified against the codebase.

---

## 1. Domain Implementation Status Tables

### Domain 1: Authentication & User Accounts

| Feature | Status | Notes / Gaps | Relevant Files |
| :--- | :--- | :--- | :--- |
| **Registration & Login** | **Done** | Passwords hashed via bcryptjs (12 salt rounds), access token generated with 15m expiration. | `apps/api/src/modules/auth/auth.service.ts`, `apps/web/src/stores/auth.store.ts` |
| **Refresh Token Lifecycle** | **Done** | Silent refresh interceptor auto-retries 401s; httpOnly cookie refresh token handling. | `apps/web/src/lib/api-client.ts`, `apps/api/src/modules/auth/auth.controller.ts` |
| **Email Verification** | **Partial** | Token generation and `/auth/verify-email` endpoint exist, but email verification mandatory gate is not enforced prior to checkout. | `apps/api/src/modules/auth/auth.routes.ts` |
| **Password Reset** | **Done** | Token generation via email link and reset form. | `apps/api/src/modules/auth/auth.service.ts` |

### Domain 2: Book Catalog, Search & Recommendations

| Feature | Status | Notes / Gaps | Relevant Files |
| :--- | :--- | :--- | :--- |
| **Full-Text Catalog Search** | **Done** | MongoDB `$text` search on title, author, and ISBN with category, condition, and price filters. | `apps/api/src/modules/books/books.service.ts`, `apps/web/src/app/(shop)/books/page.tsx` |
| **Multi-Seller Offers** | **Done** | Book detail page lists all active seller condition offers for a given catalog ISBN. | `apps/web/src/app/(shop)/books/[slug]/page.tsx`, `apps/api/src/modules/books/listing.repository.ts` |
| **Recommendation Engine** | **Done** | BullMQ workers compute `popular:books`, `trending:books` (velocity algorithm), and co-occurrence matrix. | `apps/api/src/jobs/workers/recommendations.worker.ts`, `apps/api/src/modules/recommendations/recommendations.service.ts` |
| **View Event Ingestion** | **Done** | Async fire-and-forget `POST /api/v1/events/view` endpoint updates catalog view counts. | `apps/api/src/modules/events/events.controller.ts` |

### Domain 3: Shopping Cart & Checkout

| Feature | Status | Notes / Gaps | Relevant Files |
| :--- | :--- | :--- | :--- |
| **Cart Operations** | **Done** | Add, remove, quantity update, guest-to-user sync on login. | `apps/web/src/stores/cart.store.ts`, `apps/api/src/modules/cart/cart.service.ts` |
| **Checkout Re-Validation**| **Partial** | Subtotal recalculation occurs on checkout, but soft-holds during checkout do not exist. | `apps/api/src/modules/orders/orders.service.ts` |
| **Multi-Seller Splitting** | **Partial** | Order document currently groups multi-seller cart items under single order header. | `apps/api/src/modules/orders/orders.service.ts` |

### Domain 4: Orders, SLA & Fulfillment

| Feature | Status | Notes / Gaps | Relevant Files |
| :--- | :--- | :--- | :--- |
| **Order Creation** | **Done** | Mongoose transactions ensure atomic stock deduction (`stock -= quantity`). | `apps/api/src/modules/orders/orders.service.ts` |
| **State Machine Guard** | **Done** | Validates transition matrix (`pending` -> `confirmed` -> `shipped` -> `delivered`). | `apps/api/src/modules/orders/orders.service.ts:182` |
| **Order SLA Worker** | **Done** | BullMQ job scans 48h unshipped orders for SLA alerts and auto-releases escrow after 7 days. | `apps/api/src/jobs/workers/orderSla.worker.ts` |
| **Courier API Sync** | **Not Started**| AWB tracking numbers are formatted strings; live Delhivery/Shiprocket API integration not built. | `apps/api/src/modules/orders/orders.service.ts` |

### Domain 5: Payments & Escrow

| Feature | Status | Notes / Gaps | Relevant Files |
| :--- | :--- | :--- | :--- |
| **Razorpay Web Checkout** | **Done** | Generates Razorpay Order ID, opens standard web checkout modal. | `apps/web/src/app/checkout/page.tsx`, `apps/api/src/modules/payments/payments.service.ts` |
| **Signature Verification**| **Done** | Verifies HMAC SHA256 signatures for payments and webhooks. | `apps/api/src/modules/payments/payments.controller.ts` |
| **Escrow Auto-Release** | **Done** | Delivered orders auto-release escrow funds after 7-day buyer return window expires. | `apps/api/src/jobs/workers/orderSla.worker.ts` |

### Domain 6: Seller Portal & Payouts

| Feature | Status | Notes / Gaps | Relevant Files |
| :--- | :--- | :--- | :--- |
| **Listing Management** | **Done** | Multi-step listing wizard, edit listing, soft-delete listing. | `apps/web/src/app/sell/page.tsx`, `apps/web/src/app/(seller)/seller/listings/page.tsx` |
| **Seller Payout Setup** | **Done** | Form persists UPI ID and Bank Account details to `UserModel.sellerProfile.payoutDetails`. | `apps/api/src/modules/users/users.service.ts:updateSellerPayout` |
| **P2P Chat** | **Not Started**| Buyer-to-Seller messaging is not implemented. | N/A |

### Domain 7: Admin Management Suite

| Feature | Status | Notes / Gaps | Relevant Files |
| :--- | :--- | :--- | :--- |
| **Dashboard & Telemetry** | **Done** | Displays GMV, user counts, order volume, recent user list. | `apps/web/src/app/(admin)/admin/dashboard/page.tsx` |
| **Listing Moderation** | **Done** | Moderate listings to `active` or `rejected` with custom rejection reason. | `apps/api/src/modules/admin/admin.service.ts` |
| **CMS Announcement & FAQ**| **Done** | Persisted to MongoDB `CmsModel` and consumed by storefront `AnnouncementBar`. | `apps/api/src/models/cms.model.ts`, `apps/web/src/app/(admin)/admin/cms/page.tsx` |
| **Promotions & Coupons** | **Done** | Full CRUD for promotional discount coupons (`CouponModel`). | `apps/api/src/models/coupon.model.ts`, `apps/web/src/app/(admin)/admin/promotions/page.tsx` |
| **Platform Settings** | **Done** | Platform commission, flat shipping fee, tax rate, and maintenance mode configuration (`PlatformSettingsModel`). | `apps/api/src/models/platform-settings.model.ts` |
| **Financial CSV Export** | **Done** | Streams automated sales CSV report download (`/api/v1/admin/reports/export`). | `apps/api/src/modules/admin/admin.service.ts:exportCsvReport` |
| **Support Tickets** | **Done** | Contact form submissions saved to DB and managed via `/admin/support`. | `apps/api/src/models/support-ticket.model.ts` |
| **Bull Board Dashboard** | **Done** | Embedded queue monitoring dashboard mounted at `/api/v1/admin/queues`. | `apps/api/src/jobs/bull-board.ts` |

---

## 2. Aggregated Codebase Gaps & Future Roadmap Items

1. **Automated Courier Pickup API Sync**: Replace mock AWB generation with live API dispatch triggers (Delhivery / Shiprocket REST API).
2. **Buyer-Seller Peer Messaging**: Build WebSocket or polling chat system for direct condition inquiries.
3. **Email Verification Pre-Checkout Gate**: Require `isEmailVerified === true` prior to order checkout completion.
4. **Proof-of-Purchase Review Gate**: Restrict review creation strictly to buyers who have a completed `Order` containing the target book ID.
