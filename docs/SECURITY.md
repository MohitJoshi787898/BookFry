# Security Posture & Safeguards Inventory

---

## 1. Authentication & Token Security Architecture

### Token Lifecycle & Secret Key Isolation
- **Access Tokens**: Short-lived JSON Web Tokens (15-minute expiration) signed using `JWT_ACCESS_SECRET`. Transmitted via standard `Authorization: Bearer <token>` HTTP headers.
- **Refresh Tokens**: Long-lived JSON Web Tokens (7-day expiration) signed using `JWT_REFRESH_SECRET`. Transmitted exclusively via secure `httpOnly`, `SameSite=Lax` cookies to mitigate XSS script access risk.
- **Token Hashing**: Refresh tokens stored in the database are hashed (`refreshTokenHash` on `UserModel`) to prevent token theft in the event of database leaks.

### Password Security
- Passwords are hashed prior to persistence using `bcryptjs` with **12 salt rounds**.
- Plaintext passwords are never logged, emitted in API responses, or returned in Mongoose queries (`select('-passwordHash')` enforced in user endpoints).

---

## 2. RBAC & API Endpoint Middleware Coverage

Role-Based Access Control is enforced at the router boundary using Express middleware (`auth.middleware.ts` and `rbac.middleware.ts`):

```ts
// Example Admin Route Protection (apps/api/src/modules/admin/admin.routes.ts)
router.use(requireAuth, requireRoles(['admin']));
```

### Authorization Coverage Matrix

| Route Namespace | Authentication Required | Roles Enforced | Middleware Implementation Status |
| :--- | :--- | :--- | :--- |
| `/api/v1/auth/me`, `/logout` | **Yes** | Any Authenticated User | Verified (`requireAuth`) |
| `/api/v1/cart/*` | **Yes** | Any Authenticated User | Verified (`requireAuth`) |
| `/api/v1/orders/my-orders` | **Yes** | `customer`, `seller`, `admin` | Verified (`requireAuth`) |
| `/api/v1/orders/:id/cancel` | **Yes** | Buyer / Order Owner | Verified (`requireAuth` + ID Check) |
| `/api/v1/seller/*` | **Yes** | `seller`, `admin` | Verified (`requireAuth`, `requireRoles(['seller', 'admin'])`) |
| `/api/v1/users/seller-payout` | **Yes** | `seller`, `admin` | Verified (`requireAuth`, `requireRoles(['seller', 'admin'])`) |
| `/api/v1/admin/*` | **Yes** | `admin` | Verified (`requireAuth`, `requireRoles(['admin'])`) |
| `/api/v1/admin/queues/*` | **Yes** | `admin` | Verified (`requireAuth`, `requireRoles(['admin'])`) |

---

## 3. Input Validation & Defense Against Attacks

### Input Validation (Zod Schemas)
- All mutating incoming payloads (`body`, `params`, `query`) are validated at API entry boundaries via `validate.middleware.ts` using `zod` schemas.
- Invalid types, unexpected fields, or out-of-range numbers trigger early `400 Bad Request` responses before reaching controllers or services.

### Injection & NoSQL Security
- Mongoose schemas enforce strict type casting (`String`, `Number`, `ObjectId`).
- Input strings are sanitized to eliminate MongoDB query operator injection (e.g. `{ "$gt": "" }`).

### Cross-Site Scripting (XSS) & Header Security
- Next.js sanitizes React DOM output by default against reflected XSS.
- Sensitive auth refresh tokens are stored in `httpOnly` cookies, preventing client JS `document.cookie` extraction.

---

## 4. Security Recommendations & Operational Gaps

1. **Rate Limiting Enforcement**: `rateLimiter.middleware.ts` uses `express-rate-limit`. Ensure rate limiting is globally mounted on `/api/v1/auth/login` and `/api/v1/auth/forgot-password` to prevent brute-force credential stuffing.
2. **Webhook Signature Verification**: Webhook handler `PaymentsController.handleWebhook()` verifies Razorpay signature against `RAZORPAY_WEBHOOK_SECRET`. Webhook idempotency should be recorded in a dedicated collection to guard against duplicate event replay attacks.
3. **File Upload MIME Magic-Number Validation**: Image upload endpoints validate file extensions; server-side magic number byte header checking should be added prior to Cloudinary buffer dispatch.
