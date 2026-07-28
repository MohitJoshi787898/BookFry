import mongoose, { Schema, Document } from 'mongoose';

export interface ICouponDocument extends Document {
  code: string;
  discountType: 'percentage' | 'flat';
  discountValue: number;
  minOrderSubtotal: number;
  maxUses: number;
  usedCount: number;
  expiryDate?: Date;
  status: 'active' | 'expired' | 'disabled';
  createdAt: Date;
  updatedAt: Date;
}

const CouponSchema = new Schema<ICouponDocument>(
  {
    code: { type: String, required: true, unique: true, uppercase: true, trim: true },
    discountType: { type: String, enum: ['percentage', 'flat'], required: true },
    discountValue: { type: Number, required: true },
    minOrderSubtotal: { type: Number, default: 0 },
    maxUses: { type: Number, default: 1000 },
    usedCount: { type: Number, default: 0 },
    expiryDate: { type: Date },
    status: { type: String, enum: ['active', 'expired', 'disabled'], default: 'active' },
  },
  { timestamps: true }
);

export const CouponModel = mongoose.model<ICouponDocument>('Coupon', CouponSchema);
export default CouponModel;
