import mongoose, { Schema, Document } from 'mongoose';

export interface IReviewDocument extends Document {
  bookId: mongoose.Types.ObjectId;
  authorId: mongoose.Types.ObjectId;
  authorName: string;
  orderId: mongoose.Types.ObjectId;
  rating: number;
  comment: string;
  sellerReply?: string;
  createdAt: Date;
  updatedAt: Date;
}

const ReviewSchema = new Schema<IReviewDocument>(
  {
    bookId: { type: Schema.Types.ObjectId, ref: 'Book', required: true, index: true },
    authorId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    authorName: { type: String, required: true },
    orderId: { type: Schema.Types.ObjectId, ref: 'Order', required: true, index: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, required: true, trim: true },
    sellerReply: { type: String, trim: true },
  },
  {
    timestamps: true,
  }
);

// Enforce unique review per purchase
ReviewSchema.index({ bookId: 1, authorId: 1, orderId: 1 }, { unique: true });

export const ReviewModel = mongoose.model<IReviewDocument>('Review', ReviewSchema);
export default ReviewModel;
