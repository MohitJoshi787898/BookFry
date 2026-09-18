import mongoose, { Schema, Document } from 'mongoose';
import { UserRole } from '@bookmarket/types';

export interface IAddress {
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  isDefault: boolean;
  location?: {
    type: 'Point';
    coordinates: [number, number]; // [longitude, latitude]
  };
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
    upiId?: string;
    ifscCode?: string;
    accountName?: string;
  };
}

export type SellerOnboardingStatus = 'incomplete' | 'complete';
export type SellerVerificationStatus = 'not_submitted' | 'pending' | 'approved' | 'rejected';

export interface IDeviceToken {
  token: string;
  platform: 'web' | 'android' | 'ios';
  deviceId?: string;
  userAgent?: string;
  lastSeenAt: Date;
  isActive: boolean;
  createdAt: Date;
}

export interface INotificationPreferences {
  orders: boolean;
  seller: boolean;
  delivery: boolean;
  marketing: boolean;
}

export interface IUserDocument extends Document {
  name: string;
  email: string;
  passwordHash: string;
  roles: UserRole[];
  avatarUrl?: string;
  avatarPublicId?: string;
  phone?: string;
  isEmailVerified: boolean;
  isBanned: boolean;
  addresses: IAddress[];
  sellerProfile: ISellerProfile | null;
  // Seller onboarding & verification state machine
  sellerOnboardingStatus?: SellerOnboardingStatus;
  sellerVerificationStatus?: SellerVerificationStatus;
  sellerVerificationSubmittedAt?: Date;
  sellerVerificationRejectionReason?: string;
  fcmTokens?: string[];
  devices?: IDeviceToken[];
  notificationPreferences?: INotificationPreferences;
  refreshTokenHash?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

const PointSchema = new Schema(
  {
    type: {
      type: String,
      enum: ['Point'],
      required: true,
      default: 'Point',
    },
    coordinates: {
      type: [Number],
      required: true,
    },
  },
  { _id: false }
);

const AddressSchema = new Schema<IAddress>({
  street: { type: String, required: true },
  city: { type: String, required: true },
  state: { type: String, required: true },
  zipCode: { type: String, required: true },
  country: { type: String, required: true },
  isDefault: { type: Boolean, default: false },
  location: {
    type: PointSchema,
    default: undefined,
    required: false,
  },
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
    upiId: { type: String },
    ifscCode: { type: String },
    accountName: { type: String },
  },
});

const UserSchema = new Schema<IUserDocument>(
  {
    name: { type: String, required: true },
    email: {
      type: String,
      required: true,
      unique: true,
      index: true,
      lowercase: true,
      trim: true,
    },
    passwordHash: { type: String, required: true },
    roles: {
      type: [String],
      enum: ['customer', 'seller', 'admin'],
      default: ['customer'],
    },
    avatarUrl: { type: String },
    avatarPublicId: { type: String },
    phone: { type: String },
    isEmailVerified: { type: Boolean, default: false },
    isBanned: { type: Boolean, default: false },
    addresses: [AddressSchema],
    sellerProfile: { type: SellerProfileSchema, default: null },
    // Seller onboarding & verification state machine.
    // Only set when user has the 'seller' role.
    sellerOnboardingStatus: {
      type: String,
      enum: ['incomplete', 'complete'],
      default: undefined,
    },
    sellerVerificationStatus: {
      type: String,
      enum: ['not_submitted', 'pending', 'approved', 'rejected'],
      default: undefined,
    },
    sellerVerificationSubmittedAt: { type: Date },
    sellerVerificationRejectionReason: { type: String },
    fcmTokens: { type: [String], default: [] },
    devices: {
      type: [
        new Schema<IDeviceToken>(
          {
            token: { type: String, required: true },
            platform: { type: String, enum: ['web', 'android', 'ios'], default: 'web' },
            deviceId: { type: String },
            userAgent: { type: String },
            lastSeenAt: { type: Date, default: Date.now },
            isActive: { type: Boolean, default: true },
            createdAt: { type: Date, default: Date.now },
          },
          { _id: false }
        ),
      ],
      default: [],
    },
    notificationPreferences: {
      orders: { type: Boolean, default: true },
      seller: { type: Boolean, default: true },
      delivery: { type: Boolean, default: true },
      marketing: { type: Boolean, default: false },
    },
    refreshTokenHash: { type: String, default: null },
  },
  {
    timestamps: true,
  }
);

export const UserModel = mongoose.model<IUserDocument>('User', UserSchema);
export default UserModel;
