# BookFry Multi-Role Architecture & Cross-Workspace Navigation Guide

## 1. Executive Summary

In a modern peer-to-peer textbook marketplace like **BookFry**, a single user account cannot be artificially pigeonholed into a single identity. A student studying engineering at university may:
1. **Buy textbooks** (Customer / Buyer role)
2. **Sell used previous-semester course packs & lab manuals** (Seller role)
3. **Act as a platform operator or campus ambassador** (Admin role)

This document establishes the production-grade architectural framework governing multi-role accounts across **backend data modeling, Express RBAC enforcement, Next.js 15 route guards, desktop navigation, and mobile bottom drawers**.

---

## 2. Role Taxonomy & Data Layer

### 2.1 Role Definition (packages/types)
`	ypescript
export type UserRole = 'customer' | 'seller' | 'admin';
`

In MongoDB via Mongoose (pps/api/src/models/user.model.ts):
`	ypescript
roles: {
  type: [String],
  enum: ['customer', 'seller', 'admin'],
  default: ['customer'],
  index: true,
}
`

### 2.2 Account Persona Combinations

| Persona | user.roles Array | Description | Accessible Workspaces |
| :--- | :--- | :--- | :--- |
| **Buyer Only** | ['customer'] | Default student user. Can search, purchase, review, wishlist, and submit book requests. | Storefront (/), Account Hub (/account/*) |
| **Seller** | ['customer', 'seller'] or ['seller'] | Student verified or registered to list books, fulfill orders, and receive bank payouts. | Storefront (/), Account Hub (/account/*), Seller Hub (/seller/*) |
| **Admin** | ['customer', 'admin'] or ['admin'] | Platform operator managing catalogs, users, promotions, and disputes. | Storefront (/), Account Hub (/account/*), Admin Console (/admin/*) |
| **Super Hybrid** | ['customer', 'seller', 'admin'] | Platform owner / campus lead who actively buys, sells personal books, and manages platform. | Storefront (/), Account Hub (/account/*), Seller Hub (/seller/*), Admin Console (/admin/*) |

---

## 3. Backend Authorization Layer (Express RBAC)

### 3.1 Non-Exclusionary RBAC Middleware (bac.middleware.ts)
The authorization middleware uses array intersection rather than strict scalar equality:
`	ypescript
export function requireRoles(allowedRoles: UserRole[]) {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user || !req.user.roles) {
      throw new UnauthorizedError('Authentication session required');
    }
    const hasRole = allowedRoles.some((role) => req.user.roles.includes(role));
    if (!hasRole) {
      throw new ForbiddenError('You do not possess the necessary access privileges');
    }
    next();
  };
}
`

### 3.2 Endpoint Protection Boundaries
- **Storefront & Public Catalog (/books, /categories)**: Public access (No auth required).
- **Buyer Operations (/orders, /cart, /account, /reviews)**: Authenticated users (['customer', 'seller', 'admin']).
- **Seller Operations (/seller/*)**: equireRoles(['seller', 'admin']).
  - *Design Principle*: Admins can inspect seller operations and analytics without needing to change account context.
- **Admin Operations (/admin/*)**: equireRoles(['admin']). Strictly locked to Super Admins.
- **Role Elevation (/users/seller-profile)**: When an existing buyer completes the Seller Upgrade form, their role array is appended with seller ([...user.roles, 'seller']), preserving their buyer history.

---

## 4. Frontend Cross-Workspace Navigation System

A primary pitfall of multi-role systems is **exclusionary UI logic** (e.g., isAdmin ? <AdminLink /> : isSeller ? <SellerLink /> : null), which inadvertently locks hybrid users out of secondary dashboards. BookFry resolves this through a **multi-tile, multi-badge parity design**:

### 4.1 Desktop Header Navigation (NavbarProfileMenu)
- **Identity Header**: Shows discrete pill badges for each role held by the user:
  - Admin (Rose accent: g-rose-500/10 text-rose-600 border-rose-500/20)
  - Seller (Fiery orange accent: g-secondary/10 text-secondary border-secondary/20)
  - Student (Neutral muted: g-muted text-muted-foreground border-border)
- **Direct Workspace Links**:
  - If isAdmin: Renders direct link to Admin Control Center (/admin/dashboard).
  - If isSeller: Renders direct link to Seller Hub & Listings (/seller/dashboard).
  - If not a seller: Renders invitation to Become a BookFry Seller (/seller/register).
  - Standard Buyer Links: Orders & deliveries, Wishlist, Notifications, Saved addresses.

### 4.2 Mobile Slide-Out Drawer (NavbarMobileDrawer)
- Replaced exclusionary ternary with independent rendering blocks:
  - Both Admin Control Center and Seller Hub & Listings tiles render side-by-side or stacked when a user holds both privileges.
  - Multi-role badge array rendered under user identity.
  - Unregistered users get a dedicated  Become a Campus Seller CTA card.

### 4.3 Workspace Sidebars (AdminSidebar, SellerSidebar, BuyerSidebar)
All 3 desktop sidebars feature a persistent footer portal switcher:
- **Inside Admin Console**: Footer displays Seller Hub (if isSeller) and Storefront View.
- **Inside Seller Hub**: Footer displays Admin Portal (if isAdmin) and Storefront View.
- **Inside Buyer Account**: Footer displays Admin Center (if isAdmin), Seller Hub (if isSeller), or Become a Seller (if buyer-only), alongside Marketplace Feed.

### 4.4 Dashboard User Menu & Mobile Account Drawer
Both DashboardUserMenu (desktop dropdown) and MobileAccountDrawer (native bottom sheet):
- Display multi-role badges for full persona transparency.
- Feature a dedicated **Switch Workspace** section that dynamically displays reciprocal links:
  - When in Seller mode -> links to Admin Center and Buyer Orders.
  - When in Admin mode -> links to Seller Hub and Buyer Orders.
  - When in Buyer mode -> links to Admin Center and Seller Hub.

---

## 5. Route Protection & Graceful On-Ramps

### 5.1 Admin Pages (/admin/*)
- Guard: currentUser?.roles.includes('admin').
- Non-admin behavior: Renders <AdminEmptyState title=\Administrative Access Restricted\ /> without jarring page redirects.

### 5.2 Seller Pages (/seller/dashboard, /seller/listings, /seller/orders, /seller/earnings, /seller/requests)
- Guard: const hasAccess = isSeller || isAdmin.
- Non-seller behavior:
  - Unauthenticated: Displays <RoleEmptyState> with 1-click modal sign-in trigger.
  - Authenticated Buyer (non-seller): Displays <RoleEmptyState title=\Become a BookFry Campus Seller\> with:
    - Primary CTA: Register as Campus Seller -> routes to /seller/register (which embeds the 2-minute BuyerUpgradeForm).
    - Secondary CTA: Browse Student Marketplace -> routes to /books.
- TanStack Query optimization: All queries set enabled: isAuthenticated && hasAccess so unauthorized background requests never fire or throw 403 errors into the network console.

---

## 6. Verification & Health Summary

- **TypeScript Typecheck**: Clean (0 errors across @bookmarket/api, @bookmarket/types, @bookmarket/web).
- **Backend Test Suite**: 16/16 test suites passed, 129/129 tests passed (100%).
- **Mobile & Desktop Parity**: Verified across all 5 navigation components.
