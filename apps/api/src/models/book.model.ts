import mongoose, { Schema, Document } from 'mongoose';
import { BookCondition, BookStatus } from '@bookmarket/types';

export interface IBookDocument extends Document {
  title: string;
  slug: string;
  author: string;
  isbn: string;
  description: string;
  category: mongoose.Types.ObjectId;
  condition: BookCondition;
  price: number;
  discountPrice?: number;
  images: Array<{ url: string; publicId: string }>;
  stock: number;
  sellerId: mongoose.Types.ObjectId;
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
  moderationHistory?: Array<{
    status: BookStatus;
    notes?: string;
    moderatorId?: mongoose.Types.ObjectId;
    timestamp: Date;
  }>;
  createdAt: Date;
  updatedAt: Date;
}

const BookSchema = new Schema<IBookDocument>(
  {
    title: { type: String, required: true },
    slug: { type: String, required: true, unique: true, index: true, lowercase: true, trim: true },
    author: { type: String, required: true },
    isbn: { type: String, required: true },
    description: { type: String, required: true },
    category: { type: Schema.Types.ObjectId, ref: 'Category', required: true },
    condition: {
      type: String,
      enum: ['new', 'like_new', 'good', 'fair'],
      required: true,
    },
    price: { type: Number, required: true, min: 0 },
    discountPrice: { type: Number, min: 0 },
    images: {
      type: [{ url: String, publicId: String }],
      default: [],
    },
    stock: { type: Number, required: true, min: 0, default: 1 },
    sellerId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    status: {
      type: String,
      enum: ['draft', 'pending', 'active', 'rejected', 'archived', 'sold', 'removed'],
      default: 'pending',
      index: true,
    },
    tags: { type: [String], default: [] },
    language: { type: String, required: true, default: 'English' },
    publisher: { type: String },
    edition: { type: String },
    pageCount: { type: Number },
    ratingAvg: { type: Number, default: 0, min: 0, max: 5 },
    ratingCount: { type: Number, default: 0, min: 0 },
    viewsCount: { type: Number, default: 0, min: 0 },
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
  {
    timestamps: true,
  }
);

// Search and Query Indexes
BookSchema.index({ title: 'text', author: 'text', description: 'text', tags: 'text' });
BookSchema.index({ category: 1, status: 1, price: 1 });

export const BookModel = mongoose.model<IBookDocument>('Book', BookSchema);
export default BookModel;
