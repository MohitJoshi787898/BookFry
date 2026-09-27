# Dynamic Seller Access Control & Feature Flag Architecture

This document specifies the technical architecture, security guarantees, database schema, and operational procedures for **BookFry's Dynamic Seller Access Control System**.

---

## 1. Overview & Objective

BookFry provides a digital marketplace for buying, selling, and exchanging textbooks across India (*"क्योंकि.. पढ़ाई रुकनी नहीं चाहिए"*). To allow platform administrators full operational flexibility, **Seller Registration** and **Seller Login** can be independently enabled or disabled dynamically from the Admin Dashboard (`/admin/settings`) backed by MongoDB and enforced at the API layer.

### Core Architectural Distinctions:
1. **Dedicated Seller Registration & Login**:
   - Creating a public commercial seller profile via `/seller/register` or `/register?role=seller`.
   - Dedicated seller sign-in to the seller workspace (`/seller/*`).
   - When disabled: strictly blocked at the backend with `403 Forbidden` (`SELLER_REGISTRATION_DISABLED` / `SELLER_LOGIN_DISABLED`).
2. **Buyer Peer-to-Peer Book Selling**:
   - Buyers can list their personal textbooks anytime at `/sell` (`POST /api/v1/books`).
   - **Remains 100% active and unaffected** by seller registration/login freezes.
3. **Buyer Authentication & Storefront**:
   - Buyers can register, log in, browse, search, add to cart, and checkout with zero restriction.
4. **Super Admin Immunity**:
   - Platform administrators (`admin@bookfry.com` or users with `roles.includes('admin')`) are never blocked from login or management functions, ensuring administrators can manage the platform at all times.
5. **Zero Data Loss**:
   - Existing sellers, their published listings, customer orders, payout balances, and bank accounts are never modified or purged.

---

## 2. System Architecture & Component Flow

```mermaid
flowchart TD
    AdminUI["Admin Settings Dashboard (/admin/settings)"] -->|PUT /api/v1/admin/settings| AdminService["AdminService.updatePlatformSettings"]
    AdminService -->|Writes Audit Log + Sets Flags| DB[("MongoDB (PlatformSettings)")]
    AdminService -->|SellerAccessPolicy.invalidateCache()| Policy["SellerAccessPolicy (Memory Cache)"]

    ClientPublic["Web Client (usePlatformSettings)"] -->|GET /api/v1/settings/public| SettingsCtrl["SettingsController.getPublicSettings"]
    SettingsCtrl --> Policy

    BuyerRegister["POST /api/v1/auth/register (role=customer)"] --> AuthCtrl["AuthController.register"]
    AuthCtrl -->|Permitted| DBUsers[("MongoDB (Users)")]

    SellerRegister["POST /api/v1/auth/register (role=seller)"] --> AuthCtrl
    AuthCtrl -->|Queries Policy| Policy
    Policy -->|Disabled? 403 Forbidden| ErrorReg["SELLER_REGISTRATION_DISABLED"]

    UserLogin["POST /api/v1/auth/login"] --> AuthService["AuthService.login"]
    AuthService -->|Is Seller & Not Admin? Queries Policy| Policy
    Policy -->|Disabled? 403 Forbidden| ErrorLogin["SELLER_LOGIN_DISABLED"]

    SellerPortal["GET/POST /api/v1/seller/*"] --> RouteGuard["requireSellerPortalAccess Middleware"]
    RouteGuard -->|Disabled & Not Admin? 403| ErrorPortal["SELLER_LOGIN_DISABLED"]
```

---

## 3. Database Schema & Audit Logging

### PlatformSettings Document (`apps/api/src/models/platform-settings.model.ts`)
```typescript
{
  sellerRegistrationEnabled: boolean; // default: false
  sellerLoginEnabled: boolean;        // default: false
  maintenanceMode: boolean;
  commissionRate: number;
  featuredListingFee: number;
  supportEmail: string;
  supportPhone: string;
  auditLog: [
    {
      key: string;              // e.g. 'sellerRegistrationEnabled' | 'sellerLoginEnabled'
      oldValue: boolean;
      newValue: boolean;
      changedBy: string;        // Admin user ID
      changedAt: Date;
    }
  ]
}
```

Every modification appends an immutable entry to `auditLog`, giving the operations team an exact chronological audit trail of which admin toggled the setting, the before/after values, and the exact timestamp.

---

## 4. Backend Policy Layer (`SellerAccessPolicy`)

Located at `apps/api/src/modules/admin/seller-access.policy.ts`:
- **In-Memory Cache (TTL: 15s)**: Eliminates duplicate MongoDB queries during high-concurrency authentication and registration bursts.
- **Immediate Invalidation**: The cache is immediately cleared via `SellerAccessPolicy.invalidateCache()` whenever an administrator saves settings changes.
- **Safe Defaults**: If no settings document exists yet in a fresh cluster, registration and login default safely to `false` without crashing.

---

## 5. Security & Enforcement Points

| Surface | File | Enforcement Logic |
| :--- | :--- | :--- |
| **Public Registration** | `apps/api/src/modules/auth/auth.controller.ts` | If `roles.includes('seller')`, checks `isSellerRegistrationEnabled()`. If false, rejects with `ForbiddenError('SELLER_REGISTRATION_DISABLED')`. |
| **Authentication** | `apps/api/src/modules/auth/auth.service.ts` | If user is seller (`roles.includes('seller')`) and NOT admin, checks `isSellerLoginEnabled()`. If false, rejects with `ForbiddenError('SELLER_LOGIN_DISABLED')`. |
| **Seller Portal APIs** | `apps/api/src/modules/seller/seller.routes.ts` | `requireSellerPortalAccess` middleware blocks `/api/v1/seller/*` calls if `sellerLoginEnabled` is false (admins exempt). |
| **Public Settings API** | `apps/api/src/modules/settings/settings.routes.ts` | `GET /api/v1/settings/public` exposes read-only safe flags (`sellerRegistrationEnabled`, `sellerLoginEnabled`) without authentication. |

---

## 6. Frontend Integration & UX Experience

1. **Platform Settings Hook (`usePlatformSettings`)**:
   - TanStack Query hook querying `/api/v1/settings/public` with 30s `staleTime`.
2. **Registration Page (`/register`)**:
   - When seller registration is disabled, role selector tabs are hidden and the form defaults to Buyer Registration.
   - If accessed via `?role=seller`, an alert informs the user that seller registration is paused and directs them to register as a buyer.
3. **Seller Landing Page (`/seller/register`)**:
   - Unauthenticated visitors see a friendly "Seller Registration Paused" notice with a button to browse or register as a buyer.
   - Authenticated buyers see the `BuyerUpgradeForm`, allowing them to upgrade when permitted.
4. **Auth Modal (`auth-modal.tsx`)**:
   - If seller registration is disabled, any request to switch to `seller_signup` automatically falls back to `signup` (buyer).
5. **Login Form (`login-form.tsx`)**:
   - Seller portal links are hidden when seller registration is disabled; instead, a direct "Sell used books on BookFry" link points to `/sell`.
6. **Navigation Elements**:
   - `navbar-profile-menu.tsx`, `navbar-mobile-drawer.tsx`, `buyer-sidebar.tsx`, `buyer-mobile-drawer.tsx`, `dashboard-user-menu.tsx`, and `mobile-account-drawer.tsx` dynamically hide "Seller Hub" and "Become a Campus Seller" when disabled, while always allowing administrators access.
7. **Admin Dashboard (`/admin/settings`)**:
   - Dedicated "Seller Access & Registration" card with switch toggles.
   - Contextual confirmation dialog with clear warnings before toggles are applied.
   - Live audit history table displaying the last 10 setting updates with user IDs and timestamps.

---

## 7. Verification & Testing

Unit tests in `apps/api/tests/unit/seller-access-control.test.ts` verify:
1. `SellerAccessPolicy` returns default values (`false`) on fresh systems.
2. In-memory caching works and invalidation forces live database re-queries.
3. Buyer registration succeeds even when seller registration is disabled.
4. Seller registration is rejected with `SELLER_REGISTRATION_DISABLED` (403).
5. Buyer login succeeds even when seller login is disabled.
6. Seller login is rejected with `SELLER_LOGIN_DISABLED` (403).
7. Admin login is **always permitted** regardless of seller login state.

Run tests:
```bash
pnpm --filter @bookmarket/api test tests/unit/seller-access-control.test.ts
```
