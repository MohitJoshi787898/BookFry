# BookFry Authenticated Dashboard Navigation & Shell Architecture

## 1. Executive Summary & Core Mission

This document defines the unified, production-grade architecture governing the authenticated dashboard navigation experience across **Admin**, **Seller**, and **Buyer** environments in BookFry.

The dashboard navigation system is engineered as an **Application Shell Workspace** that guarantees:
- **Zero Mock Data**: Strict reliance on authenticated user sessions and real database profiles (`/auth/me`).
- **Single Source of Truth**: Reusable role-aware navigation primitives instead of redundant, divergent headers.
- **Real-Time Notification Synchronization**: Seamless integration between TanStack Query and Server-Sent Events (SSE) `/notifications/stream`.
- **Safe Session Invalidation**: Complete logout protocol with accessible confirmation dialog, token revocation, cookie removal, and query cache clearance.
- **Native Mobile Experience**: Touch-friendly bottom sheets (<768px) with accessible navigation tiles, responsive drawer triggers, and safe-area padding.
- **Design Token Compliance**: Full light/dark mode support using BookFry semantic tokens without hardcoded hex values.

---

## 2. Component Hierarchy & Workspace Shell Architecture

The dashboard experience is built as a clean, hierarchical application shell:

```
DashboardLayout (Admin / Seller / Buyer / Vendor)
├── Left Collapsible Navigation Sidebar (Desktop & Tablet)
└── Workspace Viewport
    ├── DashboardHeader (Unified Application Shell Header)
    │   ├── Brand & Context Badge (Mobile mascot link / Desktop role context)
    │   ├── Search Trigger (⌘K command palette)
    │   ├── Role Action Slot (e.g. "+ List Book", "Cart", "Browse Books", "Storefront")
    │   ├── DashboardNotificationsMenu (Real unread count badge + Desktop popover + Mobile trigger)
    │   └── DashboardUserMenu (Real avatar + User name + Role badge + Desktop dropdown + Mobile trigger)
    ├── Main Page Content (<main>)
    ├── Mobile Notifications Bottom Sheet (MobileNotificationsDrawer)
    ├── Mobile Account Bottom Sheet (MobileAccountDrawer)
    └── Native Mobile Bottom Navigation Bar (Primary quick tabs + "All Tools" drawer)
```

---

## 3. Real User Source of Truth (`useCurrentUser`)

All user state across dashboards is managed by the `useCurrentUser()` hook (`apps/web/src/hooks/use-current-user.ts`):

1. **Instant Hydration**:
   - Reads directly from Zustand `useAuthStore` (`user`, `isAuthenticated`).
   - Ensures **zero UI flicker** or placeholder flashing on route transitions.
2. **Background Database Profile Sync**:
   - TanStack Query queries `['auth-me']` against `GET /api/v1/auth/me`.
   - Stale time set to 5 minutes; updates `useAuthStore` on fresh payloads.
3. **Safe Initials & Fallback Calculation**:
   - `getSafeInitials(name, email)` parses multi-word full names into initials (e.g., `"Mohit Joshi"` &rarr; `"MJ"`).
   - Single-word names take the first two characters.
   - Fallback safely defers to email prefix or `"U"`.
   - Never outputs `"undefined"`, `"null"`, or empty strings.
4. **Role Context Resolution**:
   - `isAdmin`: User roles contain `'admin'`.
   - `isSeller`: User roles contain `'seller'`.
   - `isBuyer`: Authenticated customer.
   - Contextual role labels reflect seller onboarding and admin verification states:
     - `'Super Admin'`
     - `'Verified Seller'` (when `sellerVerificationStatus === 'approved'`)
     - `'Verification Pending'` (when `sellerVerificationStatus === 'pending'`)
     - `'Campus Seller'`
     - `'Student Member'`

---

## 4. Notifications Architecture & Real-Time SSE Sync

BookFry implements a unified, server-backed notification pipeline:

### 4.1. Backend Endpoints (`apps/api/src/modules/notifications`)
- `GET /api/v1/notifications`: Returns newest-first notifications list for the authenticated user.
- `GET /api/v1/notifications/unread-count`: Returns `{ count: number }` of unread alerts.
- `PATCH /api/v1/notifications/:id/read`: Marks a specific notification as read.
- `PATCH /api/v1/notifications/read-all`: Atomically updates all unread notifications to `isRead: true` for the user.
- `GET /api/v1/notifications/stream`: Live Server-Sent Events (SSE) connection authenticated via bearer token or `?token=` query param.

### 4.2. Frontend State Management (`useNotifications`)
- `apps/web/src/hooks/use-notifications.ts` manages queries `['notifications']` and `['notifications', 'unread-count']`.
- Live event integration (`useLiveEvents` in `Providers`):
  - When backend emits `notification:new` over SSE, `queryClient.invalidateQueries` is triggered for both query keys.
  - Automatically updates unread badges and popover lists across the entire application without page reloads.
  - Emits the BookFry mascot info toast for immediate visibility.
- Optimistic cache updates on `markAsRead` and `markAllRead` for zero-lag UI feedback.

---

## 5. Logout & Cache Eviction Protocol

Logout is an audited, destructive security operation executed through `LogoutConfirmDialog`:

```
User Clicks "Sign Out"
          │
          ▼
Logout Confirmation Modal (Accessible BookFry Dialog)
          │
          ├─► Cancel: Dismisses dialog, maintains session
          │
          └─► Confirm:
                1. POST /api/v1/auth/logout (Revokes DB refresh token & clears httpOnly cookie)
                2. useAuthStore.clearAuth() (Clears user, token, & 'bookmarket_logged_in' cookie)
                3. queryClient.clear() (Evicts sensitive cached queries from memory)
                4. toast.success("You're signed out successfully.", { title: 'Signed Out' })
                5. router.push('/') & router.refresh() (Redirects to public marketplace)
```

---

## 6. Role-Aware Navigation Matrices

The `DashboardUserMenu` and `MobileAccountDrawer` dynamically configure navigation based on the active role context:

| Role Context | Navigation Links | Special Controls |
| :--- | :--- | :--- |
| **Admin** | • Executive Dashboard (`/admin/dashboard`)<br>• Moderate Listings (`/admin/listings`)<br>• Orders & Refunds (`/admin/orders`)<br>• System Settings (`/admin/settings`) | • ⌘K Quick Search<br>• Public Storefront Link |
| **Seller** | • Seller Dashboard (`/seller/dashboard`)<br>• My Book Listings (`/seller/listings`)<br>• Customer Orders (`/seller/orders`)<br>• Earnings & Payouts (`/seller/earnings`)<br>• Seller Verification (`/seller/verify`) | • "+ List Book" Primary CTA<br>• Public Storefront Link |
| **Buyer** | • Profile & Addresses (`/account/profile`)<br>• Orders & Deliveries (`/account/orders`)<br>• Saved Wishlist (`/account/wishlist`)<br>• Notifications (`/account/notifications`)<br>• Used Book Requests (`/account/requests`) | • Cart Counter Badge<br>• Switch to Seller Hub (if seller) |

*Unauthorized links are strictly excluded from the rendered DOM for users without matching roles.*

---

## 7. Mobile Navigation & Touch Ergonomics

On viewports below 768px:
- **No Cramped Headers**: Desktop user names and role labels are hidden from the top bar to prevent layout collisions.
- **Dedicated Bottom Sheets**:
  - Tapping the profile avatar opens `MobileAccountDrawer`.
  - Tapping the notification bell opens `MobileNotificationsDrawer`.
- **Large Touch Targets**: Minimum 44px to 48px heights on all interactive buttons and list rows.
- **Smooth Gestures**: Animated spring transitions via `framer-motion` (`damping: 28, stiffness: 280`).
- **Safe Area Padding**: CSS `safe-area-bottom` applied to all mobile bottom sheets and docks.

---

## 8. Design System Tokens & Dark Mode

All navigation components adhere to BookFry design tokens defined in `global.css`:
- **Backgrounds**: `bg-card`, `bg-background`, `bg-muted`, `bg-surface`
- **Borders**: `border-border`, `border-border/80`, `border-border/60`
- **Typography**: `text-foreground`, `text-muted-foreground`, `text-primary`, `text-secondary`, `font-sans`, `font-serif`
- **Actions**: `bg-secondary text-secondary-foreground`, `hover:bg-secondary/90`, `bg-destructive text-destructive-foreground`
- **Zero Raw Hex**: Strict prohibition of `#FFFFFF`, `#000000`, `bg-blue-500`, etc.

---

## 9. Security & Guardrails

1. **RBAC Guard**: Routes displayed in menus never grant permissions; permissions remain enforced by server middlewares (`requireAuth`, `requireAdmin`, `requireSeller`).
2. **Token Security**: Tokens are never logged or exposed in DOM datasets.
3. **Session Purge**: TanStack Query cache is purged immediately on logout, ensuring next login or shared device sessions cannot view residual user data.
4. **Input Sanitization**: Search queries and notification parameters are strictly sanitized.
