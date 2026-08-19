# BOOKFRY • Complete Website Flow & Client Demo Documentation

> **Brand Slogan**: *"क्योंकि.. पढ़ाई रुकनी नहीं चाहिए"* (*Education Must Never Stop*)  
> **Application Title**: `BookFry • India's Book Marketplace`  
> **Document Purpose**: Authoritative guide for presenting a live end-to-end client demo of the BookFry marketplace application, tracing complete frontend UI, backend API routing, database states, and operational roles.

---

## 1. BOOKFRY PLATFORM OVERVIEW

### What is BookFry?
**BookFry** is an enterprise-grade digital marketplace and circular economy platform built for buying, selling, and exchanging new and used books across India. It addresses the rising cost of academic and personal books by providing students, readers, independent bookshops, and sellers with an easy-to-use platform to buy quality books at discounted prices or monetize their personal libraries.

### What Problem Does It Solve?
1. **High Academic & Literary Costs**: Books (especially university textbooks, competitive exam guides, and hardcovers) are expensive. BookFry makes education accessible by circulating pre-loved books.
2. **Book Hoarding & Waste**: Millions of read books sit idle on shelves or end up as waste. BookFry enables seamless peer-to-peer and seller-to-buyer circular commerce.
3. **Fragmented Used Book Market**: Local secondhand bookstores lack digital inventory management and online reach. BookFry provides sellers with a dedicated dashboard to list items, manage inventory, and track sales nationwide.

### Who Can Use the Platform? (User Roles)

| Role | Description | Primary Access Point |
| :--- | :--- | :--- |
| **Guest / Unauthenticated User** | Unregistered visitor exploring the marketplace catalog, searching titles, filtering by category/condition, and viewing book details. | `/`, `/books`, `/books/[slug]` |
| **Buyer / Customer** | Registered user who can manage cart, wishlist, delivery addresses, place orders, complete online payments, track order status, and leave reviews. | `/account/profile`, `/cart`, `/checkout`, `/account/orders` |
| **Seller** | Registered individual or store owner who can list books (used/new), manage condition offers, update stock, set prices, view incoming orders, and configure payout details. | `/sell`, `/seller/dashboard`, `/seller/listings`, `/seller/orders` |
| **Admin / Moderator** | Platform operational manager responsible for listing moderation (approve/reject seller books), user management, global categories, promotional coupons, CMS announcements, support ticket resolution, and platform financial analytics. | `/admin/dashboard`, `/admin/users`, `/admin/listings`, `/admin/orders` |

### High-Level Marketplace Journey

```text
                        ┌──────────────────────────────┐
                        │    GUEST / PUBLIC VISITOR    │
                        └──────────────┬───────────────┘
                                       │
                         ┌─────────────▼─────────────┐
                         │   BROWSE & SEARCH CATALOG │
                         └─────────────┬─────────────┘
                                       │
                        ┌──────────────▼──────────────┐
                        │ AUTHENTICATION (Modal/Page) │
                        └──────────────┬──────────────┘
                                       │
         ┌─────────────────────────────┼─────────────────────────────┐
         │                             │                             │
┌────────▼────────┐           ┌────────▼────────┐           ┌────────▼────────┐
│  BUYER MODULE   │           │  SELLER MODULE  │           │  ADMIN MODULE   │
└────────┬────────┘           └────────┬────────┘           └────────┬────────┘
         │                             │                             │
   Add to Cart                    List New Book                  Approve Listings
         │                             │                             │
   Manage Address               Manage Inventory                Manage Users
         │                             │                             │
Checkout & Payment              Fulfill Orders                 Category / CMS
         │                             │                             │
Order Confirmation              Receive Payout                Financial Reports
```

---

## 2. COMPLETE WEBSITE MODULE MAP

```text
BOOKFRY PLATFORM
│
├── Public Storefront Module
│   ├── Landing Page (`/`)
│   │   ├── Top Announcement Bar (CMS-driven promotion)
│   │   ├── Primary Navigation & Search Autosuggest
│   │   ├── Hero Section ("Education Must Never Stop" CTA)
│   │   ├── Featured Categories Grid
│   │   ├── Trending & Popular Book Carousels
│   │   ├── "Why BookFry" Value Proposition & Circular Economy Banner
│   │   └── Multi-column Footer & Social Links
│   │
│   ├── Catalog Browsing (`/books`)
│   │   ├── Full-text Keyword Search
│   │   ├── Category Filter & Sub-category Drilldown
│   │   ├── Condition Filter (`New`, `Like New`, `Good`, `Fair`)
│   │   ├── Price Range Slider & Availability Toggle
│   │   ├── Multi-attribute Sorting (`Price: Low to High`, `Newest`, `Popularity`)
│   │   └── Responsive Book Grid / Skeleton Loading State
│   │
│   ├── Single Book Product Page (`/books/[slug]`)
│   │   ├── Image Gallery & Zoom
│   │   ├── Book Metadata (Title, Author, ISBN, Publisher, Language, Edition)
│   │   ├── Primary Buy Box & Condition Badge
│   │   ├── Multi-Seller Condition Offers List
│   │   ├── Add to Cart / Buy Now Trigger
│   │   └── Customer Reviews & Rating Summary
│   │
│   └── Marketing Pages (`/about`, `/contact`)
│       ├── Brand Story & Mission
│       └── Interactive Support Ticket Submission Form
│
├── Authentication Module (`(auth)`)
│   ├── Multi-Tab Authentication Modal / Page (`/login`, `/register`)
│   │   ├── Buyer / Seller Account Creation
│   │   ├── Real-time Password Strength Meter
│   │   ├── Email / Password Credentials Login
│   │   ├── Forgot Password Request Flow
│   │   └── Reset Password Token Verification
│   └── Route Protection Middleware (`apps/web/src/middleware.ts`)
│
├── Buyer Module (`(customer)` & `(shop)`)
│   ├── Shopping Cart (`/cart`)
│   │   ├── Item Quantity Stepper & Removal Controls
│   │   ├── Multi-Seller Cart Item Grouping
│   │   ├── Dynamic Pricing, Shipping Fee & Subtotal Calculation
│   │   └── Promo Coupon Code Application (`CouponModel`)
│   │
│   ├── Checkout Engine (`/checkout`)
│   │   ├── Saved Shipping Address Selector & Add New Address Drawer
│   │   ├── Order Summary & Inventory Stock Hold Re-validation
│   │   └── Razorpay Standard Web Checkout Integration
│   │
│   ├── Buyer Account Portal (`/account`)
│   │   ├── Customer Profile Management (`/account/profile`)
│   │   ├── Order History & Live Status Tracking (`/account/orders`)
│   │   ├── Printable Tax Invoice View (`/orders/[id]/invoice`)
│   │   ├── Customer Wishlist (`/account/wishlist`)
│   │   └── Account Notifications Center (`/account/notifications`)
│
├── Seller Portal Module (`(seller)` & `/sell`)
│   ├── List a Book Wizard (`/sell`)
│   │   ├── Catalog ISBN Lookup / Auto-fill
│   │   ├── Condition Selection (`New`, `Like New`, `Good`, `Fair`)
│   │   ├── Price & Stock Inventory Configuration
│   │   └── Cloudinary Multi-image Upload
│   │
│   └── Seller Operations Dashboard (`/seller/dashboard`)
│       ├── Inventory Listing Management (`/seller/listings`)
│       ├── Incoming Orders Fulfillment (`/seller/orders`)
│       └── Earnings & Payout Settings (`/seller/earnings`)
│
└── Admin Management Portal (`(admin)`)
    ├── Admin Telemetry Dashboard (`/admin/dashboard`)
    │   ├── Platform GMV, Order Volume, User Counts Analytics
    │   └── Embedded BullMQ Worker Monitoring (`/api/v1/admin/queues`)
    │
    ├── Listing Moderation Queue (`/admin/listings`)
    │   └── Seller Book Approval / Rejection with Custom Reasons
    │
    ├── User & Role Management (`/admin/users`)
    │   └── User Account Status Toggle (`active`, `suspended`, `banned`)
    │
    ├── Catalog & Category Management (`/admin/categories`)
    │   └── Hierarchical Category Tree & Slug Configuration
    │
    ├── Order & Platform Resolution (`/admin/orders`)
    │   └── Global Order Monitoring & SLA Override Controls
    │
    ├── CMS & Marketing Controls (`/admin/cms`, `/admin/promotions`)
    │   ├── Announcement Bar Banner & FAQ Content Editor
    │   └── Discount Coupon CRUD Management
    │
    └── Platform Reports & Support (`/admin/reports`, `/admin/support`)
        ├── Sales Financial Data Export (CSV Stream)
        └── Customer Support Ticket Response Console
```

---

## 3. PUBLIC / GUEST USER FLOW

### 3.1 Landing Page Flow (`/`)

#### What to Demonstrate
1. Open browser to `http://localhost:3000`. Show the top **Announcement Bar** banner (e.g., *"Free Shipping on orders above ₹499 | Code: BOOKWORM"*).
2. Point out the sticky **Navbar** with official BookFry brand colors (Deep Navy `#1A3B5C` & Fiery Orange `#F26522`). Demonstrate live search input in the navigation bar.
3. Scroll through the **Hero Section** highlighting the tagline *"क्योंकि.. पढ़ाई रुकनी नहीं चाहिए"*, primary call-to-action buttons ("Browse Books" & "Sell Books").
4. Showcase the **Featured Categories Grid** (Academic, Fiction, Non-Fiction, Competitive Exams, Manga).
5. Highlight the **Trending & Popular Books Carousels** rendered via backend recommendation jobs.
6. Scroll down to the **Why BookFry** circular economy section, testimonials, and multi-column footer.

#### What Happens in the System
- **Frontend**: Next.js Server Component fetches initial CMS announcement data (`CmsModel`) and top categories from `/api/v1/categories`. Client components render Framer Motion animations and Zustand search listeners.
- **Backend API**: Executes `GET /api/v1/recommendations/trending` and `GET /api/v1/categories`.
- **Database**: Mongoose queries `CategoryModel` (`parentCategory: null`) and cached Redis lists (`trending:books`).

#### Demo Script
> *"When a client or buyer visits BookFry, they immediately see our clean, academic-inspired interface. The announcement bar at the top communicates active promos. Through our search autosuggest or hero action buttons, users can immediately enter the buying catalog or list a book for sale."*

---

### 3.2 Browse Books Flow (`/books`)

```text
User Navigates to /books
          ↓
Frontend Query State Initialized (page=1, category, condition, sort)
          ↓
GET /api/v1/books?search=...&category=...&condition=...&sort=...
          ↓
MongoDB $text & Index Query Execution
          ↓
Returns Paginated Book List + Total Count + Facets
          ↓
UI Renders Responsive Book Grid with Tactile Page-Turn Hover (.hover-page-turn)
```

#### What to Demonstrate
1. Click **Browse Books** in the navigation bar to land on `/books`.
2. Demonstrate filtering: Select a category (e.g., "Engineering & Tech"), check a condition (e.g., "Like New"), and adjust the price slider.
3. Show sorting by selecting "Price: Low to High" or "Newest Arrivals".
4. Demonstrate keyword search by typing a title like *"Clean Code"* or author name *"Robert C. Martin"*.
5. Show how clear filters instantly resets the catalog view.

#### What Happens in the System
- **Frontend**: Uses `useQuery` from TanStack Query. Query parameters synchronize with the browser URL (`useSearchParams`). Skips layout shifts by displaying custom `<SkeletonBookCard />` loaders while fetching.
- **Backend API**: `GET /api/v1/books` route calls `BooksController.getBooks` → `BooksService.queryBooks` → `CatalogRepository.findWithFilters`.
- **Database**: Performs indexed MongoDB queries combining `$text` search index on `title`, `author`, `isbn` with filtering clauses on `category`, `condition`, and `sellingPrice`.

#### Demo Script
> *"Our catalog page allows buyers to instantly filter thousands of listings. Notice how fast results update using TanStack Query. Each book card displays condition tags, pricing, and our tactile page-turn hover interaction."*

---

### 3.3 Book Details Flow (`/books/[slug]`)

#### What to Demonstrate
1. Click any book card from the grid to open its product page.
2. Highlight book details: High-resolution images, title, author, ISBN badge, original price vs selling price, discount badge (`35% OFF`), and availability status.
3. Scroll to the **Multi-Seller Offers Section**: Explain that multiple sellers can offer the same book in different conditions (e.g., Seller A offering "Like New" at ₹350, Seller B offering "Good" at ₹280).
4. Click the **Add to Cart** button or **Buy Now** button.
5. Show customer reviews and ratings summary section at the bottom.

#### What Happens in the System
- **Frontend**: Next.js dynamic route `apps/web/src/app/(shop)/books/[slug]/page.tsx` fetches book metadata and seller offers concurrently. Fires async view event `POST /api/v1/events/view` to track book popularity.
- **Backend API**: `GET /api/v1/books/:slug` returns catalog information. `ListingRepository.findActiveByCatalogId` fetches all active seller condition offers for that ISBN.
- **Database**: Multi-model query aggregating `BookCatalogModel`, `BookListingModel`, and `ReviewModel`.

---

## 4. AUTHENTICATION SYSTEM FLOW

BookFry implements a secure, seamless authentication system. Unauthenticated users triggering customer or seller actions are shown the **Auth Modal** without breaking their context or forcing jarring page redirects.

```text
                   ┌───────────────────────────────┐
                   │  USER TRIGGERS AUTH ACTION    │
                   │ (e.g. Add to Cart / Sell Book)│
                   └───────────────┬───────────────┘
                                   │
                   ┌───────────────▼───────────────┐
                   │  AUTH MODAL OPENS IN PLACE    │
                   │    (useAuthModalStore)        │
                   └───────────────┬───────────────┘
                                   │
             ┌─────────────────────┴─────────────────────┐
             │                                           │
   ┌─────────▼─────────┐                       ┌─────────▼─────────┐
   │   REGISTER TAB    │                       │     LOGIN TAB     │
   └─────────┬─────────┘                       └─────────┬─────────┘
             │                                           │
  Submit Credentials                           Submit Credentials
             │                                           │
   POST /auth/register                           POST /auth/login
             │                                           │
  Password Hashed (bcrypt)                     Password Verified
             │                                           │
             └─────────────────────┬─────────────────────┘
                                   │
                   ┌───────────────▼───────────────┐
                   │  JWT TOKENS ISSUED BY BACKEND │
                   │  • Access Token (15m in JSON) │
                   │  • Refresh Token (httpOnly)   │
                   └───────────────┬───────────────┘
                                   │
                   ┌───────────────▼───────────────┐
                   │ FRONTEND SYNC (useAuthStore)  │
                   │ Auto-redirect to destination  │
                   └───────────────────────────────┘
```

---

### 4.1 Registration Flow

#### Steps & Fields
- **Fields**: Full Name, Email Address, Password, Role Selection (`Customer` or `Seller`), Terms Checkbox.
- **Validation**: Frontend Zod schema verifies valid email format, minimum 8-character password with uppercase, number, and special character. Includes dynamic password strength indicator.
- **Backend Processing**: `POST /api/v1/auth/register` checks if email already exists in `UserModel`. Hashes password with `bcryptjs` (12 salt rounds). Assigns default role. Generates authentication tokens.

---

### 4.2 Login Flow (Buyer, Seller, Admin)

#### Role-Based Authentication Routing

| Role | Test Credentials | Default Login Redirect Destination |
| :--- | :--- | :--- |
| **Buyer / Customer** | `customer@example.com` / `password123` | Original page context / `/cart` |
| **Seller** | `seller@example.com` / `password123` | `/seller/dashboard` |
| **System Admin** | `admin@bookfry.com` / `AdminBookFry123!` | `/admin/dashboard` |

#### Token & Session Lifecycle
- **Access Token**: Short-lived JWT (15 minutes expiry) containing `userId` and `role`. Returned in API payload and stored in memory by Zustand (`useAuthStore`).
- **Refresh Token**: Long-lived JWT (7 days expiry) stored in a secure, `httpOnly`, `SameSite=Lax` browser cookie.
- **Silent Refresh Interceptor**: Axios/Fetch client automatically intercepts `401 Unauthorized` responses and calls `POST /api/v1/auth/refresh` to obtain a fresh access token seamlessly.

---

### 4.3 Forgot Password Flow

1. User clicks **Forgot Password?** inside the login form.
2. User enters registered email → `POST /api/v1/auth/forgot-password`.
3. Backend generates crypto token stored in DB with 1-hour expiration and sends password reset link to user.
4. User accesses reset page → `POST /api/v1/auth/reset-password` updates hashed password and invalidates previous tokens.

---

### 4.4 Logout Flow

1. User clicks **Logout** in user dropdown header menu.
2. Frontend sends `POST /api/v1/auth/logout`. Backend clears `httpOnly` refresh token cookie and invalidates session in Redis.
3. Frontend triggers `useAuthStore.getState().logout()`, clearing user state and resetting cart store.
4. User is redirected to `/login` or homepage `/`.

---

## 5. ROLE-BASED ACCESS CONTROL (RBAC)

### Access Control Matrix

| Feature / Route | Guest | Buyer | Seller | Admin | Technical Protection Mechanism |
| :--- | :---: | :---: | :---: | :---: | :--- |
| Browse Books & Search | ✅ | ✅ | ✅ | ✅ | Public Route |
| View Book Details | ✅ | ✅ | ✅ | ✅ | Public Route |
| Add Items to Cart | ✅* | ✅ | ✅ | ✅ | *Guest Cart saved in localStorage; synced on login |
| Place Order & Pay | ❌ | ✅ | ✅ | ✅ | Protected (`/checkout`) — Requires Auth Token |
| View Own Orders | ❌ | ✅ | ✅ | ✅ | Protected (`/account/orders`) |
| Access Seller Portal | ❌ | ❌ | ✅ | ✅ | Role Guard (`/seller/*`) — Requires `seller` or `admin` role |
| Create New Listing | ❌ | ❌ | ✅ | ✅ | Role Guard (`/sell`) |
| Access Admin Portal | ❌ | ❌ | ❌ | ✅ | Strict Admin Guard (`/admin/*`) — Requires `admin` role |
| Moderate Listings | ❌ | ❌ | ❌ | ✅ | Admin Middleware (`requireAdmin`) |
| Financial CSV Export | ❌ | ❌ | ❌ | ✅ | Admin Middleware (`requireAdmin`) |

### Security Implementation Details
- **Frontend Route Protection**: `apps/web/src/middleware.ts` intercepts requests to protected path groups (`(customer)`, `(seller)`, `(admin)`). Checks JWT token validity and role claims. Redirects unauthorized users to `/login?redirect=...`.
- **Backend API Protection**: Route handlers are guarded by Express middlewares:
  - `requireAuth`: Verifies JWT access token in `Authorization: Bearer <token>` header.
  - `requireRole(['seller', 'admin'])`: Enforces required role access.
  - `requireAdmin`: Strict check ensuring `req.user.role === 'admin'`.

---

## 6. BUYER COMPLETE JOURNEY

---

### 6.1 Buyer Registration & Login Demo
1. Click **Sign In** in top header. Auth Modal opens.
2. Enter buyer credentials (`customer@example.com` / `password123`).
3. Click **Login**. Toast notification confirms success, user avatar appears in header.

---

### 6.2 Discovering a Book
1. Search for *"Computer Networks"* in search bar.
2. Click book result to view details, verify price and condition badge ("Like New - ₹450").

---

### 6.3 Add to Cart Flow

```text
User Clicks 'Add to Cart'
          ↓
Auth Store & Cart Store Synchronized (Zustand useCartStore)
          ↓
Item Added to Cart Array (listingId, quantity, priceAtAddition)
          ↓
API Request Sent: POST /api/v1/cart/items
          ↓
Backend Recalculates Subtotal, Taxes & Delivery Charges
          ↓
Navbar Cart Badge Count Animates (+1)
```

#### Key Technical Rules
- **Guest Cart**: Saved locally in browser `localStorage`. When guest logs in, frontend triggers `POST /api/v1/cart/sync` to merge guest items into the user's database cart record without losing items.
- **Stock Validation**: Cart prevents selecting quantity exceeding current available seller stock.

---

### 6.4 Cart Module (`/cart`)

#### What to Demonstrate
1. Navigate to `/cart`. Show cart items list.
2. Adjust item quantity using `+` and `-` steppers. Show dynamic subtotal recalculation.
3. Enter promotional coupon code (e.g. `WELCOME10`) and click **Apply**. Point out discount line item deduction.
4. Review delivery fee calculation (Free over ₹499). Click **Proceed to Checkout**.

---

### 6.5 Checkout Flow (`/checkout`)

```text
Step 1: Shipping Address Selection (Saved Addresses or New Address Form)
          ↓
Step 2: Order Summary Verification (Item list, Subtotal, Discount, Shipping, Total)
          ↓
Step 3: Stock Hold & Final Amount Re-validation (Backend Orders Service)
          ↓
Step 4: Click 'Place Order & Pay' -> Triggers Razorpay Integration
```

---

## 7. PAYMENT FLOW (RAZORPAY INTEGRATION)

BookFry uses **Razorpay Standard Web Checkout** for secure online payment processing.

```text
                  ┌────────────────────────────────┐
                  │ BUYER CLICKS 'PLACE ORDER & PAY'│
                  └───────────────┬────────────────┘
                                  │
                  ┌───────────────▼────────────────┐
                  │ POST /api/v1/payments/create-order│
                  │ Backend creates Razorpay Order │
                  └───────────────┬────────────────┘
                                  │
                  ┌───────────────▼────────────────┐
                  │ Razorpay Checkout Modal Opens  │
                  │ (Card, UPI, Netbanking, Wallet)│
                  └───────────────┬────────────────┘
                                  │
            ┌─────────────────────┴─────────────────────┐
            │                                           │
  [Payment Succeeded]                         [Payment Failed / Closed]
            │                                           │
  Razorpay returns:                               Payment Status = Failed
  • razorpay_order_id                             Order remains Unpaid
  • razorpay_payment_id                           User prompted to Retry
  • razorpay_signature                                  │
            │                                           │
  POST /api/v1/payments/verify-signature                │
  HMAC SHA256 Verification                              │
            │                                           │
  Payment Verified ✅                                   │
  Mongoose Transaction Initiated                        │
  • Decrement Seller Stock                              │
  • Payment Status = 'paid'                             │
  • Order Status = 'confirmed'                          │
  • Cart Cleared                                        │
            │                                           │
  Redirect to Order Confirmation Page                   │
```

### Payment Handling States

| Scenario | System Behavior & Data Impact |
| :--- | :--- |
| **Payment Success** | HMAC SHA256 signature verified. Transaction recorded in `TransactionModel`. Order status updated to `confirmed`, payment status to `paid`. Seller stock decremented atomically (`stock -= quantity`). Cart cleared. User redirected to `/orders/[id]/invoice`. |
| **Payment Failure** | Order status remains `pending`, payment status set to `failed`. Inventory stock is NOT decremented. User shown error toast with "Retry Payment" option. |
| **Window Closed by User** | Checkout modal closes. Cart items remain untouched so buyer can re-attempt checkout without re-selecting books. |
| **Pending / Webhook Fallback** | If client disconnects post-payment, Razorpay Webhook listener (`POST /api/v1/payments/webhook`) processes async confirmation and updates order status. |

---

## 8. ORDER MANAGEMENT & LIFECYCLE

### Order State Machine

```text
 ┌──────────┐      Payment Confirmed      ┌───────────┐      Seller Ships Book      ┌─────────┐
 │ PENDING  ├────────────────────────────►│ CONFIRMED ├────────────────────────────►│ SHIPPED │
 └────┬─────┘                             └─────┬─────┘                             └────┬────┘
      │                                         │                                        │
Payment Failed                             Buyer Cancel                              Delivered
      │                                         │                                        │
      ▼                                         ▼                                        ▼
┌──────────┐                              ┌───────────┐                            ┌───────────┐
│ CANCELLED│                              │ CANCELLED │                            │ DELIVERED │
└──────────┘                              └───────────┘                            └───────────┘
```

### Order Lifecycle Matrix

| Order Status | Meaning & Business Rule | Who Can Update | Demo Action |
| :--- | :--- | :--- | :--- |
| `pending` | Order created; awaiting payment confirmation. | System | Initial state on checkout creation. |
| `confirmed` | Payment successfully verified. Stock held. Order sent to seller queue. | System / Buyer Payment | Complete Razorpay payment flow. |
| `shipped` | Seller packaged book and dispatched via courier. Tracking AWB assigned. | Seller / Admin | Click "Mark as Shipped" in Seller Portal (`/seller/orders`). |
| `delivered` | Courier delivered parcel to buyer address. | Seller / Admin / Courier | Click "Mark as Delivered" in Seller Portal. |
| `completed` | 7-day return window passed. Escrow auto-released to seller balance. | System (BullMQ Order SLA Worker) | Auto-executed after 7 days by background job. |
| `cancelled` | Order cancelled by buyer prior to shipping or due to payment failure. | Buyer / Admin | Click "Cancel Order" in Buyer Account (`/account/orders`). |

---

## 9. SELLER COMPLETE FLOW

---

### 9.1 Seller Registration & Portal Access
- Registered user converts to seller or creates a seller account (`role: 'seller'`).
- Accesses dedicated seller portal at `/seller/dashboard`.

---

### 9.2 Seller Dashboard (`/seller/dashboard`)
- **Key Metrics Cards**: Total Active Listings, Total Sales GMV, Pending Orders, Completed Orders.
- **Analytics Charts**: Monthly Revenue Trend & Orders Volume visual graphs.

---

### 9.3 Add New Book Flow (`/sell`)

```text
Seller Opens /sell Page
          ↓
Enters ISBN / Title -> Auto-completes catalog data if book exists
          ↓
Selects Book Condition: [New | Like New | Good | Fair]
          ↓
Inputs Selling Price (₹) & Original MRP (₹)
          ↓
Sets Inventory Quantity Stock (e.g. 5 copies)
          ↓
Uploads Front Cover, Back Cover & Page Condition Images
          ↓
Clicks 'Publish Listing' -> POST /api/v1/seller/listings
          ↓
Listing Created (Status: Active or Pending Admin Approval)
```

#### Detailed Form Fields
- **Book Identification**: ISBN-10/13, Title, Author(s), Publisher, Language, Edition.
- **Condition Grading**: Condition tag + detailed description of wear/annotations.
- **Pricing & Stock**: Selling Price, MRP, Stock Quantity.
- **Media Upload**: Multi-file Cloudinary image upload with thumbnail preview.

---

### 9.4 Seller Listing Management (`/seller/listings`)
- View active, out-of-stock, and archived listings.
- Edit listing price, condition, or stock level.
- Deactivate or soft-delete listings.

---

### 9.5 Seller Order Fulfillment (`/seller/orders`)
- View incoming orders requiring dispatch.
- Download shipping label / order summary slip.
- Input Courier Name & Tracking AWB number; click **Mark as Shipped**.

---

### 9.6 Seller Earnings & Payout Settings (`/seller/earnings`)
- Displays Available Balance, Escrow Pending Balance, and Total Lifetime Earnings.
- **Payout Configuration**: Form to save UPI ID (e.g., `seller@upi`) and Bank Account Details (Account Number, IFSC Code) persisted to `UserModel.sellerProfile.payoutDetails`.

---

## 10. ADMIN COMPLETE FLOW

---

### 10.1 Admin Login & Security
- Admin logs in using administrative credentials (`admin@bookfry.com` / `AdminBookFry123!`).
- Express `requireAdmin` middleware checks JWT payload claims (`req.user.role === 'admin'`). Unauthorized access redirects to homepage.

---

### 10.2 Admin Dashboard (`/admin/dashboard`)

```text
┌────────────────────────────────────────────────────────────────────────┐
│                          ADMIN TELEMETRY BOARD                         │
├─────────────────┬──────────────────┬─────────────────┬─────────────────┤
│  TOTAL GMV (₹)  │   TOTAL ORDERS   │   TOTAL USERS   │ ACTIVE LISTINGS │
│   ₹4,85,200     │      1,240       │      3,850      │      5,420      │
└─────────────────┴──────────────────┴─────────────────┴─────────────────┘
```
- Real-time telemetry cards showing platform GMV, user growth, active listings, order breakdown.
- **Queue Monitoring**: Embedded BullMQ worker dashboard mounted at `/api/v1/admin/queues` for monitoring background recommendation and SLA jobs.

---

### 10.3 User Management (`/admin/users`)
- View master table of all registered users (Buyers, Sellers, Admins).
- Search users by name, email, or role.
- Change user status (`active`, `suspended`, `banned`).

---

### 10.4 Seller & Listing Moderation (`/admin/listings`)
- Moderation queue for reviewing new seller listings.
- Actions: **Approve** (marks listing `active`) or **Reject** (opens modal to enter rejection reason sent to seller).

---

### 10.5 Category Management (`/admin/categories`)
- Create new main categories or sub-categories.
- Manage category names, URL slugs, icons, and description text.

---

### 10.6 Order & Resolution Management (`/admin/orders`)
- View all platform orders across sellers.
- Filter by status (`pending`, `confirmed`, `shipped`, `delivered`, `cancelled`).
- Issue administrative order status overrides or refund triggers.

---

### 10.7 Admin CMS & Marketing Controls (`/admin/cms`, `/admin/promotions`)
- Edit top Announcement Bar text and toggle visibility.
- Create promotional discount coupons (`CouponModel`) with percentage/flat discount, minimum purchase amount, and expiry dates.

---

### 10.8 Financial CSV Reports Export (`/admin/reports`)
- Click **Export Financial Sales Report**.
- Backend streams CSV data file containing transaction dates, order numbers, seller payouts, commission fees, and gross revenues.

---

## 11. DATABASE SCHEMAS & RELATIONSHIPS

```text
                                 ┌──────────────┐
                                 │  USER MODEL  │
                                 └──────┬───────┘
                                        │ 1
        ┌───────────────────────────────┼───────────────────────────────┐
        │ 1                             │ 1                             │ 1
┌───────▼───────┐               ┌───────▼───────┐               ┌───────▼───────┐
│  CART MODEL   │               │WISHLIST MODEL │               │  ORDER MODEL  │
└───────┬───────┘               └───────────────┘               └───────┬───────┘
        │ N                                                             │ 1
┌───────▼───────┐                                               ┌───────▼───────┐
│ BOOK LISTING  │◄──────────────────────────────────────────────┤PAYMENT / TRANS│
└───────┬───────┘                                               └───────────────┘
        │ N
┌───────▼───────┐
│ CATALOG MODEL │
└───────┬───────┘
        │ N
┌───────▼───────┐
│CATEGORY MODEL │
└───────────────┘
```

### Core Mongoose Models Specification

| Model Name | Primary Fields | Key Relationships |
| :--- | :--- | :--- |
| `UserModel` | `name`, `email`, `password`, `role` (`customer`/`seller`/`admin`), `addresses`, `sellerProfile` (`payoutDetails`), `isVerified` | Owner of Cart, Orders, Wishlist, Listings |
| `BookCatalogModel` | `title`, `author`, `isbn`, `category`, `description`, `images`, `aggregateRating` | Referenced by BookListings |
| `BookListingModel` | `catalogId`, `sellerId`, `condition` (`new`/`like-new`/`good`/`fair`), `sellingPrice`, `originalPrice`, `stock`, `status` | Belongs to Seller & Catalog; referenced by Order Items |
| `CategoryModel` | `name`, `slug`, `description`, `icon`, `parentCategory` | Self-referencing tree structure |
| `CartModel` | `userId`, `items` (`listingId`, `quantity`, `priceAtAddition`) | Belongs to User; references BookListings |
| `OrderModel` | `orderNumber`, `customerId`, `sellerId`, `items`, `subtotal`, `discount`, `shippingFee`, `tax`, `totalAmount`, `shippingAddress`, `paymentStatus`, `orderStatus`, `SLA` | Belongs to Customer & Seller; references BookListings |
| `TransactionModel` | `orderId`, `buyerId`, `amount`, `razorpayPaymentId`, `razorpaySignature`, `status` | Belongs to Order & User |
| `CouponModel` | `code`, `discountType` (`percentage`/`fixed`), `discountValue`, `minPurchase`, `expiryDate`, `active` | Applied during checkout |
| `CmsModel` | `type` (`announcement`/`faq`/`banner`), `title`, `content`, `active` | Managed by Admin |
| `SupportTicketModel` | `name`, `email`, `subject`, `message`, `status` (`open`/`in-progress`/`resolved`) | Submitted by public; managed by Admin |
| `PlatformSettingsModel` | `commissionPercentage`, `flatShippingFee`, `taxRate`, `maintenanceMode` | Managed by Admin |

---

## 12. API ENDPOINT REFERENCE MATRIX

| Endpoint | Method | Purpose | Required Role |
| :--- | :---: | :--- | :--- |
| `/api/v1/auth/register` | `POST` | Register new user account | Public |
| `/api/v1/auth/login` | `POST` | Authenticate user & issue JWT tokens | Public |
| `/api/v1/auth/refresh` | `POST` | Silent refresh of access token | Public (Cookie) |
| `/api/v1/auth/logout` | `POST` | Invalidate refresh token & clear cookie | Authenticated |
| `/api/v1/auth/me` | `GET` | Fetch current logged-in user profile | Authenticated |
| `/api/v1/books` | `GET` | Query catalog books with search & filters | Public |
| `/api/v1/books/:slug` | `GET` | Get single book details & seller offers | Public |
| `/api/v1/categories` | `GET` | Fetch category hierarchy tree | Public |
| `/api/v1/cart` | `GET` | Fetch current user cart | Authenticated |
| `/api/v1/cart/items` | `POST` | Add item to cart | Authenticated |
| `/api/v1/cart/items/:id` | `PATCH`/`DELETE` | Update quantity or remove cart item | Authenticated |
| `/api/v1/payments/create-order` | `POST` | Generate Razorpay payment order ID | Authenticated |
| `/api/v1/payments/verify-signature` | `POST` | HMAC verify payment & finalize order | Authenticated |
| `/api/v1/orders` | `POST` | Create order document | Authenticated |
| `/api/v1/orders/my-orders` | `GET` | Get buyer order history | Authenticated |
| `/api/v1/orders/:id` | `GET` | Get detailed order invoice & SLA tracking | Authenticated |
| `/api/v1/seller/listings` | `GET`/`POST` | View or create seller book listings | Seller / Admin |
| `/api/v1/seller/orders` | `GET` | View orders assigned to seller | Seller / Admin |
| `/api/v1/seller/orders/:id/status`| `PATCH` | Update order shipment status (`shipped`) | Seller / Admin |
| `/api/v1/admin/stats` | `GET` | Fetch platform system telemetry metrics | Admin |
| `/api/v1/admin/users` | `GET`/`PATCH` | Manage user account statuses | Admin |
| `/api/v1/admin/listings/moderate` | `PATCH` | Approve or reject seller book listings | Admin |
| `/api/v1/admin/reports/export` | `GET` | Stream financial sales CSV export | Admin |

---

## 13. FRONTEND TO BACKEND ARCHITECTURE & DATA FLOW

```text
User Gesture (Click / Input)
             │
             ▼
React Server / Client Component (Next.js 15 App Router)
             │
             ▼
Form Validation (React Hook Form + Zod Schemas)
             │
             ▼
Client State & Cache Layer (Zustand Stores / TanStack Query)
             │
             ▼
HTTP API Client (Axios Client with Silent 401 JWT Interceptor)
             │
             ▼
Express API Gateway (Helmet, CORS, express-rate-limit)
             │
             ▼
Route Guard Boundary (requireAuth, requireAdmin Middlewares)
             │
             ▼
Controller Layer (Request/Response DTO Mapping)
             │
             ▼
Service Layer (Business Logic, Transactions, Razorpay SDK)
             │
             ▼
Repository Layer (Abstract Data Access Queries)
             │
             ▼
Database & Cache (MongoDB Atlas via Mongoose ODM & Redis BullMQ)
```

---

## 14. COMPLETE END-TO-END DEMO SCENARIOS

---

### DEMO SCENARIO 1: NEW BUYER JOURNEY

#### Step 1: Open Storefront & Browse
- **Action**: Navigate to `http://localhost:3000`. Show homepage promo banner and featured categories.
- **What to Say**: *"We begin our demo as a visitor looking for academic books on BookFry."*
- **Technical Note**: Initial page rendered via Next.js Server Components.

#### Step 2: Search & Filter Book
- **Action**: Search for *"Clean Code"* in the navbar. Apply filter "Condition: Like New". Click product card.
- **What to Say**: *"Notice the fast catalog filtering and multi-seller condition offers available for this book."*

#### Step 3: Authenticate & Add to Cart
- **Action**: Click **Add to Cart**. Auth Modal pops up. Enter buyer login (`customer@example.com` / `password123`). Click **Login**. Toast confirms success; item added to cart.
- **What to Say**: *"BookFry uses an in-place authentication modal so buyers never lose their shopping context."*

#### Step 4: Checkout & Payment
- **Action**: Go to `/cart` → Click **Proceed to Checkout**. Select shipping address → Click **Place Order & Pay**. Razorpay checkout modal opens. Select Test Success payment.
- **What to Say**: *"Our checkout integrates Razorpay standard web checkout. Upon payment completion, signature verification runs inside a MongoDB transaction."*

#### Step 5: Order Confirmation & Invoice
- **Action**: Auto-redirected to `/orders/[id]`. Show order confirmation status, delivery SLA timeline, and printable tax invoice button.
- **What to Say**: *"The buyer can immediately view their order timeline and print an official tax invoice."*

---

### DEMO SCENARIO 2: SELLER JOURNEY

#### Step 1: Login to Seller Portal
- **Action**: Log in with seller credentials (`seller@example.com` / `password123`). Navigate to `/seller/dashboard`.
- **What to Say**: *"Now we switch to the Seller Experience. Sellers have a dedicated portal to manage inventory and sales."*

#### Step 2: List a New Book
- **Action**: Click **Sell a Book** (`/sell`). Enter ISBN `9780132350884`, title *"Clean Code"*, select condition *"Like New"*, set price ₹450, stock 5. Upload cover image and submit.
- **What to Say**: *"Sellers can quickly list books in under a minute with custom condition grading and image uploads."*

#### Step 3: Fulfill Incoming Order
- **Action**: Open `/seller/orders`. Locate new buyer order. Click **Mark as Shipped**, enter tracking AWB `DELHIVERY123456`.
- **What to Say**: *"Sellers easily fulfill orders and update tracking info, which instantly notifies the buyer."*

---

### DEMO SCENARIO 3: ADMIN JOURNEY

#### Step 1: Login to Admin Portal
- **Action**: Log in with system admin credentials (`admin@bookfry.com` / `AdminBookFry123!`). Navigate to `/admin/dashboard`.
- **What to Say**: *"Finally, we view the Administrative Control Center."*

#### Step 2: Review Platform Telemetry & Queues
- **Action**: Showcase GMV analytics cards and click **Queue Monitor** (`/api/v1/admin/queues`) to view live BullMQ background jobs.
- **What to Say**: *"Admins monitor platform GMV, user growth, and background job health in real-time."*

#### Step 3: Moderate Listings & Export Financial CSV
- **Action**: Navigate to `/admin/listings` to approve pending seller books. Navigate to `/admin/reports` and click **Export Sales CSV**.
- **What to Say**: *"Admins maintain catalog quality through listing moderation and can export financial sales reports anytime."*

---

## 15. CLIENT DEMO PRESENTATION SCRIPT

### Opening
> *"Welcome, everyone. Today I am excited to present **BookFry**—India's dedicated online marketplace for buying, selling, and circulating new and pre-loved books. Our mission is captured in our slogan: **'क्योंकि.. पढ़ाई रुकनी नहीं चाहिए'**—Education must never stop."*

### Homepage & Catalog Demo
> *"As a visitor lands on BookFry, they are greeted by an intuitive, academic-inspired interface. They can search thousands of titles, filter by category or book condition, and compare condition offers from multiple sellers in real-time."*

### Buyer Journey Demo
> *"When a buyer decides to purchase, authentication happens seamlessly via our context-preserving auth modal. Cart management, promotional coupons, address selection, and Razorpay payment checkout function fluidly with real-time stock validation."*

### Seller Journey Demo
> *"For sellers—whether students clearing their shelves or store owners—BookFry offers a complete business portal. Sellers can list books in four simple steps, manage inventory, track earnings, and update shipment tracking."*

### Admin & Platform Governance Demo
> *"Behind the scenes, platform administrators have full oversight. From real-time telemetry dashboards and listing moderation queues to background SLA workers and financial CSV exports, BookFry is production-ready."*

### Closing Summary
> *"BookFry combines Stripe-like precision with Vercel-like speed to deliver a complete marketplace ecosystem for readers across India. Thank you, and I welcome any questions!"*

---

## 16. COMPLETE SYSTEM FLOW DIAGRAM

```text
                               ┌──────────────────────────┐
                               │   PUBLIC STOREFRONT      │
                               │  (Next.js App Router)    │
                               └────────────┬─────────────┘
                                            │
               ┌────────────────────────────┼────────────────────────────┐
               │                            │                            │
      ┌────────▼────────┐          ┌────────▼────────┐          ┌────────▼────────┐
      │ CATALOG SEARCH  │          │ AUTH MODAL      │          │ RECOMMENDATIONS │
      │ /books          │          │ /login /register│          │ BullMQ Workers  │
      └────────┬────────┘          └────────┬────────┘          └────────┬────────┘
               │                            │                            │
               └────────────────────────────┼────────────────────────────┘
                                            │
                               ┌────────────▼─────────────┐
                               │   AUTHENTICATED USER     │
                               └────────────┬─────────────┘
                                            │
         ┌──────────────────────────────────┼──────────────────────────────────┐
         │                                  │                                  │
┌────────▼────────┐                ┌────────▼────────┐                ┌────────▼────────┐
│  BUYER JOURNEY  │                │ SELLER JOURNEY  │                │  ADMIN JOURNEY  │
├─────────────────┤                ├─────────────────┤                ├─────────────────┤
│ • Add to Cart   │                │ • List Book     │                │ • Platform GMV  │
│ • Checkout      │                │ • Manage Stock  │                │ • Moderate List │
│ • Razorpay Pay  │                │ • Ship Orders   │                │ • User Status   │
│ • View Invoice  │                │ • Payout Setup  │                │ • Export Reports│
└────────┬────────┘                └────────┬────────┘                └────────┬────────┘
         │                                  │                                  │
         └──────────────────────────────────┼──────────────────────────────────┘
                                            │
                               ┌────────────▼─────────────┐
                               │     EXPRESS API LAYER    │
                               │ Route → Ctrl → Svc → Repo│
                               └────────────┬─────────────┘
                                            │
                               ┌────────────▼─────────────┐
                               │   MONGODB & REDIS LAYER  │
                               │ Transactions & Escrow SLA│
                               └──────────────────────────┘
```

---

## 17. MODULE-WISE IMPLEMENTATION STATUS MATRIX

| Module | Status | Main Features & Operational Notes |
| :--- | :---: | :--- |
| **Authentication & Accounts** | **Implemented** | Password hashing (bcryptjs 12 rounds), JWT Access + httpOnly Refresh token, Auth Modal, Password Reset. |
| **Book Catalog & Search** | **Implemented** | MongoDB `$text` search, multi-filter query (category, condition, price), multi-seller condition offers list, async view events. |
| **Recommendation Engine** | **Implemented** | BullMQ worker calculation for `trending:books` and `popular:books` co-occurrence algorithms. |
| **Shopping Cart** | **Implemented** | Add/remove items, quantity steppers, guest-to-user cart sync, stock limit protection, Zustand store persistence. |
| **Checkout & Re-validation** | **Implemented** | Saved shipping address selector, dynamic order summary, subtotal & shipping recalculation, coupon code application (`CouponModel`). |
| **Payment Integration** | **Implemented** | Razorpay Standard Web Checkout, HMAC SHA256 signature verification, Mongoose transaction stock deduction. |
| **Order Management & SLA** | **Implemented** | Order state machine (`pending` → `confirmed` → `shipped` → `delivered`), printable tax invoice, 7-day auto escrow release job (`orderSla.worker`). |
| **Seller Portal & Listing** | **Implemented** | Multi-step listing wizard (`/sell`), Cloudinary image upload, inventory stock management, payout details setup (`payoutDetails`). |
| **Admin Dashboard & Telemetry**| **Implemented** | Real-time platform GMV, order volume, user counts, embedded BullMQ queue monitoring dashboard (`/api/v1/admin/queues`). |
| **Admin Moderation & Users** | **Implemented** | Listing moderation queue (approve/reject listing), user account status toggle (`active`, `suspended`, `banned`). |
| **Admin CMS & Promotions** | **Implemented** | Announcement Bar editor, promotional discount coupon CRUD (`CouponModel`), support ticket console (`SupportTicketModel`). |
| **Reports & Data Export** | **Implemented** | Automated financial sales CSV streaming export (`/api/v1/admin/reports/export`). |
| **Courier API Auto-Dispatch** | **Partially Implemented** | AWB tracking numbers generated as structured strings; live Delhivery/Shiprocket API dispatch is pending. |
| **Buyer-Seller Peer Chat** | **Not Implemented** | Direct buyer-to-seller instant messaging system is not built. |

---
*Document generated for BookFry Production Client Demonstration.*
