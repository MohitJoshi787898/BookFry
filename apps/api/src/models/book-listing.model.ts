import mongoose, { Schema, Document } from 'mongoose';
import { BookCondition, BookStatus } from '@bookmarket/types';

export interface IModerationHistoryItem {
  status: BookStatus;
  notes?: string;
  moderatorId?: mongoose.Types.ObjectId;
  timestamp: Date;
}

export interface IBookListingDocument extends Document {
  catalogId: mongoose.Types.ObjectId;
  sellerId: mongoose.Types.ObjectId;
  condition: BookCondition;
  price: number;
  discountPrice?: number;
  stock: number;
  status: BookStatus;
  city?: string;
  state?: string;
  pincode?: string;
  rejectionReason?: string;
  moderationHistory: IModerationHistoryItem[];
  createdAt: Date;
  updatedAt: Date;
}

const BookListingSchema = new Schema<IBookListingDocument>(
  {
    catalogId: {
      type: Schema.Types.ObjectId,
      ref: 'BookCatalog',
      required: true,
      index: true,
    },
    sellerId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    condition: {
      type: String,
      enum: ['new', 'like_new', 'good', 'fair'],
      required: true,
    },
    price: { type: Number, required: true, min: 0 },
    discountPrice: { type: Number, min: 0 },
    stock: { type: Number, required: true, min: 0, default: 1 },
    city: { type: String, trim: true },
    state: { type: String, trim: true },
    pincode: { type: String, trim: true },
    status: {
      type: String,
      enum: ['draft', 'pending', 'active', 'rejected', 'archived', 'sold', 'removed'],
      default: 'pending',
      index: true,
    },
    rejectionReason: { type: String },
    moderationHistory: [
      {
        status: { type: String, required: true },
        notes: { type: String },
        moderatorId: { type: Schema.Types.ObjectId, ref: 'User' },
        timestamp: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true }
);

/**
 * Core constraint: one listing per seller per catalog entry.
 * A seller cannot list the same ISBN twice — they update their existing listing instead.
 */
BookListingSchema.index({ catalogId: 1, sellerId: 1 }, { unique: true });
BookListingSchema.index({ status: 1, price: 1 });

export const BookListingModel = mongoose.model<IBookListingDocument>(
  'BookListing',
  BookListingSchema
);
export default BookListingModel;
