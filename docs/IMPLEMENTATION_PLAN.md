# IMPLEMENTATION_PLAN.md — BookMarket

Production implementation plan for a Next.js + Express + MongoDB book marketplace (new & used books). Pairs with `AGENTS.md` (conventions) and `DESIGN.md` (UI/UX).

---

## 1. Roles & scope

| Role     | Capability                                                                                                                   |
| -------- | ---------------------------------------------------------------------------------------------------------------------------- |
| Guest    | Browse, search, view book details, view seller profiles                                                                      |
| Customer | All guest actions + cart, checkout, order history, wishlist, reviews, messaging seller                                       |
| Seller   | All customer actions + list/edit/delete books, manage inventory, view sales/earnings, fulfill orders                         |
| Admin    | User management, listing moderation, category management, order oversight, reports, CMS (homepage banners/featured sections) |

A single user account can hold both `customer` and `seller` capability (seller is a profile extension, not a separate account type) — model it as a role flag + `SellerProfile` document, not a separate `User` collection.

---

## 2. Monorepo & folder structure

### 2.1 Root

```
book-market/
├── apps/
│   ├── web/
│   └── api/
├── packages/
│   ├── types/
│   └── config/
├── docs/
├── docker-compose.yml
├── turbo.json
├── pnpm-workspace.yaml
└── package.json
```

### 2.2 `apps/web` (Next.js 16, App Router)

```
apps/web/
├── src/
│   ├── app/
│   │   ├── (marketing)/
│   │   │   ├── page.tsx                # landing
│   │   │   └── about/page.tsx
│   │   ├── (shop)/
│   │   │   ├── books/
│   │   │   │   ├── page.tsx            # listing/search
│   │   │   │   └── [slug]/page.tsx     # book detail
│   │   │   ├── cart/page.tsx
│   │   │   └── checkout/page.tsx
│   │   ├── (auth)/
│   │   │   ├── login/page.tsx
│   │   │   ├── register/page.tsx
│   │   │   └── forgot-password/page.tsx
│   │   ├── (customer)/account/
│   │   │   ├── orders/page.tsx
│   │   │   ├── wishlist/page.tsx
│   │   │   ├── addresses/page.tsx
│   │   │   └── profile/page.tsx
│   │   ├── (seller)/seller/
│   │   │   ├── dashboard/page.tsx
│   │   │   ├── listings/page.tsx
│   │   │   ├── listings/new/page.tsx
│   │   │   ├── orders/page.tsx
│   │   │   └── earnings/page.tsx
│   │   ├── (admin)/admin/
│   │   │   ├── dashboard/page.tsx
│   │   │   ├── users/page.tsx
│   │   │   ├── listings/page.tsx
│   │   │   ├── categories/page.tsx
│   │   │   └── reports/page.tsx
│   │   ├── api/                        # route handlers ONLY for BFF concerns (e.g. webhook receivers, image sign)
│   │   ├── layout.tsx
│   │   └── globals.css
│   ├── components/
│   │   ├── ui/                         # shadcn primitives
│   │   ├── shared/                     # navbar, footer, search-bar, book-card
│   │   ├── forms/
│   │   └── charts/
│   ├── features/                        # feature-colocated logic
│   │   ├── auth/
│   │   ├── books/
│   │   ├── cart/
│   │   ├── orders/
│   │   ├── wishlist/
│   │   ├── reviews/
│   │   └── seller/
│   │       └── (each: api.ts, hooks.ts, types.ts, components/)
│   ├── lib/
│   │   ├── api-client.ts               # fetch wrapper + interceptors
│   │   ├── auth.ts
│   │   ├── query-client.ts
│   │   └── utils.ts
│   ├── stores/                          # zustand stores (cart, ui)
│   ├── hooks/
│   └── middleware.ts                    # route protection
├── public/
├── next.config.ts
├── tailwind.config.ts
└── package.json
```

### 2.3 `apps/api` (Express + TypeScript)

```
apps/api/
├── src/
│   ├── config/
│   │   ├── env.ts
│   │   ├── db.ts
│   │   ├── redis.ts
│   │   └── cloudinary.ts
│   ├── modules/
│   │   ├── auth/
│   │   │   ├── auth.routes.ts
│   │   │   ├── auth.controller.ts
│   │   │   ├── auth.service.ts
│   │   │   ├── auth.validation.ts       # zod schemas
│   │   │   └── auth.types.ts
│   │   ├── users/
│   │   ├── books/
│   │   ├── categories/
│   │   ├── cart/
│   │   ├── orders/
│   │   ├── payments/
│   │   ├── wishlist/
│   │   ├── reviews/
│   │   ├── notifications/
│   │   └── admin/
│   │       (each module mirrors auth/'s structure, plus a *.repository.ts)
│   ├── models/                          # Mongoose schemas
│   │   ├── user.model.ts
│   │   ├── book.model.ts
│   │   ├── order.model.ts
│   │   ├── category.model.ts
│   │   ├── review.model.ts
│   │   ├── wishlist.model.ts
│   │   ├── cart.model.ts
│   │   ├── notification.model.ts
│   │   └── transaction.model.ts
│   ├── middlewares/
│   │   ├── auth.middleware.ts           # verifies JWT
│   │   ├── rbac.middleware.ts           # role checks
│   │   ├── validate.middleware.ts       # zod schema runner
│   │   ├── rateLimiter.middleware.ts
│   │   ├── errorHandler.middleware.ts
│   │   └── upload.middleware.ts         # multer -> cloudinary
│   ├── jobs/                             # BullMQ queues/workers
│   │   ├── email.queue.ts
│   │   └── imageProcessing.queue.ts
│   ├── sockets/
│   │   └── index.ts
│   ├── utils/
│   │   ├── AppError.ts
│   │   ├── ApiResponse.ts
│   │   ├── logger.ts
│   │   └── asyncHandler.ts
│   ├── routes/
│   │   └── index.ts                     # mounts all module routers
│   ├── app.ts                            # express app assembly
│   └── server.ts                         # entrypoint
├── tests/
│   ├── unit/
│   └── integration/
├── .env.example
└── package.json
```

---

## 3. Database design (MongoDB / Mongoose)

### 3.1 Core collections & key fields

**users**

```
_id, name, email (unique), passwordHash, role: ["customer","seller","admin"] (array — supports dual role),
avatarUrl, phone, isEmailVerified, isBanned, addresses: [AddressSchema],
sellerProfile: { storeName, bio, rating, totalSales, payoutDetails } | null,
refreshTokenHash, createdAt, updatedAt
```

**books**

```
_id, title, slug (unique, indexed), author, isbn, description, category: ObjectId(ref Category),
condition: enum["new","like_new","good","fair"], price, discountPrice,
images: [{url, publicId}], stock, sellerId: ObjectId(ref User, indexed),
status: enum["draft","active","sold","removed"] (indexed),
tags: [String], language, publisher, edition, pageCount,
ratingAvg, ratingCount, viewsCount, createdAt, updatedAt
-- text index on {title, author, description, tags}
-- compound index {category:1, status:1, price:1}
```

**categories**

```
_id, name, slug (unique), parentId (ObjectId, nullable — supports subcategories), imageUrl, order
```

**carts**

```
_id, userId (unique, indexed), items: [{ bookId, quantity, priceSnapshot }], updatedAt
```

**orders**

```
_id, orderNumber (unique, indexed), buyerId, items: [{ bookId, sellerId, title, price, quantity, condition }],
shippingAddress, subtotal, shippingFee, tax, total, currency,
status: enum["pending","confirmed","shipped","delivered","cancelled","refunded"] (indexed),
paymentStatus: enum["pending","paid","failed","refunded"], paymentRef,
timeline: [{ status, note, timestamp }], createdAt, updatedAt
-- index {buyerId:1, createdAt:-1}, {"items.sellerId":1, createdAt:-1}
```

**transactions**

```
_id, orderId, sellerId, amount, platformFee, netPayout, status: enum["pending","released","withdrawn"], createdAt
```

**reviews**

```
_id, bookId (indexed), authorId, orderId (proof-of-purchase), rating (1-5), comment, sellerReply, createdAt
-- unique compound index {bookId:1, authorId:1, orderId:1} (one review per purchase)
```

**wishlists**

```
_id, userId (unique, indexed), bookIds: [ObjectId]
```

**notifications**

```
_id, userId (indexed), type, title, body, isRead, meta, createdAt
```

### 3.2 Relationships

- `Book.sellerId → User` (1 seller : many books)
- `Order.items[].bookId → Book`, `Order.items[].sellerId → User` (an order can span multiple sellers — split into per-seller sub-shipments for fulfillment tracking)
- `Review.orderId → Order` enforces proof-of-purchase before reviewing
- `Book.category → Category`, self-referencing `Category.parentId` for subcategories

### 3.3 Indexing strategy

Text index for search (`title`, `author`, `description`, `tags`); compound indexes on filter-heavy fields (`category+status+price`, `sellerId+status`); TTL index on unread session/OTP collections if used. Review index sizes quarterly as data grows — move to Atlas Search if full-text relevance becomes a bottleneck.

---

## 4. REST API surface (high-level)

Base: `/api/v1`. All responses use the envelope:

```json
{
  "success": true,
  "data": {},
  "meta": { "page": 1, "limit": 20, "total": 134 },
  "error": null
}
```

Errors: `{ "success": false, "data": null, "error": { "code": "VALIDATION_ERROR", "message": "...", "details": [] } }`

| Module        | Key endpoints                                                                                                                                        |
| ------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| Auth          | `POST /auth/register`, `/auth/login`, `/auth/refresh`, `/auth/logout`, `/auth/verify-email`, `/auth/forgot-password`, `/auth/reset-password`         |
| Books         | `GET /books` (search/filter/paginate), `GET /books/:slug`, `POST /books` (seller), `PATCH /books/:id`, `DELETE /books/:id`, `GET /books/:id/reviews` |
| Categories    | `GET /categories`, `POST /categories` (admin), `PATCH /categories/:id`                                                                               |
| Cart          | `GET /cart`, `POST /cart/items`, `PATCH /cart/items/:bookId`, `DELETE /cart/items/:bookId`                                                           |
| Orders        | `POST /orders` (checkout), `GET /orders`, `GET /orders/:id`, `PATCH /orders/:id/status` (seller/admin)                                               |
| Payments      | `POST /payments/create-intent`, `POST /payments/webhook`                                                                                             |
| Wishlist      | `GET /wishlist`, `POST /wishlist/:bookId`, `DELETE /wishlist/:bookId`                                                                                |
| Reviews       | `POST /reviews`, `PATCH /reviews/:id`, `DELETE /reviews/:id`                                                                                         |
| Seller        | `GET /seller/dashboard`, `GET /seller/earnings`, `GET /seller/orders`                                                                                |
| Admin         | `GET /admin/users`, `PATCH /admin/users/:id/ban`, `GET /admin/reports`, `PATCH /admin/listings/:id/moderate`                                         |
| Notifications | `GET /notifications`, `PATCH /notifications/:id/read`                                                                                                |

Rate limits: `auth/*` 10 req/min/IP, `books` search 60 req/min/IP, mutating routes 30 req/min/user.

---

## 5. Auth & security

- Access token (JWT, 15 min) in memory/short-lived cookie; refresh token (7–30 days) in httpOnly, `Secure`, `SameSite=Strict` cookie, hashed at rest, rotated on use.
- RBAC middleware reads `role[]` from the verified token; seller-only and admin-only routes check explicitly, never inferred from UI.
- Passwords: bcrypt (cost 12+), never logged.
- Helmet, CORS allow-list (frontend origin only), express-rate-limit + Redis store, Mongo sanitize middleware against NoSQL injection, zod validation on every input, file-type + size validation before Cloudinary upload, CSRF protection on cookie-based state-changing routes.

---

## 6. Payments

Abstract behind a `PaymentProvider` interface (`createIntent`, `verifyWebhook`, `refund`) so Razorpay/Stripe/PayPal can be swapped without touching order logic. Orders move `pending → confirmed` only after webhook-verified payment, never on client-side success callback alone.

---

## 7. Background jobs (BullMQ + Redis)

- Order confirmation email / seller new-order notification
- Abandoned cart reminder (24h)
- Image optimization on upload (resize/webp conversion) before final Cloudinary URL is stored
- Weekly seller earnings digest

## 8. Realtime (Socket.io)

- Order status push to buyer + seller
- New message notification (future chat feature)
- Live "X people viewing this book" (nice-to-have, phase 2)

---

## 9. Non-functional requirements

| Area          | Target                                                                                                                |
| ------------- | --------------------------------------------------------------------------------------------------------------------- |
| Performance   | LCP < 2.5s on landing/listing pages; API p95 < 300ms for reads                                                        |
| Availability  | 99.9% uptime target; health-check endpoint `/healthz` for uptime monitors                                             |
| Scalability   | Stateless API instances behind a load balancer; MongoDB Atlas autoscaling; Redis for shared session/cache state       |
| Caching       | Redis cache for category tree, featured books, popular search queries (TTL 5–15 min)                                  |
| SEO           | SSR/ISR for book detail + listing pages, structured data (schema.org `Product`), sitemap.xml, OG tags                 |
| Accessibility | WCAG 2.1 AA (see DESIGN.md §10)                                                                                       |
| Observability | Structured JSON logs (pino), request tracing IDs, error tracking (Sentry), uptime + APM (e.g. Better Stack / Datadog) |

---

## 10. Testing strategy

- **Unit**: services, utils, validation schemas (Vitest).
- **Integration**: API endpoints against an in-memory/test MongoDB (Supertest + mongodb-memory-server).
- **E2E**: critical paths — register→browse→buy, list-a-book→receive-order (Playwright).
- CI gate: lint + typecheck + unit + integration must pass before merge; E2E runs on a nightly schedule + pre-release.

---

## 11. Deployment & CI/CD

- **Frontend**: Vercel, preview deployments per PR, production on `main` merge.
- **Backend**: Dockerized Express app → Railway/Render/EC2 behind Nginx, PM2 or container orchestration for process management, blue/green or rolling deploy.
- **DB**: MongoDB Atlas (separate dev/staging/prod clusters).
- **CI**: GitHub Actions — `lint → typecheck → test → build → deploy` pipeline, separate workflows for web and api, triggered per path filter.
- **Env management**: `.env.example` committed, real secrets in Vercel/host secret manager, never in repo.

---

## 12. Phased delivery plan

**Phase 1 — Foundation (Week 1–2)**
Monorepo scaffold, design tokens implemented in Tailwind config, auth module (register/login/refresh), user model, base layout + navbar/footer, CI pipeline skeleton.

**Phase 2 — Core marketplace (Week 3–5)**
Book CRUD (seller), category management (admin), book listing/search/filter/detail pages, image upload pipeline, cart.

**Phase 3 — Transactions (Week 6–7)**
Checkout flow, payment provider integration, order lifecycle, order tracking UI, seller order fulfillment dashboard.

**Phase 4 — Trust & engagement (Week 8–9)**
Reviews & ratings, wishlist, notifications (in-app + email), seller earnings/analytics dashboard.

**Phase 5 — Admin & hardening (Week 10–11)**
Admin dashboard (users, listings, categories, reports, CMS for homepage sections), security hardening pass, rate limiting, load testing.

**Phase 6 — Polish & launch (Week 12)**
Accessibility audit, SEO pass, E2E test suite, performance tuning, staging soak test, production deploy.

**Post-launch / Future scope**: AI-based recommendations, book exchange/trade-in, auctions for rare books, in-app chat, subscription/premium seller tier, native mobile app.

---

## 13. Deliverables

Source code (monorepo), deployed staging + production environments, admin dashboard, OpenAPI documentation + Postman collection, this documentation set (`AGENTS.md`, `DESIGN.md`, `IMPLEMENTATION_PLAN.md`), README with local setup instructions.
