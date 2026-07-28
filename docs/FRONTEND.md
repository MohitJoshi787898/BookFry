# Frontend Architecture & Component Reference

---

## 1. Application Route Reference (`apps/web/src/app`)

| Route Path | Auth Requirement | Purpose | Key Components Rendered | Data Fetched (Queries / Hooks) |
| :--- | :--- | :--- | :--- | :--- |
| `/` | Public | Marketplace Landing Page & Hero | `AnnouncementBar`, `Navbar`, `HeroSection`, `CategoryGrid`, `BookCarousel`, `WhyBookFrySection`, `FAQSection`, `Footer` | `useQuery(['recommendations', 'home'])`, `useQuery(['public-cms'])` |
| `/about` | Public | Brand Mission & Platform Info | `Navbar`, `Footer` | Static content |
| `/contact` | Public | Customer Support Contact Form | `Navbar`, `Footer` | `useMutation('submitContact')` |
| `/login` | Public (Unauthenticated) | User Login Page | `AuthLayout`, `LoginForm` | `useAuthStore.login()` |
| `/register` | Public (Unauthenticated) | User Signup Page | `AuthLayout`, `RegisterForm` | `useAuthStore.register()` |
| `/books` | Public | Search Catalog & Filter Page | `Navbar`, `QuickFilterBar`, `FilterSidebar`, `BookGrid`, `BookCard`, `Pagination`, `Footer` | `useQuery(['books', searchParams])`, `useQuery(['categories'])` |
| `/books/[slug]` | Public | Book Detail Page & Offers | `Navbar`, `BookDetails`, `SellerOffersList`, `ReviewSection`, `BookCarousel`, `Footer` | `useQuery(['book', slug])`, `useQuery(['recommendations', bookId])`, `useMutation('trackView')` |
| `/cart` | Public / Customer | Cart Drawer & Order Summary | `Navbar`, `CartItemRow`, `OrderSummary`, `Footer` | `useCartStore`, `useQuery(['cart'])`, `useMutation('updateCartQuantity')` |
| `/checkout` | Customer Required | Order Review & Payment | `Navbar`, `CheckoutForm`, `RazorpayCheckoutButton` | `useCartStore`, `useMutation('createOrder')`, `useMutation('verifyPayment')` |
| `/sell` | Customer / Seller | Multi-step Book Listing Wizard | `Navbar`, `ListingStepWizard`, `ImageUploader`, `Footer` | `useQuery(['categories'])`, `useMutation('createListing')` |
| `/account/profile` | Customer Required | User Profile & Address Book | `AccountLayout`, `ProfileForm`, `AddressList` | `useQuery(['user', 'profile'])`, `useMutation('updateProfile')` |
| `/account/orders` | Customer Required | Customer Order History | `AccountLayout`, `OrderCard`, `OrderTimelineStepper`, `ReturnRequestModal` | `useQuery(['user', 'orders'])`, `useMutation('requestReturn')` |
| `/account/wishlist` | Customer Required | Customer Saved Wishlist | `AccountLayout`, `BookGrid`, `BookCard` | `useWishlist()` custom hook |
| `/account/notifications` | Customer Required | In-App Notification Inbox | `AccountLayout`, `NotificationItem` | `useQuery(['user', 'notifications'])`, `useMutation('markNotificationRead')` |
| `/seller/dashboard` | Seller / Admin Required | Seller Overview & Analytics | `SellerLayout`, `StatCard`, `RecentSalesTable` | `useQuery(['seller', 'stats'])` |
| `/seller/listings` | Seller / Admin Required | Seller Inventory Management | `SellerLayout`, `ListingsDataTable`, `ListingStatusBadge` | `useQuery(['seller', 'listings'])`, `useMutation('deleteListing')` |
| `/seller/orders` | Seller / Admin Required | Seller Order Fulfillment | `SellerLayout`, `OrdersDataTable`, `UpdateShippingModal` | `useQuery(['seller', 'orders'])`, `useMutation('updateShippingStatus')` |
| `/seller/earnings` | Seller / Admin Required | Seller Earnings & Bank Setup | `SellerLayout`, `PayoutForm`, `TransactionsTable` | `useQuery(['seller', 'earnings'])`, `useMutation('updateSellerPayout')` |
| `/admin/dashboard` | Admin Required | System Telemetry & GMV | `AdminLayout`, `AdminStatCard`, `RecentUsersTable` | `useQuery(['admin', 'dashboard'])` |
| `/admin/users` | Admin Required | User Management & Ban Control | `AdminLayout`, `AdminDataTable` | `useQuery(['admin', 'users'])`, `useMutation('toggleBan')` |
| `/admin/listings` | Admin Required | Book Listing Moderation | `AdminLayout`, `AdminDataTable`, `ModerationModal` | `useQuery(['admin', 'listings'])`, `useMutation('moderateListing')` |
| `/admin/orders` | Admin Required | Global Order Oversight | `AdminLayout`, `AdminDataTable` | `useQuery(['admin', 'orders'])`, `useMutation('updateOrderStatus')` |
| `/admin/categories` | Admin Required | Category Hierarchy Manager | `AdminLayout`, `AdminDataTable`, `CategoryModal` | `useQuery(['categories'])`, `useMutation('createCategory')` |
| `/admin/cms` | Admin Required | Announcement Bar & FAQ CMS | `AdminLayout`, `CmsForm`, `FaqList` | `useQuery(['admin', 'cms'])`, `useMutation('updateCms')` |
| `/admin/promotions` | Admin Required | Promo Coupons Manager | `AdminLayout`, `AdminDataTable`, `CreateCouponForm` | `useQuery(['admin', 'coupons'])`, `useMutation('createCoupon')`, `useMutation('deleteCoupon')` |
| `/admin/settings` | Admin Required | Platform Fees & GST Config | `AdminLayout`, `SettingsForm` | `useQuery(['admin', 'settings'])`, `useMutation('updateSettings')` |
| `/admin/reports` | Admin Required | Financial Telemetry & CSV | `AdminLayout`, `FinancialTable` | `useQuery(['admin', 'reports'])`, `exportCsvReport()` |
| `/admin/support` | Admin Required | Customer Support Tickets | `AdminLayout`, `AdminDataTable` | `useQuery(['admin', 'support-tickets'])`, `useMutation('resolveTicket')` |
| `/admin/reviews` | Admin Required | Review Moderation Portal | `AdminLayout`, `AdminDataTable` | `useQuery(['admin', 'reviews'])`, `useMutation('deleteReview')` |

---

## 2. Reusable Component Inventory

### Core Shared Components (`components/shared`)
- **`BookCard`**: Renders standard book product card with image, condition ribbon, price discount percentage, and seller badge. Used across Landing Page, `/books` Catalog, Wishlist, and Carousels.
- **`AnnouncementBar`**: Top banner displaying promo announcement text and tagline *"क्योंकि.. पढ़ाई रुकनी नहीं चाहिए"*. Consumes `/contact/cms`. Used in root layout.
- **`Footer`**: Global marketplace footer with quick links, seller links, payment trust badges, and copyright notice. Used in main layout.
- **`Pagination`**: Accessible numbered page selector component for catalog and admin tables. Used in `/books`, `/admin/users`, `/admin/listings`.
- **`OrderTimelineStepper`**: Visual vertical/horizontal order status progression stepper (`pending` -> `confirmed` -> `shipped` -> `delivered`). Used in `/account/orders`, `/seller/orders`, `/admin/orders`.

### Layout & Navigation Components (`components/navbar` & `components/admin`)
- **`Navbar`**: Main storefront navigation header containing brand logo, dynamic `SearchBar`, seller trigger button, wishlist counter, and cart badge.
- **`AdminLayout`**: Sidebar navigation shell for `/admin` sub-routes enforcing admin RBAC checks and layout consistency.
- **`AdminDataTable`**: Generic sortable data table component wrapped around Tailwind styles. Used across all `/admin/*` pages.

### Atomic UI Components (`components/ui`)
- **`button.tsx`**: Standardized shadcn/ui button primitive supporting variants (`default`, `secondary`, `destructive`, `outline`, `ghost`).
- **`dialog.tsx`**: Accessibility focus-trapped modal dialog primitive using Radix UI primitives.
- **`input.tsx` & `select.tsx`**: Styled form input and dropdown selector controls.
- **`badge.tsx`**: Rounded tag badge for condition, stock status, and role tags.
- **`skeleton.tsx`**: Layout skeleton placeholder loader for visual loading states.

### Component Consolidation Candidates
- *Candidate 1*: `StatCard` in `components/seller/stat-card.tsx` and `AdminStatCard` in `components/admin/admin-stat-card.tsx` are 90% identical in styling and layout. Can be consolidated into `components/shared/stat-card.tsx`.
- *Candidate 2*: `ListingStatusBadge` in `components/seller/` and `StatusBadge` in `components/admin/` duplicate condition/status color mappings. Can be consolidated into `components/shared/status-badge.tsx`.

---

## 3. Client & Server State Management Map

### Zustand Stores (`apps/web/src/stores`)

1. **`useAuthStore` (`auth.store.ts`)**:
   ```ts
   interface AuthState {
     user: User | null;
     token: string | null;
     isAuthenticated: boolean;
     setAuth: (user: User, token: string) => void;
     clearAuth: () => void;
     updateUser: (user: User) => void;
   }
   ```
   - *Persistence*: Persisted in `localStorage` key `'auth-storage'`.

2. **`useCartStore` (`cart.store.ts`)**:
   ```ts
   interface CartState {
     items: CartItem[];
     guestItems: CartItem[];
     addItem: (item: CartItem) => void;
     removeItem: (listingId: string) => void;
     updateQuantity: (listingId: string, quantity: number) => void;
     clearCart: () => void;
     syncWithServer: () => Promise<void>;
   }
   ```
   - *Persistence*: Local guest items stored in `localStorage` key `'cart-storage'`, synced with backend MongoDB cart upon login.

3. **`useAuthModalStore` (`auth-modal.store.ts`)**:
   ```ts
   interface AuthModalState {
     isOpen: boolean;
     view: 'login' | 'signup' | 'forgot_password';
     openModal: (view?: 'login' | 'signup' | 'forgot_password') => void;
     closeModal: () => void;
   }
   ```

### TanStack Query Keys Reference

| Query Key Pattern | Purpose | Stale Time | Cache Invalidation Events |
| :--- | :--- | :--- | :--- |
| `['books', searchParams]` | Catalog search results | 1 minute | On listing creation/update |
| `['book', slug]` | Single book detail & catalog | 2 minutes | On seller offer change |
| `['recommendations', 'home']` | Landing page carousels | 5 minutes | Background job update |
| `['recommendations', bookId]` | Frequently bought together | 5 minutes | Background job update |
| `['categories']` | Category list hierarchy | 10 minutes | Admin category edit |
| `['user', 'profile']` | Customer profile details | 5 minutes | Profile form update |
| `['user', 'orders']` | Customer order history | 30 seconds | Checkout / Order status update |
| `['seller', 'listings']` | Seller listing inventory | 30 seconds | Create/Edit/Delete listing |
| `['admin', 'dashboard']` | Admin GMV & system stats | 15 seconds | Global order updates |
| `['admin', 'cms']` | CMS announcement/FAQ | 5 minutes | Admin CMS save |
| `['admin', 'coupons']` | Admin coupon discount list | 1 minute | Coupon create/delete |
| `['admin', 'settings']` | Platform fees & settings | 5 minutes | Settings save |

---

## 4. Design System Compliance Status

Measured against `docs/DESIGN.md` tokens:

- **HSL CSS Variable Integration**: Fully wired into `apps/web/src/styles/globals.css` and `tailwind.config.ts`.
  - Brand Primary Navy: `#1A3B5C` (`hsl(210 56% 23%)`) mapped to `bg-brand` / `text-brand`.
  - Secondary Fiery Orange: `#F26522` (`hsl(20 89% 54%)`) mapped to `bg-secondary` / `text-secondary`.
  - Background & Card Surface: `bg-background` (`hsl(0 0% 100%)`) and `bg-card` (`hsl(210 20% 98%)`).
- **Typography Scale**: Cleanly wired to Google Fonts Inter & Outfit in `globals.css` (`font-sans`, `font-serif`).
- **Tactile Micro-Interactions**: `.hover-page-turn` utility defined in `globals.css` for subtle hover elevation (`hover:-translate-y-1 hover:rotate-1`).
