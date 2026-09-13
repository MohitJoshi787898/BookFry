# BookFry — Buyer vs Seller Registration, Role Architecture & Onboarding Audit

**Document Version**: 1.0.0  
**Author**: Principal Product Engineer, Principal UX Architect & Senior Full-Stack Authentication Architect  
**Classification**: Mandatory Architectural Specification & Production Source of Truth  
**Date**: September 2026  

---

## Executive Summary & Core Invariant

In a high-trust, two-sided peer-to-peer textbook marketplace like **BookFry**, treating **Buyer** and **Seller** registration identically is an anti-pattern that leads to high drop-off for buyers, severe operational confusion for sellers, and security vulnerabilities around role verification. 

At the same time, splitting buyers and sellers into two disconnected authentication silos or duplicate database entities introduces database fragmentation, session collisions, and poor UX for sellers who also want to buy textbooks for their own courses.

**BookFry's Canonical Architecture Invariant**:
> **A single unified account identity (`UserModel`) possesses multi-role capabilities (`roles: UserRole[]`).**
> - Every user possesses 'customer' role by default.
> - A seller possesses `roles: ['customer', 'seller']`.
> - An existing Buyer becomes a Seller by **upgrading** their existing account via profile completion (`PATCH /users/seller-profile`), never by creating a duplicate account.
> - Sellers can purchase books, add items to cart, and checkout seamlessly without account switching.
> - Email verification (`isEmailVerified`), Seller Profile Onboarding (`sellerOnboardingStatus`), and Seller Verification (`sellerVerificationStatus`) are **three distinct, non-overlapping lifecycles**.
> - Self-verification is physically impossible on the backend; only administrators can grant 'approved' verification status.

---

## 1. Existing Architecture & Codebase Trace

### Database Model (`apps/api/src/models/user.model.ts`)
- The user document stores:
  - `roles`: `UserRole[]` ('customer' | 'seller' | 'admin'), defaults to ['customer'].
  - `isEmailVerified`: boolean, defaults to false. Verified via 6-digit Redis OTP.
  - `sellerProfile`: Embedded sub-document containing storeName, bio, rating, totalSales, payoutDetails (upiId, accountNumber, ifscCode, accountName).
  - `sellerOnboardingStatus`: 'incomplete' | 'complete'.
  - `sellerVerificationStatus`: 'not_submitted' | 'pending' | 'approved' | 'rejected'.
  - `sellerVerificationSubmittedAt`: Date.
  - `sellerVerificationRejectionReason`: string.
  - `addresses`: Array of shipping/pickup addresses.

### Backend Endpoints
- `POST /api/v1/auth/register`: Public registration endpoint. Accepts roles (restricted to ['customer'] or ['customer', 'seller']). Creates user, issues JWT tokens (accessToken 15m, refreshToken 7d in httpOnly cookie), and dispatches email verification OTP.
- `PATCH /api/v1/users/seller-profile`: Authenticated endpoint allowing any customer to configure their store identity, phone, UPI ID, and pickup address. Automatically appends 'seller' to user.roles and computes sellerOnboardingStatus.
- `POST /api/v1/users/seller-verification`: Authenticated endpoint for sellers with sellerOnboardingStatus: 'complete' to transition sellerVerificationStatus: 'not_submitted' -> 'pending'.
- `PATCH /api/v1/admin/sellers/:id/verification`: Admin-only endpoint to set sellerVerificationStatus to 'approved' or 'rejected' with mandatory reason.

### Frontend Surfaces
- Standalone `/register`: Buyer registration page.
- Standalone `/seller/register`: Seller store onboarding page.
- Standalone `/seller/verify`: Seller verification status & submission page.
- Global `AuthModal`: Zustand-driven single-window modal (signup, seller_signup, verify_email, login, forgot_password, reset_password).

---

## 2. Current Problems Identified & Friction Points

1. **Lack of Clear Role Selection at Entry**: The standalone /register page primarily showed a buyer form with a small footer callout for sellers, leaving new campus sellers confused about where to start.
2. **Unauthenticated Access to /seller/register**: When an unauthenticated seller arrived at /seller/register, the page prompted 'Sign In to Complete Your Seller Setup', which opened the login modal instead of a dedicated seller registration flow.
3. **Existing Buyer Ambiguity**: When a registered buyer clicked 'Sell Books', they were unclear whether they needed a new account or could reuse their existing credentials.
4. **Duplicate Email Confusion**: If an existing buyer tried to register again as a seller on /register, they were met with a generic error rather than an intelligent prompt to sign in and upgrade their profile.
5. **Mobile Viewport Squeezing**: Long forms on mobile lacked clear multi-step progress and thumb-friendly touch targets.

---

## 3. Buyer Registration Flow

### Key Principles for Buyer Registration:
- **Zero Friction**: Maximum 3 inputs (name, email, password) + Terms checkbox.
- **No Extraneous Requirements**: Never ask buyers for store name, phone, bank/UPI, or seller agreements.
- **Conversion-First**: Highlight savings (up to 80% off) and safety guarantees (100% Escrow).

---

## 4. Seller Registration Flow

- **Step 1: Credentials** (Name, Email, Mobile, Password).
- **Step 2: Store Identity** (Store Name, College, Bio).
- **Step 3: Location & Instant Payout** (UPI ID, GPS/Pickup Address).
- Results in `roles: ['customer', 'seller']` and `sellerOnboardingStatus: 'complete'`.

---

## 5. Role Architecture & Multi-Role Invariants

### Invariants:
1. Every authenticated user has 'customer'.
2. A seller has ['customer', 'seller'].
3. An admin has ['customer', 'seller', 'admin'].
4. Role permissions are evaluated via array inclusion (roles.includes('seller')).
5. Role escalations to 'admin' are strictly forbidden through public registration or profile update endpoints.

---

## 6. Seller Onboarding State Machine

The operational readiness of a seller is tracked via `sellerOnboardingStatus`:
- 'incomplete': Missing required storeName, phone, or upiId.
- 'complete': All required store identity and payout details provided.

---

## 7. Verification Separation: Three Independent Lifecycles

| Dimension | 1. Email Verification | 2. Seller Profile Onboarding | 3. Seller Verification |
| :--- | :--- | :--- | :--- |
| **Field** | isEmailVerified: boolean | sellerOnboardingStatus: 'incomplete' / 'complete' | sellerVerificationStatus: 'not_submitted' / 'pending' / 'approved' / 'rejected' |
| **Purpose** | Identity security & anti-bot protection | Operational readiness (store & payout details) | Marketplace trust & quality seal for student buyers |
| **Trigger** | Account registration OTP | Filling required seller profile fields | Explicit seller submission via POST /users/seller-verification |
| **Authority** | Automated via Redis OTP | Server business logic rule | **Platform Administrator Only** |
| **Blocks** | Sensitive account changes | Book listing publication | Verified seller badge display |

---

## 8. Admin Approval & Rejection Recovery

- Admin reviews via `PATCH /admin/sellers/:id/verification`.
- When rejected, `sellerVerificationRejectionReason` provides actionable guidance to the seller.
- The seller dashboard dynamically displays an alert banner with the reason and a direct 'Fix & Resubmit' link.

---

## 9. Existing Buyer -> Seller Upgrade Flow

When an existing Buyer visits `/seller/register`:
1. The system checks `isAuthenticated`.
2. If already a seller with onboarding 'complete', redirects to dashboard.
3. If customer only, UI displays: 'Welcome, Rahul! Complete your store details to start selling textbooks.'
4. Pre-fills name and email. Requests only storeName, phone, and upiId.
5. Submits to `PATCH /users/seller-profile`.
6. Backend appends 'seller' to roles and marks sellerOnboardingStatus: 'complete'.

---

## 10. Existing Seller -> Buyer Behavior

Because every seller retains the 'customer' role:
- Sellers can browse books on /books.
- Sellers can add books to their cart (POST /cart/items).
- Sellers can participate in BookFry book exchanges.
- Order history for purchases appears in the Buyer account view, while book listings appear in the Seller Hub.

---

## 11. Authentication, JWT Session & Refresh Token Lifecycle

- Access Token: Short-lived (15 minutes).
- Refresh Token: Long-lived (7 days) in httpOnly cookie.
- Single-Flight Refresh: `apiClient` executes a single-flight mutex refresh so parallel requests never trigger redundant refresh calls.
- Session Persistence: On reload, frontend queries /auth/me to refresh user details and active roles.

---

## 12. Security Architecture

1. No Self-Verification: The client has no API to set sellerVerificationStatus: 'approved'.
2. Role Escalation Defense: auth.validation.ts and users.service.ts prevent unauthorized roles.
3. Password Security: Hashed using bcryptjs with 12 salt rounds.
4. Anti-Enumeration: Generic responses for forgot password.
5. Rate Limiting: Auth endpoints protected by Redis rate limiting.

---

## 13. Frontend Architecture

- Next.js 15 App Router: Standalone routes /register, /seller/register, /seller/verify, /seller/dashboard.
- Zustand Stores: useAuthStore, useAuthModalStore.
- TanStack Query: Server-state synchronization.
- Shadcn/ui + Tailwind CSS: 100% compliant with BookFry tokens in global.css.

---

## 14. Backend Layering Architecture

Route -> Controller -> Service -> Repository -> Model.

---

## 15. Final UX Architecture & Layouts

- Standalone /register: Dual-Mode Selector Tabs (Buy Books vs Sell Books).
- Standalone /seller/register: Dual-State Engine (New registration wizard vs Buyer upgrade).
- GPS Location Autofill: One-click browser geolocation with reverse geocoding via Nominatim.

---

## 16. Formal State Machine Table

| Current Roles | Onboarding Status | Verification Status | Next Available Actions | Permitted Routes |
| :--- | :--- | :--- | :--- | :--- |
| ['customer'] | undefined | undefined | Buy books, become seller | /books, /cart, /seller/register |
| ['customer', 'seller'] | incomplete | not_submitted | Complete store profile | /seller/register, /seller/dashboard |
| ['customer', 'seller'] | complete | not_submitted | List books, submit verification | /seller/dashboard, /seller/verify |
| ['customer', 'seller'] | complete | pending | Wait for admin review | /seller/dashboard |
| ['customer', 'seller'] | complete | approved | Full verified marketplace activity | /seller/dashboard |
| ['customer', 'seller'] | complete | rejected | Update profile and resubmit | /seller/dashboard, /seller/register, /seller/verify |

---

## 17. Edge Cases & Error Handling

1. Email Conflict on Register: 409 Conflict with 'Sign In Instead' link.
2. Incomplete Seller trying to list book: 400 Validation Error.
3. User submits verification before onboarding complete: 400 Validation Error.
4. Offline GPS on Mobile: Graceful fallback to manual input.
5. Session Expiry during Onboarding: Resumable from user profile.

---

## 18. Automated Test Matrix (20 Production Scenarios)

1. test_buyer_registration_minimal_fields
2. test_seller_registration_complete
3. test_seller_registration_incomplete
4. test_incomplete_seller_profile_completion
5. test_existing_buyer_upgrade_to_seller
6. test_prevention_of_duplicate_account_creation
7. test_seller_can_purchase_books
8. test_forbid_admin_self_registration
9. test_forbid_role_escalation_via_profile
10. test_prevent_verification_submission_when_incomplete
11. test_successful_verification_submission
12. test_prevent_seller_self_verification
13. test_admin_approves_seller_verification
14. test_admin_rejects_seller_verification_with_reason
15. test_seller_resubmission_after_rejection
16. test_duplicate_email_conflict_handling
17. test_email_verification_otp_lifecycle
18. test_password_reset_invalidates_refresh_token
19. test_token_refresh_preserves_roles
20. test_session_persistence_and_sync

---

## 19. Remaining Product Decisions & Recommendations

1. Mandatory vs Optional Seller Verification Before Listing: Allow immediate listing with 'New Seller' badge; show green verified badge upon admin approval.
2. Student Identity Verification (Phase 4): Fast-track badge for university email or ID upload.
3. Escrow Hold on First 3 Payouts: 24h post-delivery safety hold.
