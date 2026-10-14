# BookFry Security & Authorization Audit

**Audit Date**: September 27, 2026  
**Auditor**: Principal Security Engineer  
**Scope**: API Boundary Validation, Authentication, RBAC, IDOR Protection, Payment Integrity

---

## 1. Authentication & Session Security

1. **JWT Lifecycle & Secrets**:
   - Access tokens have short lifespans signed with `JWT_ACCESS_SECRET`.
   - Refresh tokens are hashed (`bcryptjs`) before persistence in the database (`refreshTokenHash`).
   - Refresh token cookies use `httpOnly: true`, `sameSite: 'lax'`, and `secure` in production.
2. **Password Security**:
   - Minimum salt rounds: 12 via `bcryptjs`.
   - Client and server enforce password complexity (uppercase, lowercase, number, symbol, min 8 chars).
   - Real-time password strength meter prevents weak passwords.
3. **Session Revocation**:
   - Password reset immediately invalidates `refreshTokenHash`, preventing session continuation on compromised devices.

---

## 2. Role-Based Access Control (RBAC) & Middleware Protection

The system enforces strict multi-role authorization across all routes:

```
[Incoming Request]
       │
       ▼
[requireAuth Middleware] ──── (Invalid / Expired Token) ───► 401 Unauthorized
       │
       ▼
[requireRoles Middleware] ─── (Missing Required Role) ─────► 403 Forbidden
       │
       ▼
[Controller & Service Logic]
       │
       ▼
[Resource Ownership / IDOR Check] ── (Not Owner / Non-Admin) ─► 401 / 403 Forbidden
```

### Verified Protections:
- **Buyer cannot access Seller APIs**: `GET /api/v1/seller/*` strictly rejects buyer accounts with `403 Forbidden`.
- **Buyer cannot access Admin APIs**: `GET /api/v1/admin/*` strictly rejects buyer accounts with `403 Forbidden`.
- **Seller cannot access Admin APIs**: `GET /api/v1/admin/*` strictly rejects seller accounts with `403 Forbidden`.
- **Role Escalation Attempt**: Updating profile details via `PATCH /api/v1/users/profile` cannot escalate roles (e.g. attempting to inject `roles: ['admin']` is stripped by Zod schema validation).

---

## 3. Insecure Direct Object Reference (IDOR) Audit

Every sensitive resource with an identifier was audited:

1. **Order Details (`GET /api/v1/orders/:id`)**:
   - Evaluates: `isAdmin || order.buyerId === userId || order.items.some(it => it.sellerId === userId)`.
   - If a buyer attempts to view another buyer's order, the server rejects with `401 Unauthorized`.
   - If a seller views an order, they receive an isolated projection containing only their own sub-order and items.
2. **Tax Invoice (`GET /api/v1/orders/public/:id`)**:
   - Despite the route naming, ownership validation is strictly enforced.
   - Non-owners and unauthorized buyers attempting to query invoice numbers receive `401 Unauthorized`.
3. **Seller Payout & Earnings (`GET /api/v1/seller/earnings`)**:
   - Scoped strictly to `req.user.id`. A seller cannot view other sellers' earnings or transaction histories.
4. **User Addresses & Profile (`GET /api/v1/users/profile`)**:
   - Scoped strictly to `req.user.id`.

---

## 4. Financial & Payment Tampering Defense

1. **Client Price Authoritativeness**:
   - The frontend checkout payload NEVER dictates prices or totals.
   - Prices are resolved server-side from active `BookListing` database documents.
2. **Payment Intent Verification**:
   - Razorpay / payment order intents are generated using `order.total` calculated by the backend service.
   - In `POST /api/v1/payments/verify`, payment signature verification confirms payment against order amount before marking `order.paymentStatus = 'paid'`.
3. **Double-Spend & Concurrency Protection**:
   - Stock decrements use atomic MongoDB operations (`$subtract` with `{ stock: { $gte: quantity } }`).
   - If two buyers attempt to purchase the last copy simultaneously, the second transaction fails validation safely without overselling.
4. **Webhook Replay Protection**:
   - Webhook processing checks if `order.paymentStatus === 'paid'` and terminates idempotently, preventing duplicate order confirmations or double notifications.
