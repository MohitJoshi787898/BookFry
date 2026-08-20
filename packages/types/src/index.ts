export type UserRole = 'customer' | 'seller' | 'admin';

export interface Address {
  _id?: string;
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  isDefault: boolean;
}

export interface CreateIntentResult {
  clientSecret: string;
  id: string;
  keyId?: string;
  amount?: number;
  currency?: string;
}

export interface SellerProfile {
  storeName: string;
  bio?: string;
  rating: number;
  totalSales: number;
  payoutDetails?: {
    accountNumber?: string;
    routingNumber?: string;
    bankName?: string;
    upiId?: string;
    ifscCode?: string;
    accountName?: string;
  };
}

export interface User {
  id: string;
  name: string;
  email: string;
  roles: UserRole[];
  avatarUrl?: string;
  phone?: string;
  isEmailVerified: boolean;
  isBanned: boolean;
  addresses: Address[];
  sellerProfile: SellerProfile | null;
  createdAt: string;
  updatedAt: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data: T | null;
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
    [key: string]: any;
  };
  error: {
    code: string;
    message: string;
    details?: any[];
  } | null;
}

export interface AuthResponseData {
  user: Omit<User, 'createdAt' | 'updatedAt' | 'addresses'>;
  accessToken: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  parentId?: string | null;
  imageUrl?: string;
  order: number;
}

export interface BookImage {
  url: string;
  publicId: string;
}

export type BookCondition = 'new' | 'like_new' | 'good' | 'fair';
export type BookStatus =
  | 'draft'
  | 'pending'
  | 'active'
  | 'rejected'
  | 'archived'
  | 'sold'
  | 'removed';

export interface ModerationHistoryItem {
  status: BookStatus;
  notes?: string;
  moderatorId?: string;
  timestamp: string;
}

export type UsedBookRequestStatus =
  | 'requested'
  | 'seller_notified'
  | 'seller_contacted_buyer'
  | 'accepted'
  | 'declined'
  | 'in_discussion'
  | 'completed'
  | 'cancelled'
  | 'expired';

export interface UsedBookRequestTimeline {
  status: UsedBookRequestStatus;
  note?: string;
  timestamp: string;
}

export interface UsedBookRequest {
  id: string;
  requestNumber: string;
  buyerId: string;
  sellerId: string;
  listingId: string;
  catalogId: string;
  title: string;
  price: number;
  condition: BookCondition;
  buyerContact: {
    name: string;
    email: string;
    phone?: string;
    whatsappPhone?: string;
    note?: string;
  };
  sellerName?: string;
  sellerCity?: string;
  sellerState?: string;
  status: UsedBookRequestStatus;
  timeline: UsedBookRequestTimeline[];
  createdAt: string;
  updatedAt: string;
}

export type ConditionFilterType = 'all' | 'new' | 'used';

export interface Book {
  id: string;
  title: string;
  slug: string;
  author: string;
  isbn: string;
  description: string;
  category: string; // Category ID
  condition: BookCondition;
  price: number;
  discountPrice?: number;
  images: BookImage[];
  stock: number;
  sellerId: string;
  sellerName?: string;
  sellerCity?: string;
  sellerState?: string;
  sellerPincode?: string;
  distanceKm?: number;
  status: BookStatus;
  tags: string[];
  language: string;
  publisher?: string;
  edition?: string;
  pageCount?: number;
  ratingAvg: number;
  ratingCount: number;
  viewsCount: number;
  rejectionReason?: string;
  moderationHistory?: ModerationHistoryItem[];
  lowestPrice?: number;
  listingCount?: number;
  createdAt: string;
  updatedAt: string;
}

/** Canonical book record — one per ISBN, shared across all sellers */
export interface BookCatalog {
  id: string;
  slug: string;
  title: string;
  author: string;
  isbn: string;
  description: string;
  category: string;
  images: BookImage[];
  tags: string[];
  language: string;
  publisher?: string;
  edition?: string;
  pageCount?: number;
  ratingAvg: number;
  ratingCount: number;
  viewsCount: number;
  /** Computed: cheapest active listing price */
  lowestPrice?: number;
  /** Computed: number of active seller listings */
  listingCount?: number;
  createdAt: string;
  updatedAt: string;
}

/** Per-seller inventory record — references a BookCatalog */
export interface BookListing {
  id: string;
  catalogId: string;
  sellerId: string;
  sellerName?: string;
  sellerCity?: string;
  sellerState?: string;
  sellerPincode?: string;
  distanceKm?: number;
  /** Populated when fetching for buyer view */
  catalog?: BookCatalog;
  condition: BookCondition;
  price: number;
  discountPrice?: number;
  stock: number;
  status: BookStatus;
  rejectionReason?: string;
  moderationHistory?: ModerationHistoryItem[];
  createdAt: string;
  updatedAt: string;
}

export interface CartItem {
  listingId: string;
  bookId?: string;
  quantity: number;
  priceSnapshot: number;
  listingDetail?: {
    id: string;
    condition: BookCondition;
    price: number;
    stock: number;
    sellerId: string;
    catalog?: {
      title: string;
      author: string;
      isbn: string;
      images: BookImage[];
      slug: string;
    };
  };
  bookDetail?: any;
}

export interface Cart {
  id: string;
  userId: string;
  items: CartItem[];
  updatedAt: string;
}

export type OrderStatus =
  | 'pending'
  | 'confirmed'
  | 'shipped'
  | 'delivered'
  | 'cancelled'
  | 'refunded'
  | 'return_requested'
  | 'return_approved'
  | 'return_rejected';

export interface ReturnRequest {
  reason: string;
  requestedAt: string;
  status: 'pending' | 'approved' | 'rejected';
  adminNote?: string;
  resolvedAt?: string;
}

export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded';

export interface OrderItem {
  listingId: string;
  bookId: string;
  sellerId: string;
  title: string;
  price: number;
  quantity: number;
  condition: BookCondition;
}

export interface OrderTimeline {
  status: OrderStatus;
  note?: string;
  timestamp: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  buyerId: string;
  items: OrderItem[];
  shippingAddress: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  subtotal: number;
  discountAmount?: number;
  couponCode?: string;
  shippingFee: number;
  tax: number;
  total: number;
  currency: string;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  paymentRef?: string;
  returnRequest?: ReturnRequest;
  timeline: OrderTimeline[];
  createdAt: string;
  updatedAt: string;
}

export interface Wishlist {
  id: string;
  userId: string;
  bookIds: string[];
}

export interface Review {
  id: string;
  bookId: string;
  authorId: string;
  authorName: string;
  orderId: string;
  rating: number;
  comment: string;
  sellerReply?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Notification {
  id: string;
  userId: string;
  type: string;
  title: string;
  body: string;
  isRead: boolean;
  meta?: Record<string, any>;
  createdAt: string;
}

export interface Transaction {
  id: string;
  orderId: string;
  sellerId: string;
  amount: number;
  platformFee: number;
  netPayout: number;
  status: 'pending' | 'released' | 'withdrawn';
  createdAt: string;
  updatedAt: string;
}

export interface SellerAnalytics {
  totalSales: number;
  totalEarnings: number;
  activeListingsCount: number;
  salesByMonth: { month: string; amount: number }[];
  recentOrders: Order[];
}
