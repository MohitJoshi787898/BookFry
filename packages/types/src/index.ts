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
  createdAt: string;
  updatedAt: string;
}

export interface CartItem {
  bookId: string;
  quantity: number;
  priceSnapshot: number;
  bookDetail?: Omit<
    Book,
    | 'description'
    | 'tags'
    | 'createdAt'
    | 'updatedAt'
    | 'publisher'
    | 'edition'
    | 'pageCount'
    | 'language'
    | 'ratingAvg'
    | 'ratingCount'
    | 'viewsCount'
  >;
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
  | 'refunded';

export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded';

export interface OrderItem {
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
  shippingFee: number;
  tax: number;
  total: number;
  currency: string;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  paymentRef?: string;
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
