# Database Schema & Mongoose Models Reference

---

## 1. Mongoose Collections & Schema Inventory (`apps/api/src/models`)

BookFry utilizes MongoDB as its primary datastore managed via Mongoose ODM schemas across 16 collection models.

### Model 1: `UserModel` (`user.model.ts`)
- **Collection Name**: `users`
- **Fields**:
  - `name`: `String` (Required, trim)
  - `email`: `String` (Required, unique, lowercase, trim)
  - `passwordHash`: `String` (Required)
  - `roles`: `[String]` (Enum: `['customer', 'seller', 'admin']`, default: `['customer']`)
  - `isEmailVerified`: `Boolean` (Default: `false`)
  - `emailVerificationToken`: `String` (Optional)
  - `passwordResetToken`: `String` (Optional)
  - `passwordResetExpires`: `Date` (Optional)
  - `refreshTokenHash`: `String` (Optional)
  - `isBanned`: `Boolean` (Default: `false`)
  - `sellerProfile`: Embedded Schema:
    - `storeName`: `String`
    - `description`: `String`
    - `rating`: `Number` (Default: `0`)
    - `ratingCount`: `Number` (Default: `0`)
    - `payoutDetails`: `{ upiId?: String, ifscCode?: String, accountName?: String, accountNumber?: String }`
  - `createdAt`, `updatedAt`: `Date`
- **Declared Indexes**:
  - `email: 1` (Unique index)

### Model 2: `BookCatalogModel` (`book-catalog.model.ts`)
- **Collection Name**: `bookcatalogs`
- **Fields**:
  - `isbn`: `String` (Required, unique, uppercase, trim)
  - `title`: `String` (Required, trim)
  - `slug`: `String` (Required, unique, lowercase)
  - `author`: `String` (Required, trim)
  - `publisher`: `String`
  - `publishedYear`: `Number`
  - `edition`: `String`
  - `language`: `String` (Default: `'English'`)
  - `description`: `String`
  - `coverImage`: `String`
  - `category`: `ObjectId` -> `Category`
  - `subCategory`: `String`
  - `viewsCount`: `Number` (Default: `0`)
  - `ratingAvg`: `Number` (Default: `0`)
  - `ratingCount`: `Number` (Default: `0`)
  - `createdAt`, `updatedAt`: `Date`
- **Declared Indexes**:
  - `isbn: 1` (Unique index)
  - `slug: 1` (Unique index)
  - `title: "text", author: "text", isbn: "text"` (Compound Text Search Index)

### Model 3: `BookListingModel` (`book-listing.model.ts`)
- **Collection Name**: `booklistings`
- **Fields**:
  - `catalogId`: `ObjectId` -> `BookCatalog` (Required)
  - `sellerId`: `ObjectId` -> `User` (Required)
  - `price`: `Number` (Required, min: `0`)
  - `originalPrice`: `Number` (Required)
  - `condition`: `String` (Enum: `['new', 'like_new', 'good', 'acceptable']`, Required)
  - `conditionNotes`: `String`
  - `images`: `[String]` (Required)
  - `stock`: `Number` (Required, min: `0`, default: `1`)
  - `status`: `String` (Enum: `['active', 'out_of_stock', 'sold', 'rejected', 'pending_approval']`, default: `'active'`)
  - `rejectionReason`: `String`
  - `moderationHistory`: `[{ status: String, notes: String, moderatorId: ObjectId, timestamp: Date }]`
  - `createdAt`, `updatedAt`: `Date`
- **Declared Indexes**:
  - `catalogId: 1, status: 1` (Compound Query Index)
  - `sellerId: 1` (Single Index)

### Model 4: `OrderModel` (`order.model.ts`)
- **Collection Name**: `orders`
- **Fields**:
  - `orderNumber`: `String` (Required, unique)
  - `buyerId`: `ObjectId` -> `User` (Required)
  - `sellerId`: `ObjectId` -> `User` (Required)
  - `items`: `[{ listingId: ObjectId, catalogId: ObjectId, title: String, author: String, image: String, price: Number, quantity: Number }]`
  - `subtotal`: `Number` (Required)
  - `shippingFee`: `Number` (Default: `40`)
  - `tax`: `Number` (Default: `0`)
  - `discount`: `Number` (Default: `0`)
  - `total`: `Number` (Required)
  - `status`: `String` (Enum: `['pending', 'confirmed', 'shipped', 'delivered', 'cancelled', 'returned']`, default: `'pending'`)
  - `paymentStatus`: `String` (Enum: `['unpaid', 'paid', 'refunded']`, default: `'unpaid'`)
  - `paymentMethod`: `String` (Enum: `['razorpay', 'cod']`, default: `'razorpay'`)
  - `shippingAddress`: `{ fullName: String, phone: String, addressLine1: String, addressLine2?: String, city: String, state: String, pincode: String }`
  - `courier`: `{ carrier?: String, trackingNumber?: String, shippedAt?: Date }`
  - `returnRequest`: `{ reason: String, comments: String, requestedAt: Date, status: String, adminNote?: String }`
  - `escrowStatus`: `String` (Enum: `['held', 'released', 'refunded']`, default: `'held'`)
  - `deliveredAt`: `Date`
  - `statusHistory`: `[{ status: String, note: String, updatedBy: ObjectId, timestamp: Date }]`
  - `createdAt`, `updatedAt`: `Date`
- **Declared Indexes**:
  - `orderNumber: 1` (Unique index)
  - `buyerId: 1, createdAt: -1` (Compound Query Index)
  - `sellerId: 1, createdAt: -1` (Compound Query Index)

### Model 5: `TransactionModel` (`transaction.model.ts`)
- **Collection Name**: `transactions`
- **Fields**:
  - `orderId`: `ObjectId` -> `Order` (Required)
  - `paymentId`: `String` (Required, Razorpay Payment ID)
  - `razorpayOrderId`: `String` (Required)
  - `amount`: `Number` (Required)
  - `currency`: `String` (Default: `'INR'`)
  - `status`: `String` (Enum: `['success', 'failed', 'refunded']`, default: `'success'`)
  - `createdAt`, `updatedAt`: `Date`

### Model 6: `CategoryModel` (`category.model.ts`)
- **Collection Name**: `categories`
- **Fields**: `name`, `slug` (unique), `description`, `parentCategory` (`ObjectId` -> `Category`), `icon`

### Model 7: `CartModel` (`cart.model.ts`)
- **Collection Name**: `carts`
- **Fields**: `userId` (`ObjectId` -> `User`, unique), `items`: `[{ listingId: ObjectId, quantity: Number, price: Number }]`

### Model 8: `WishlistModel` (`wishlist.model.ts`)
- **Collection Name**: `wishlists`
- **Fields**: `userId` (`ObjectId` -> `User`, unique), `items`: `[{ listingId: ObjectId, addedAt: Date }]`

### Model 9: `ReviewModel` (`review.model.ts`)
- **Collection Name**: `reviews`
- **Fields**: `bookId` (`ObjectId`), `userId` (`ObjectId`), `rating` (1-5), `title`, `comment`, `isVerifiedPurchase`

### Model 10: `NotificationModel` (`notification.model.ts`)
- **Collection Name**: `notifications`
- **Fields**: `userId` (`ObjectId`), `type`, `title`, `message`, `link`, `isRead` (boolean)

### Model 11: `ContactModel` (`contact.model.ts`)
- **Collection Name**: `contacts`
- **Fields**: `name`, `email`, `subject`, `message`, `status` (`'pending'` | `'resolved'`)

### Model 12: `CmsModel` (`cms.model.ts`)
- **Collection Name**: `cms`
- **Fields**: `announcementText`, `announcementEnabled`, `announcementLink`, `faqs`: `[{ question, answer, category }]`

### Model 13: `CouponModel` (`coupon.model.ts`)
- **Collection Name**: `coupons`
- **Fields**: `code` (unique, uppercase), `discountType`, `discountValue`, `minOrderSubtotal`, `maxUses`, `usedCount`, `status`

### Model 14: `PlatformSettingsModel` (`platform-settings.model.ts`)
- **Collection Name**: `platformsettings`
- **Fields**: `commissionPercent`, `flatShippingFee`, `taxPercent`, `returnWindowDays`, `maintenanceMode`

### Model 15: `SupportTicketModel` (`support-ticket.model.ts`)
- **Collection Name**: `supporttickets`
- **Fields**: `name`, `email`, `subject`, `message`, `status`, `adminNote`

---

## 2. Declared vs. Queried Indexes Audit

| Collection | Declared Indexes | Queried Execution Pattern | Index Coverage Assessment |
| :--- | :--- | :--- | :--- |
| `users` | `email: 1` | `findOne({ email })`, `findById(id)` | Covered cleanly. |
| `bookcatalogs` | `isbn: 1`, `slug: 1`, Text Index | `findOne({ slug })`, `$text: { $search }` | Covered cleanly. |
| `booklistings` | `catalogId: 1, status: 1`, `sellerId: 1` | `find({ catalogId, status: 'active' })` | Covered cleanly. |
| `orders` | `orderNumber: 1`, `buyerId: 1`, `sellerId: 1` | `find({ buyerId }).sort({ createdAt: -1 })` | Covered cleanly. |
| `notifications`| None declared | `find({ userId }).sort({ createdAt: -1 })` | *Recommendation*: Add compound index `userId: 1, createdAt: -1`. |
| `wishlists` | `userId: 1` | `findOne({ userId })` | Covered cleanly. |

---

## 3. Schema Drift Notes

- **Seller Payout Details**: `UserModel` embedded `sellerProfile.payoutDetails` was updated to include `ifscCode`, `accountName`, `accountNumber` alongside `upiId` to support Indian bank wire transfer payouts.
- **Order Status History**: `OrderModel` includes `statusHistory` array with `updatedBy` reference to log state machine audit trails cleanly.
