# BookFry Multi-Role User Architecture & RBAC Audit

**Document Version**: 1.0.0  
**Audit Date**: September 19, 2026  
**Auditor**: Principal Software & Security Architect  
**Architecture Scope**: User Schema, RBAC Middlewares, Portal Isolation, State Sync, Token Refresh, and Multi-Persona UI Navigation.

---

## 1. Multi-Role Architectural Foundations

Unlike traditional platforms where a user is constrained to a single enum role (`role: 'buyer' | 'seller' | 'admin'`), BookFry treats roles as an additive array:
```typescript
roles: {
  type: [String],
  enum: ['customer', 'seller', 'admin'],
  default: ['customer'],
}
```

### Fundamental Architectural Tenet
**A single user identity can be simultaneously a Customer (Buyer), a Seller, and a Platform Administrator.**
- Every user is born as a `customer`.
- A customer can onboard as a `seller` without creating a separate account, transferring their session, or losing their buyer purchase history, cart, or wishlist.
- An administrator retains their customer rights (can purchase books) and seller rights (can list inventory or test seller tools) while exercising platform-wide administrative controls.

---

## 2. Cross-Role Matrix & Capability Mapping

| Action / Capability | Customer Only | Customer + Seller | Customer + Admin | Customer + Seller + Admin |
| :--- | :---: | :---: | :---: | :---: |
| Browse & Search Catalog | YES | YES | YES | YES |
| Add to Cart & Save Wishlist | YES | YES | YES | YES |
| Checkout & Razorpay Payment | YES | YES | YES | YES |
| Manage Saved Addresses | YES | YES | YES | YES |
| Order History & Invoices | YES | YES | YES | YES |
| List a Book for Sale (`/seller/books/new`) | Redirects to Onboarding | YES | Redirects to Onboarding | YES |
| Manage Seller Inventory (`/seller/books`) | 403 Forbidden | YES | 403 Forbidden | YES |
| View Seller Orders & Shipments | 403 Forbidden | YES | 403 Forbidden | YES |
| Seller Payouts & Settlement Ledger | 403 Forbidden | YES | 403 Forbidden | YES |
| Submit Seller Verification (GST/Aadhaar) | N/A | YES | N/A | YES |
| Access Admin Dashboard (`/admin/dashboard`) | 403 Forbidden | 403 Forbidden | YES | YES |
| Review Pending Seller Verifications | 403 Forbidden | 403 Forbidden | YES | YES |
| Moderate Books & Content | 403 Forbidden | 403 Forbidden | YES | YES |
| User Role Promotion / Ban Controls | 403 Forbidden | 403 Forbidden | YES | YES |
| Edit Homepage CMS Sections | 403 Forbidden | 403 Forbidden | YES | YES |

---

## 3. UI Navigation & Profile Menu Parity (Remediated)

### Prior Bug / Limitation:
The navigation profile dropdown previously evaluated roles with a mutually exclusive ternary:
```tsx
isAdmin ? 'Admin' : isSeller ? 'Seller' : 'Student'
```
This caused a triple-role user to appear *only* as an Admin, hiding their Seller Portal links and confusing user workflows.

### Production Solution Implemented:
1. **Multi-Role Pill Row**: The dropdown header now maps over all active roles, rendering distinct badges:
   - `Admin` (Brand Indigo/Purple badge)
   - `Seller` (Fiery Orange badge)
   - `Student / Buyer` (Deep Navy badge)
2. **Dual-Portal Quick Links**:
   - Users with `admin` see "Admin Control Center" (`/admin/dashboard`).
   - Users with `seller` see "Seller Dashboard" (`/seller/dashboard`).
   - All users retain links to "My Profile", "My Orders", "Saved Addresses", and "Wishlist".
3. **Sidebar Portal Cross-Switching**:
   - In `seller-sidebar.tsx`: Added direct "Admin Portal" button in the footer for sellers who are also admins.
   - In `admin-sidebar.tsx`: Added direct "Seller Hub" button in the footer for admins who are also sellers.

---

## 4. Backend RBAC Verification

The API enforces access via `requireRoles(...allowedRoles)` in `apps/api/src/middlewares/rbac.middleware.ts`:
```typescript
const hasRole = allowedRoles.some((role) => req.user.roles.includes(role));
if (!hasRole) {
  return res.status(403).json({ success: false, message: 'Forbidden' });
}
```
- Verified: Endpoints requiring `seller` accept both `['customer', 'seller']` and `['customer', 'seller', 'admin']`.
- Verified: Endpoints requiring `admin` reject users with only `['customer', 'seller']`.
- Verified: User escalation attacks via `PATCH /users/profile` are sanitized; role mutations are strictly blocked outside admin-authorized routes.

---

## 5. Token Refresh & Role Persistence

When JWT access tokens are refreshed via `POST /auth/refresh-token`:
1. The backend retrieves the up-to-date user record from MongoDB.
2. The new access token encodes the current `roles` array.
3. If an admin promotes a user from customer to seller, the next token refresh or profile re-fetch immediately unlocks the seller portal on the client without requiring relogin.
