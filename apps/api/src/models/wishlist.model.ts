import mongoose, { Schema, Document } from 'mongoose';

export interface IWishlistDocument extends Document {
  userId: mongoose.Types.ObjectId;
  bookIds: mongoose.Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

const WishlistSchema = new Schema<IWishlistDocument>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true, index: true },
    bookIds: [{ type: Schema.Types.ObjectId, ref: 'Book' }],
  },
  {
    timestamps: true,
  }
);

export const WishlistModel = mongoose.model<IWishlistDocument>('Wishlist', WishlistSchema);
export default WishlistModel;
