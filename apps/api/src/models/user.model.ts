import mongoose, { Schema, Document } from 'mongoose';
import { UserRole } from '@bookmarket/types';

export interface IAddress {
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  isDefault: boolean;
}

export interface ISellerProfile {
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

export interface IUserDocument extends Document {
  name: string;
  email: string;
  passwordHash: string;
  roles: UserRole[];
  avatarUrl?: string;
  phone?: string;
  isEmailVerified: boolean;
  isBanned: boolean;
  addresses: IAddress[];
  sellerProfile: ISellerProfile | null;
  refreshTokenHash?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

const AddressSchema = new Schema<IAddress>({
  street: { type: String, required: true },
  city: { type: String, required: true },
  state: { type: String, required: true },
  zipCode: { type: String, required: true },
  country: { type: String, required: true },
  isDefault: { type: Boolean, default: false },
});

const SellerProfileSchema = new Schema<ISellerProfile>({
  storeName: { type: String, required: true },
  bio: { type: String },
  rating: { type: Number, default: 5.0 },
  totalSales: { type: Number, default: 0 },
  payoutDetails: {
    accountNumber: { type: String },
    routingNumber: { type: String },
    bankName: { type: String },
  },
});

const UserSchema = new Schema<IUserDocument>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, index: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
    roles: {
      type: [String],
      enum: ['customer', 'seller', 'admin'],
      default: ['customer'],
    },
    avatarUrl: { type: String },
    phone: { type: String },
    isEmailVerified: { type: Boolean, default: false },
    isBanned: { type: Boolean, default: false },
    addresses: [AddressSchema],
    sellerProfile: { type: SellerProfileSchema, default: null },
    refreshTokenHash: { type: String, default: null },
  },
  {
    timestamps: true,
  }
);

export const UserModel = mongoose.model<IUserDocument>('User', UserSchema);
export default UserModel;
