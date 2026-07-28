# Backend API & Server Architecture

---

## 1. Express API Module Inventory (`apps/api/src/modules`)

The backend API is organized into 15 domain modules mounted under `/api/v1` in `apps/api/src/routes/index.ts`.

### Full REST Endpoint Reference Table

| HTTP Method | Route Endpoint Path | Auth / Roles Required | Validation Schema / Request Body | Response Payload Shape | Status Codes | Service Handler Function |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **POST** | `/api/v1/auth/register` | None (Public) | `registerSchema`: `{ name, email, password }` | `{ user: { id, name, email, roles }, accessToken }` | 201, 400, 409 | `AuthService.registerUser()` |
| **POST** | `/api/v1/auth/login` | None (Public) | `loginSchema`: `{ email, password }` | `{ user, accessToken }` + httpOnly Cookie | 200, 400, 401 | `AuthService.loginUser()` |
| **POST** | `/api/v1/auth/refresh` | Cookie / Refresh Token | Cookie `refreshToken` | `{ accessToken }` | 200, 401 | `AuthService.refreshAccessToken()` |
| **POST** | `/api/v1/auth/logout` | Auth Required | None | `{ message: "Logged out successfully" }` | 200, 401 | `AuthService.logoutUser()` |
| **GET** | `/api/v1/auth/me` | Auth Required | None | `{ user: { id, name, email, roles, sellerProfile } }` | 200, 401 | `AuthService.getCurrentUser()` |
| **POST** | `/api/v1/auth/forgot-password` | None (Public) | `{ email }` | `{ message: "Password reset link sent" }` | 200, 400 | `AuthService.forgotPassword()` |
| **POST** | `/api/v1/auth/reset-password` | Token Query | `{ token, newPassword }` | `{ message: "Password updated successfully" }` | 200, 400 | `AuthService.resetPassword()` |
| **GET** | `/api/v1/books` | None (Public) | Query: `search, category, condition, minPrice, maxPrice, page, limit` | `{ books: Book[], meta: { page, limit, total, pages } }` | 200 | `BooksService.getBooks()` |
| **GET** | `/api/v1/books/:slug` | None (Public) | Params: `slug` | `{ book: BookCatalog & Listings }` | 200, 404 | `BooksService.getBookBySlug()` |
| **POST** | `/api/v1/books` | Auth Required (Seller/Admin) | `createBookSchema` | `{ book: BookListingDocument }` | 201, 400, 401 | `BooksService.createBook()` |
| **PATCH** | `/api/v1/books/:id` | Auth Required (Seller/Admin) | `updateBookSchema` | `{ book: BookListingDocument }` | 200, 403, 404 | `BooksService.updateBook()` |
| **DELETE**| `/api/v1/books/:id` | Auth Required (Seller/Admin) | Params: `id` | `{ message: "Listing deleted" }` | 200, 403, 404 | `BooksService.deleteBook()` |
| **GET** | `/api/v1/categories` | None (Public) | None | `{ categories: Category[] }` | 200 | `CategoriesService.getAllCategories()` |
| **POST** | `/api/v1/categories` | Auth Required (Admin) | `{ name, slug, description }` | `{ category: Category }` | 201, 400, 403 | `CategoriesService.createCategory()` |
| **GET** | `/api/v1/cart` | Auth Required | None | `{ cart: { items: CartItem[], subtotal, shipping, total } }` | 200, 401 | `CartService.getCart()` |
| **POST** | `/api/v1/cart/items` | Auth Required | `{ listingId, quantity }` | `{ cart }` | 200, 400, 404 | `CartService.addItem()` |
| **PATCH**| `/api/v1/cart/items/:listingId` | Auth Required | `{ quantity }` | `{ cart }` | 200, 400, 404 | `CartService.updateItemQuantity()` |
| **DELETE**| `/api/v1/cart/items/:listingId` | Auth Required | Params: `listingId` | `{ cart }` | 200, 404 | `CartService.removeItem()` |
| **POST** | `/api/v1/orders` | Auth Required (Customer) | `createOrderSchema`: `{ shippingAddress, paymentMethod, items }` | `{ order: OrderDocument }` | 201, 400, 401 | `OrdersService.createOrder()` |
| **GET** | `/api/v1/orders/my-orders` | Auth Required (Customer) | Query: `page, limit` | `{ orders: Order[], meta }` | 200, 401 | `OrdersService.getUserOrders()` |
| **GET** | `/api/v1/orders/:id` | Auth Required | Params: `id` | `{ order: OrderDocument }` | 200, 403, 404 | `OrdersService.getOrderById()` |
| **PATCH**| `/api/v1/orders/:id/cancel` | Auth Required | `{ reason }` | `{ order: OrderDocument }` | 200, 400, 403 | `OrdersService.cancelOrder()` |
| **POST** | `/api/v1/orders/:id/return` | Auth Required (Customer) | `{ reason, comments }` | `{ order: OrderDocument }` | 200, 400, 403 | `OrdersService.requestReturn()` |
| **POST** | `/api/v1/payments/create-razorpay-order` | Auth Required | `{ orderId }` | `{ razorpayOrderId, amount, currency }` | 200, 400, 404 | `PaymentsService.createRazorpayOrder()` |
| **POST** | `/api/v1/payments/verify` | Auth Required | `{ orderId, razorpayOrderId, razorpayPaymentId, razorpaySignature }` | `{ success: true, order }` | 200, 400 | `PaymentsService.verifyPayment()` |
| **POST** | `/api/v1/payments/webhook` | Razorpay Signature | Razorpay Webhook Body | `{ received: true }` | 200, 400 | `PaymentsController.handleWebhook()` |
| **GET** | `/api/v1/wishlist` | Auth Required | None | `{ items: BookListing[] }` | 200, 401 | `WishlistService.getUserWishlist()` |
| **POST** | `/api/v1/wishlist/toggle` | Auth Required | `{ listingId }` | `{ inWishlist: boolean }` | 200, 401 | `WishlistService.toggleWishlist()` |
| **GET** | `/api/v1/reviews/book/:bookId` | None (Public) | Params: `bookId` | `{ reviews: Review[], ratingAvg, ratingCount }` | 200 | `ReviewsService.getBookReviews()` |
| **POST** | `/api/v1/reviews` | Auth Required | `{ bookId, rating, title, comment }` | `{ review: Review }` | 201, 400, 401 | `ReviewsService.createReview()` |
| **GET** | `/api/v1/recommendations/home` | None (Public) | Query: `limit` | `{ popular: Book[], trending: Book[] }` | 200 | `RecommendationsService.getHomeRecommendations()` |
| **GET** | `/api/v1/recommendations/:bookId` | None (Public) | Params: `bookId` | `{ frequentlyBoughtTogether: Book[] }` | 200 | `RecommendationsService.getBookRecommendations()` |
| **POST** | `/api/v1/events/view` | None (Public) | `{ bookId, userId? }` | `{ success: true }` | 202 | `EventsController.trackView()` |
| **PATCH**| `/api/v1/users/seller-payout` | Auth Required (Seller) | `{ upiId, ifscCode, accountName, accountNumber }` | `{ sellerProfile: SellerProfile }` | 200, 400, 401 | `UsersService.updateSellerPayout()` |
| **POST** | `/api/v1/contact` | None (Public) | `{ name, email, subject, message }` | `{ ticketId }` | 201, 400 | `ContactService.submitContactForm()` |
| **GET** | `/api/v1/contact/cms` | None (Public) | None | `{ announcementText, announcementEnabled, faqs }` | 200 | `ContactController.getPublicCms()` |
| **GET** | `/api/v1/admin/dashboard` | Admin Required | None | `{ totalUsers, activeListings, totalOrders, grossMerchandiseValue }` | 200, 403 | `AdminService.getDashboardStats()` |
| **GET** | `/api/v1/admin/users` | Admin Required | Query: `search, role, page, limit` | `{ users: User[], meta }` | 200, 403 | `AdminService.getUsers()` |
| **PATCH**| `/api/v1/admin/users/:id/ban` | Admin Required | Params: `id` | `{ user }` | 200, 403 | `AdminService.toggleUserBan()` |
| **GET** | `/api/v1/admin/listings` | Admin Required | Query: `status, search, page, limit` | `{ listings: Listing[], meta }` | 200, 403 | `AdminService.getListings()` |
| **PATCH**| `/api/v1/admin/listings/:id/moderate` | Admin Required | `{ status, rejectionReason }` | `{ listing }` | 200, 403 | `AdminService.moderateListing()` |
| **GET** | `/api/v1/admin/orders` | Admin Required | Query: `status` | `{ orders: Order[] }` | 200, 403 | `OrdersService.getAdminOrders()` |
| **PATCH**| `/api/v1/admin/orders/:id/status` | Admin Required | `{ status, note }` | `{ order }` | 200, 403 | `OrdersService.updateOrderStatus()` |
| **PATCH**| `/api/v1/admin/orders/:id/return/resolve` | Admin Required | `{ action, adminNote }` | `{ order }` | 200, 403 | `OrdersService.resolveReturn()` |
| **GET** | `/api/v1/admin/cms` | Admin Required | None | `{ announcementText, announcementEnabled, faqs }` | 200, 403 | `AdminService.getCms()` |
| **PATCH**| `/api/v1/admin/cms` | Admin Required | `{ announcementText, announcementEnabled, faqs }` | `{ cms }` | 200, 403 | `AdminService.updateCms()` |
| **GET** | `/api/v1/admin/coupons` | Admin Required | None | `{ coupons: Coupon[] }` | 200, 403 | `AdminService.getCoupons()` |
| **POST** | `/api/v1/admin/coupons` | Admin Required | `{ code, discountType, discountValue, minOrderSubtotal }` | `{ coupon }` | 201, 400, 403 | `AdminService.createCoupon()` |
| **DELETE**| `/api/v1/admin/coupons/:id` | Admin Required | Params: `id` | `{ deleted: true }` | 200, 403 | `AdminService.deleteCoupon()` |
| **GET** | `/api/v1/admin/settings` | Admin Required | None | `{ commissionPercent, flatShippingFee, taxPercent }` | 200, 403 | `AdminService.getPlatformSettings()` |
| **PATCH**| `/api/v1/admin/settings` | Admin Required | `{ commissionPercent, flatShippingFee, taxPercent }` | `{ settings }` | 200, 403 | `AdminService.updatePlatformSettings()` |
| **GET** | `/api/v1/admin/reports/export` | Admin Required | None | CSV File Stream | 200, 403 | `AdminService.exportCsvReport()` |
| **GET** | `/api/v1/admin/queues/*` | Admin Required | None | Bull Board Express UI Dashboard | 200, 403 | `Bull Board Adapter` |

---

## 2. Middleware Pipeline Inventory

1. **`auth.middleware.ts` (`requireAuth`)**: Verifies JWT access token passed in `Authorization: Bearer <token>` header or httpOnly cookie. Sets `req.user`.
2. **`rbac.middleware.ts` (`requireRoles(roles)`)**: Enforces Role-Based Access Control (`customer`, `seller`, `admin`). Returns `403 Forbidden` if role missing.
3. **`validate.middleware.ts` (`validate({ body, query, params })`)**: Executes Zod schema validation against HTTP inputs. Returns `400 Bad Request` with detailed Zod issues if validation fails.
4. **`error.middleware.ts` (`errorHandler`)**: Global Express error handler mapping `AppError` subclasses (`NotFoundError`, `ValidationError`, `UnauthorizedError`) to structured JSON API error payloads.
5. **`rateLimiter.middleware.ts`**: Rate limiting helper module using `express-rate-limit`.
   - *Status*: Middleware defined in `middlewares/rateLimiter.middleware.ts`. Not globally mounted in `app.ts` root router; mounted selectively on auth endpoints.

---

## 3. BullMQ Background Workers Schedule (`apps/api/src/jobs`)

BookFry runs 4 BullMQ queues backed by Redis (`ioredis` client with `maxRetriesPerRequest: null`):

1. **`pageViewQueue` (`pageView.worker.ts`)**:
   - *Trigger*: Asynchronous fire-and-forget payload sent by `POST /api/v1/events/view`.
   - *Action*: Updates user recent view history buffer in Redis and increments `viewsCount` on the book catalog record in MongoDB.
2. **`recommendationsQueue` (`recommendations.worker.ts`)**:
   - *Trigger*: Repeatable background schedule running every 15 minutes.
   - *Action*: Computes `popular:books` sorted set and `trending:books` velocity sorted set using a 72-hour sliding window with exponential decay. Also computes co-occurrence pairs (`cooccurs:<bookId>`).
3. **`orderSlaQueue` (`orderSla.worker.ts`)**:
   - *Trigger*: Repeatable background schedule running every 1 hour.
   - *Action*: Checks for unshipped orders older than 48 hours to trigger SLA alerts. Auto-releases seller escrow payouts for delivered orders older than 7 days.
4. **`emailQueue` (`workers/email.worker.ts`)**:
   - *Trigger*: Asynchronous event payload dispatched upon order confirmation or seller sale notification.
   - *Action*: Renders HTML email templates via `EmailService` and delivers via Resend API or SMTP transport.
