import mongoose, { Schema, Document } from 'mongoose';
import { OrderStatus, PaymentStatus, BookCondition } from '@bookmarket/types';

export interface IOrderItem {
  listingId?: mongoose.Types.ObjectId;
  bookId: mongoose.Types.ObjectId;
  sellerId: mongoose.Types.ObjectId;
  title: string;
  price: number;
  quantity: number;
  condition: BookCondition;
}

export interface IOrderTimeline {
  status: OrderStatus;
  note?: string;
  timestamp: Date;
}

export interface IReturnRequest {
  reason: string;
  requestedAt: Date;
  status: 'pending' | 'approved' | 'rejected';
  adminNote?: string;
  resolvedAt?: Date;
}

export interface IOrderDocument extends Document {
  orderNumber: string;
  buyerId: mongoose.Types.ObjectId;
  items: IOrderItem[];
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
  returnRequest?: IReturnRequest;
  timeline: IOrderTimeline[];
  createdAt: Date;
  updatedAt: Date;
}

const OrderItemSchema = new Schema<IOrderItem>({
  listingId: { type: Schema.Types.ObjectId, ref: 'BookListing' },
  bookId: { type: Schema.Types.ObjectId },
  sellerId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  price: { type: Number, required: true, min: 0 },
  quantity: { type: Number, required: true, min: 1 },
  condition: { type: String, required: true, enum: ['new', 'like_new', 'good', 'fair'] },
});

const OrderTimelineSchema = new Schema<IOrderTimeline>({
  status: {
    type: String,
    required: true,
    enum: [
      'pending',
      'confirmed',
      'shipped',
      'delivered',
      'cancelled',
      'refunded',
      'return_requested',
      'return_approved',
      'return_rejected',
    ],
  },
  note: { type: String },
  timestamp: { type: Date, default: Date.now },
});

const ReturnRequestSchema = new Schema<IReturnRequest>(
  {
    reason: { type: String, required: true },
    requestedAt: { type: Date, default: Date.now },
    status: {
      type: String,
      required: true,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending',
    },
    adminNote: { type: String },
    resolvedAt: { type: Date },
  },
  { _id: false }
);

const ALL_STATUSES = [
  'pending',
  'confirmed',
  'shipped',
  'delivered',
  'cancelled',
  'refunded',
  'return_requested',
  'return_approved',
  'return_rejected',
];

const OrderSchema = new Schema<IOrderDocument>(
  {
    orderNumber: { type: String, required: true, unique: true, index: true },
    buyerId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    items: [OrderItemSchema],
    shippingAddress: {
      street: { type: String, required: true },
      city: { type: String, required: true },
      state: { type: String, required: true },
      zipCode: { type: String, required: true },
      country: { type: String, required: true },
    },
    subtotal: { type: Number, required: true, min: 0 },
    discountAmount: { type: Number, default: 0 },
    couponCode: { type: String },
    shippingFee: { type: Number, required: true, min: 0, default: 0 },
    tax: { type: Number, required: true, min: 0, default: 0 },
    total: { type: Number, required: true, min: 0 },
    currency: { type: String, required: true, default: 'INR' },
    status: {
      type: String,
      required: true,
      enum: ALL_STATUSES,
      default: 'pending',
      index: true,
    },
    paymentStatus: {
      type: String,
      required: true,
      enum: ['pending', 'paid', 'failed', 'refunded'],
      default: 'pending',
    },
    paymentRef: { type: String },
    returnRequest: { type: ReturnRequestSchema, default: undefined },
    timeline: { type: [OrderTimelineSchema], default: [] },
  },
  {
    timestamps: true,
  }
);

OrderSchema.index({ buyerId: 1, createdAt: -1 });
OrderSchema.index({ 'items.sellerId': 1, createdAt: -1 });

export const OrderModel = mongoose.model<IOrderDocument>('Order', OrderSchema);
export default OrderModel;
