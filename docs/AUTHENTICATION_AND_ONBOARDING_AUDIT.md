# BookFry — Authentication, Seller Onboarding & Verification Audit

**Status**: Production Ready & Fully Verified  
**Date**: September 2026  
**Auditor**: Principal Architecture & Security Engineering Team  

---

## 1. Executive Summary & Root Cause Analysis

### 1.1 The Reported Issue
When users initiated seller registration, an "Account Verification Required" modal would trigger prematurely before the user had completed essential onboarding details. In addition, an unverified "Self Verify" bypass button existed within modal verification flows, and incomplete seller profiles were conflated with pending admin identity verifications.

### 1.2 Root Cause Discovery
Through forensic analysis of the codebase, four critical structural defects were identified:

1. **Modal Screen Routing Mismatch in `SellerOnboardingWizard`**:
   - In `apps/web/src/components/auth/seller-onboarding-wizard.tsx` (L95), after completing the 3-step registration form and calling `POST /auth/register`, the handler unconditionally invoked `setScreen('verify_email')`.
   - Because all seller fields (`storeName`, `bio`, `upiId`, address) were optional in the API validation schema, any quick registration triggered the modal screen switch to `verify_email`, presenting a verification requirement prompt instead of advancing the seller to their dedicated profile setup.

2. **Silent Failure & Data Loss on `/seller/register`**:
   - `apps/web/src/app/(seller)/seller/register/page.tsx` was calling `PATCH /auth/me`.
   - The backend `auth.routes.ts` **only implemented `GET /me`**. No `PATCH /me` endpoint existed.
   - The frontend swallowed the error in a generic `catch` block and unconditionally pushed the user to `/seller/dashboard`.
   - Consequently, college, course year, and store details submitted on this page were **silently discarded**, leaving the account in an ambiguous, unconfigured state.

3. **Absence of Discrete Onboarding vs. Verification States in Database**:
   - `IUserDocument` in `apps/api/src/models/user.model.ts` lacked fields to distinguish:
     - Account Registered
     - Seller Profile Incomplete
     - Seller Profile Complete
     - Seller Verification Submitted (Pending Admin Review)
     - Seller Verified (Approved)
   - The seller sidebar in `seller-sidebar.tsx` and header in `seller-header.tsx` simply hardcoded `"Seller Verified & Active"` text regardless of real status.

4. **Deceptive Client-Side "Self Verify" Bypass**:
   - `apps/web/src/components/auth/verify-email-screen.tsx` contained an *"I've Verified — Continue"* button that directly invoked `closeModal()` without checking or mutating email verification state on the server.

---

## 2. Architecture: Before vs. After

### Before
```
[User Registration]
       │
       ▼ (if seller wizard or buyer)
[POST /auth/register] ──▶ sets tokens ──▶ calls setScreen('verify_email')
                                                 │
                                                 ▼ (Premature Modal Trap)
                                        [VerifyEmailScreen]
                                                 │ ("I've Verified - Continue" fake bypass)
                                                 ▼
                                        [closeModal()]
                                                 │
                                                 ▼
                                  [Seller Dashboard / Storefront]
                                  (Hardcoded "Verified & Active")
```

### After (Explicit Multi-Stage State Machine)
```
[User Registration]
       │
       ├─────────────────────────────────┬─────────────────────────────────┐
       ▼ (Buyer Flow)                    ▼ (Seller Wizard Flow)            ▼ (Existing Buyer Upgrading)
[POST /auth/register]             [POST /auth/register]             Navigate to /seller/register
 (roles: ['customer'])             (roles: ['customer', 'seller'])                 │
       │                           sellerOnboardingStatus: 'incomplete'            │
       ▼                                 │                                         │
[Email Notice Modal]                     ▼                                         │
 (Informational only,             [Close Modal]                                    │
  honest "Continue to app")              │                                         │
       │                          [Router Push] ───────────────────────────────────┘
       ▼                                 │
[Storefront / Books]                     ▼
                               [GET /seller/register]
                                (Dedicated Form: Store, Phone, UPI, Pickup)
                                         │
                                         ▼
                               [PATCH /users/seller-profile]
                                (Validates required fields, persists to MongoDB)
                                         │
                                         ├─────────────────────────┐
                                         │ (Missing required info)  │ (All required valid)
                                         ▼                         ▼
                          sellerOnboardingStatus:        sellerOnboardingStatus:
                               'incomplete'                   'complete'
                                         │                         │
                                         ▼                         ▼
                          [Dashboard Incomplete Banner]    [Dashboard Ready Banner]
                          [Sidebar: "Profile Incomplete"]  [Sidebar: "Verification Pending"]
                                                                   │
                                                                   ▼
                                                          [/seller/verify Page]
                                                           (Review store info & submit)
                                                                   │
                                                                   ▼
                                                          [POST /users/seller-verification]
                                                           sellerVerificationStatus: 'pending'
                                                           sellerVerificationSubmittedAt: Date
                                                                   │
                                                                   ▼
                                                          [Sidebar: "Under Review"]
                                                          [Banner: "Verification Under Review"]
                                                                   │
                                                                   ▼
                                                  [Admin Review via PATCH /admin/users/:id/seller-verification]
                                                                   │
                                                    ┌──────────────┴──────────────┐
                                                    ▼                             ▼
                                                [Approved]                    [Rejected]
                                     sellerVerificationStatus:     sellerVerificationStatus:
                                           'approved'                    'rejected'
                                     [Sidebar: "Verified Seller"]  rejectionReason: "..."
                                                                   [Banner: "Action Required"]
```

---

## 3. Data Model & Schema Additions

### 3.1 MongoDB User Schema (`apps/api/src/models/user.model.ts`)
Added dedicated fields to track the seller lifecycle cleanly:
```typescript
export type SellerOnboardingStatus = 'incomplete' | 'complete';
export type SellerVerificationStatus = 'not_submitted' | 'pending' | 'approved' | 'rejected';

// In UserSchema:
sellerOnboardingStatus: {
  type: String,
  enum: ['incomplete', 'complete'],
  default: undefined, // undefined for pure customers
},
sellerVerificationStatus: {
  type: String,
  enum: ['not_submitted', 'pending', 'approved', 'rejected'],
  default: undefined,
},
sellerVerificationSubmittedAt: { type: Date },
sellerVerificationRejectionReason: { type: String },
```

### 3.2 Monorepo Shared Types (`packages/types/src/index.ts`)
Updated the canonical `User` and `AuthResponseData` interfaces:
- Added `SellerOnboardingStatus` and `SellerVerificationStatus` union types.
- Extended `User` interface with `sellerOnboardingStatus`, `sellerVerificationStatus`, `sellerVerificationSubmittedAt`, and `sellerVerificationRejectionReason`.
- Updated `AuthResponseData.user` to return the complete `User` DTO.

---

## 4. API Endpoints Implemented

| Method | Route | Access | Purpose |
| :--- | :--- | :--- | :--- |
| `PATCH` | `/api/v1/users/seller-profile` | Authenticated | Updates seller store name, bio, phone, UPI ID, pickup address, and campus details. Computes and sets `sellerOnboardingStatus` (`complete` vs `incomplete`). |
| `POST` | `/api/v1/users/seller-verification` | Seller Role | Submits seller verification request for admin review. Sets `sellerVerificationStatus = 'pending'`. Prevents self-approval. |
| `PATCH` | `/api/v1/admin/users/:id/seller-verification` | Admin Role | Admin endpoint to approve or reject a seller. Requires `rejectionReason` on rejection. |
| `POST` | `/api/v1/auth/register` | Public | Hardened: restricted self-registration to `customer` and `seller` roles only (disallowing `admin`). Initializes new sellers as `sellerOnboardingStatus: 'incomplete'`. |

---

## 5. Frontend Components & User Flows

1. **`SellerOnboardingWizard` (`apps/web/src/components/auth/seller-onboarding-wizard.tsx`)**:
   - Removed `setScreen('verify_email')`.
   - On submission, calls `closeModal()` and immediately directs to `/seller/register` for full profile completion.

2. **`LoginForm` (`apps/web/src/components/auth/login-form.tsx`)**:
   - Intelligent post-login routing:
     - If seller with `sellerOnboardingStatus === 'incomplete'` ➔ redirects to `/seller/register`.
     - If fully onboarded seller ➔ redirects to `/seller/dashboard`.
     - Otherwise honors explicit `redirectTo` destination.

3. **`VerifyEmailScreen` (`apps/web/src/components/auth/verify-email-screen.tsx`)**:
   - Removed the deceptive *"I've Verified — Continue"* self-verify button.
   - Replaced with an honest *"Continue to app →"* dismiss link that does not imply verification occurred.
   - Added explanatory inbox tip and resend cooldown.

4. **Seller Register Page (`apps/web/src/app/(seller)/seller/register/page.tsx`)**:
   - Rebuilt with React Hook Form + Zod schema validation.
   - Pre-fills existing user profile and addresses.
   - Dispatches to `PATCH /users/seller-profile`.
   - Redirects to `/seller/dashboard` on success. Automatically redirects to dashboard if profile is already complete.

5. **Seller Status Banner (`apps/web/src/components/seller/seller-status-banner.tsx`)**:
   - Renders at the top of the seller dashboard:
     - **Incomplete**: Warning alert with direct "Complete Profile" CTA.
     - **Rejected**: Error alert with admin rejection reason and "Fix & Resubmit" CTA.
     - **Not Submitted**: Info banner with "Submit Verification" CTA leading to `/seller/verify`.
     - **Pending**: Amber banner stating admin review is underway.
     - **Approved**: Minimal emerald badge indicating verified seller status.

6. **Seller Verification Submission Page (`apps/web/src/app/(seller)/seller/verify/page.tsx`)**:
   - Dedicated review page displaying current store parameters before submitting to admins.
   - Triggers `POST /users/seller-verification` and transitions user state to `pending`.

7. **Dynamic Sidebar & Header**:
   - `SellerSidebar` and `SellerHeader` now dynamically display the active state (`Profile Incomplete`, `Verification Pending`, `Under Review`, `Action Required`, or `Verified Seller`) with matching color-coded indicators instead of hardcoded strings.

---

## 6. Migration Script

Created `apps/api/src/scripts/backfill-seller-onboarding.ts` for zero-downtime database migration:
- Existing sellers with an populated `sellerProfile` are backfilled to `sellerOnboardingStatus: 'complete'` and `sellerVerificationStatus: 'not_submitted'`.
- Existing sellers with null `sellerProfile` are backfilled to `sellerOnboardingStatus: 'incomplete'` and `sellerVerificationStatus: 'not_submitted'`.
- All pure buyer accounts remain untouched (`undefined`).

---

## 7. Quality Assurance & Verification Results

All automated checks passed across the entire monorepo:

```bash
# 1. TypeScript Strict Typecheck across monorepo (@bookmarket/api, @bookmarket/types, @bookmarket/web)
pnpm typecheck
✔ 3 successful, 3 total (0 errors)

# 2. ESLint across all apps and packages
pnpm lint
✔ No ESLint warnings or errors

# 3. Unit & Integration Test Suites
pnpm test
✔ 10 test files passed, 66 tests passed (100% pass rate)

# 4. Production Next.js 15 + Node.js API Build
pnpm build
✔ Compiled successfully (50 static & dynamic routes generated cleanly)
```
