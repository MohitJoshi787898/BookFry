# BookFry End-to-End Test Matrix & Verification Coverage

**Auditor**: Principal QA Architect & Reliability Lead  
**Scope**: All Roles (Guest, Customer, Seller, Admin) across 44 Verification Domains  
**Status**: VERIFIED & PRODUCTION READY

---

## 1. Authentication & Security Matrix

| ID | Test Scenario | Actor | Pre-Conditions | Execution Steps | Expected Outcome | Status |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **SEC-01** | User Registration with 6-digit OTP | Guest | Valid email format | Submit name, email, password; input OTP from email/redis | User record created, `isEmailVerified: true`, JWT tokens issued | **PASS** |
| **SEC-02** | Expired / Invalid OTP Verification | Guest | OTP requested > 10m ago or invalid code | Submit incorrect OTP or after 10m expiration | Error 400 `INVALID_OR_EXPIRED_OTP`, user remains unverified | **PASS** |
| **SEC-03** | Banned User Token Refresh Rejection | Banned User | User marked `isBanned: true` | Call `POST /api/v1/auth/refresh` with valid refresh cookie/token | 401 Unauthorized `ACCOUNT_BANNED`, refresh token invalidated in DB | **PASS** |
| **SEC-04** | Seller Deactivation on Ban | Admin | Seller with active listings | Admin triggers `PATCH /api/v1/admin/users/:id/ban` | Seller listings updated to `archived`, omitted from public search | **PASS** |
| **SEC-05** | Role Escalation Prevention | Customer | Customer JWT | Attempt `GET /api/v1/admin/users` or `PATCH /api/v1/admin/settings` | 403 Forbidden, request rejected by `requireRole('admin')` | **PASS** |
| **SEC-06** | Password Reset via 6-Digit OTP | Customer | Registered account | Request reset OTP, enter OTP + new strong password | Password updated with bcrypt salt 12, previous sessions terminated | **PASS** |

---

## 2. Catalog, ISBN & Listings Matrix

| ID | Test Scenario | Actor | Pre-Conditions | Execution Steps | Expected Outcome | Status |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **CAT-01** | ISBN Hyphen Normalization | Seller | Listing new book | Enter `978-0-13-235088-4` in `/sell` form | Hyphens stripped to `9780132350884`, metadata auto-fetched | **PASS** |
| **CAT-02** | Catalog Deduplication | Seller A & B | Both list same ISBN | Both submit listings with same ISBN | 1 `BookCatalog` document created; 2 distinct `BookListing` records | **PASS** |
| **CAT-03** | Hyphenated ISBN Search in Seller Dashboard | Seller | Existing listings with ISBN | Search `978-0-13` in `/seller/listings` | Matching listings rendered without regex failure | **PASS** |
| **CAT-04** | Admin Listing Moderation Notification | Admin | Listing with `pending_approval` | Admin approves or rejects with reason | Status updated, in-app notification + transactional email sent | **PASS** |
| **CAT-05** | Negative Price & Stock Guard | Seller | Listing form | Submit price `< 0` or stock `< 0` | Zod validation error blocks submission | **PASS** |

---

## 3. Financial, Taxation & Multi-Seller Orders Matrix

| ID | Test Scenario | Actor | Pre-Conditions | Execution Steps | Expected Outcome | Status |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **FIN-01** | New Book Order Taxation | Buyer | Cart with 1 New Book (₹500) | Checkout | 8% GST (₹40.00), total = ₹540, seller payout = ₹450 (10% platform fee) | **PASS** |
| **FIN-02** | Used Book Order 0% GST & 0% Fee | Buyer | Cart with 1 Used Book (₹300) | Checkout | 0% GST (₹0.00 Exempt), total = ₹300, seller payout = ₹300 (100% net) | **PASS** |
| **FIN-03** | Mixed Order Multi-Seller Decomposition | Buyer | Cart: Seller A New (₹500), Seller B Used (₹200) | Place order | 2 SubOrders created: SubOrder A has ₹40 tax & ₹450 payout; SubOrder B has ₹0 tax & ₹200 payout | **PASS** |
| **FIN-04** | Free Shipping Threshold | Buyer | Subtotal > ₹499 vs < ₹499 | Checkout with ₹500 vs ₹400 | ₹0 shipping for > ₹499; ₹49 shipping for ≤ ₹499 | **PASS** |
| **FIN-05** | Concurrent Stock Lock Protection | 2 Buyers | 1 unit remaining in stock | Both click Pay simultaneously | 1st succeeds atomically, 2nd receives `Insufficient stock` error; 0 oversell | **PASS** |
| **FIN-06** | Verified Payment Signature & Invoicing | Buyer | Order created | Verify Razorpay HMAC signature | Order marked `paid`, Transaction records generated, GST tax invoice accessible | **PASS** |
| **FIN-07** | Public Invoice Verification & Print | Buyer/Guest | Paid order ID | Access `/invoices/:id` | Correct items, CGST/SGST or 0% Exempt notice, printable PDF action | **PASS** |

---

## 4. Real-time Communications & UX Matrix

| ID | Test Scenario | Actor | Pre-Conditions | Execution Steps | Expected Outcome | Status |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **COM-01** | Used Book Direct Request | Buyer | Active used book listing | Click "Contact Seller" & submit request | Seller notified via SSE & Email; buyer phone masked until acceptance | **PASS** |
| **COM-02** | Request Acceptance & Contact Unlock | Seller | Pending used book request | Seller clicks "Accept Request" | Buyer notified, WhatsApp contact details unlocked for peer handover | **PASS** |
| **COM-03** | SSE Real-time Notification Stream | User | Active session | Receive order update or moderation alert | Notification delivered via SSE stream without page refresh | **PASS** |
| **COM-04** | Responsive Layout (320px–1536px) | Any | Mobile, tablet, desktop | Resize viewport across all breakpoints | Fluid layout, touch targets ≥ 44px, horizontal overflow = 0 | **PASS** |
| **COM-05** | Light & Dark Mode Token Compliance | Any | System/User theme switch | Toggle between light and dark themes | CSS variables seamlessly adapt with no illegible un-themed text | **PASS** |
| **COM-06** | 8-State UI Coverage | Any | Slow connection, 404, empty search | Trigger loading, empty, error, offline | Skeleton loaders match layout; empty states have action CTAs; retry triggers work | **PASS** |
