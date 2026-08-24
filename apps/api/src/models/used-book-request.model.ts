import mongoose, { Schema, Document } from 'mongoose';
import { UsedBookRequestStatus, BookCondition } from '@bookmarket/types';

export interface IUsedBookRequestItem {
  listingId: mongoose.Types.ObjectId;
  catalogId: mongoose.Types.ObjectId;
  title: string;
  price: number;
  condition: BookCondition;
}

export interface IUsedBookRequestTimeline {
  status: UsedBookRequestStatus;
  note?: string;
  timestamp: Date;
}

export interface IUsedBookRequestDocument extends Document {
  requestNumber: string;
  buyerId: mongoose.Types.ObjectId;
  sellerId: mongoose.Types.ObjectId;
  listingId: mongoose.Types.ObjectId;
  catalogId: mongoose.Types.ObjectId;
  title: string;
  price: number;
  condition: BookCondition;
  items?: IUsedBookRequestItem[];
  totalAskingPrice?: number;
  buyerContact: {
    name: string;
    email: string;
    phone?: string;
    whatsappPhone?: string;
    note?: string;
    preferredContactMethod?: 'whatsapp' | 'phone' | 'email';
    isContactUnlocked?: boolean;
  };
  status: UsedBookRequestStatus;
  timeline: IUsedBookRequestTimeline[];
  expiresAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const UsedBookRequestItemSchema = new Schema<IUsedBookRequestItem>(
  {
    listingId: { type: Schema.Types.ObjectId, ref: 'BookListing', required: true },
    catalogId: { type: Schema.Types.ObjectId, ref: 'BookCatalog', required: true },
    title: { type: String, required: true },
    price: { type: Number, required: true, min: 0 },
    condition: {
      type: String,
      required: true,
      enum: ['new', 'like_new', 'good', 'fair'],
    },
  },
  { _id: false }
);

const UsedBookRequestTimelineSchema = new Schema<IUsedBookRequestTimeline>(
  {
    status: {
      type: String,
      required: true,
      enum: [
        'requested',
        'seller_notified',
        'seller_contacted_buyer',
        'accepted',
        'declined',
        'in_discussion',
        'completed',
        'cancelled',
        'expired',
      ],
    },
    note: { type: String },
    timestamp: { type: Date, default: Date.now },
  },
  { _id: false }
);

const UsedBookRequestSchema = new Schema<IUsedBookRequestDocument>(
  {
    requestNumber: { type: String, required: true, unique: true, index: true },
    buyerId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    sellerId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    listingId: { type: Schema.Types.ObjectId, ref: 'BookListing', required: true },
    catalogId: { type: Schema.Types.ObjectId, ref: 'BookCatalog', required: true },
    title: { type: String, required: true },
    price: { type: Number, required: true, min: 0 },
    condition: {
      type: String,
      required: true,
      enum: ['new', 'like_new', 'good', 'fair'],
    },
    items: { type: [UsedBookRequestItemSchema], default: [] },
    totalAskingPrice: { type: Number },
    buyerContact: {
      name: { type: String, required: true },
      email: { type: String, required: true },
      phone: { type: String },
      whatsappPhone: { type: String },
      note: { type: String },
      preferredContactMethod: {
        type: String,
        enum: ['whatsapp', 'phone', 'email'],
        default: 'whatsapp',
      },
      isContactUnlocked: { type: Boolean, default: false },
    },
    status: {
      type: String,
      required: true,
      enum: [
        'requested',
        'seller_notified',
        'seller_contacted_buyer',
        'accepted',
        'declined',
        'in_discussion',
        'completed',
        'cancelled',
        'expired',
      ],
      default: 'requested',
      index: true,
    },
    timeline: { type: [UsedBookRequestTimelineSchema], default: [] },
    expiresAt: { type: Date },
  },
  { timestamps: true }
);

UsedBookRequestSchema.index({ buyerId: 1, createdAt: -1 });
UsedBookRequestSchema.index({ sellerId: 1, createdAt: -1 });
UsedBookRequestSchema.index({ status: 1, createdAt: -1 });

export const UsedBookRequestModel = mongoose.model<IUsedBookRequestDocument>(
  'UsedBookRequest',
  UsedBookRequestSchema
);
export default UsedBookRequestModel;
