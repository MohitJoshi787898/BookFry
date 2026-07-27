import mongoose, { Schema, Document } from 'mongoose';

export interface ICartItem {
  listingId: mongoose.Types.ObjectId;
  quantity: number;
  priceSnapshot: number;
}

export interface ICartDocument extends Document {
  userId: mongoose.Types.ObjectId;
  items: ICartItem[];
  createdAt: Date;
  updatedAt: Date;
}

const CartItemSchema = new Schema<ICartItem>({
  listingId: { type: Schema.Types.ObjectId, ref: 'BookListing', required: true },
  quantity: { type: Number, required: true, min: 1 },
  priceSnapshot: { type: Number, required: true, min: 0 },
});

const CartSchema = new Schema<ICartDocument>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
      index: true,
    },
    items: [CartItemSchema],
  },
  { timestamps: true }
);

export const CartModel = mongoose.model<ICartDocument>('Cart', CartSchema);
export default CartModel;
