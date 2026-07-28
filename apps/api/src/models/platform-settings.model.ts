import mongoose, { Schema, Document } from 'mongoose';

export interface IPlatformSettingsDocument extends Document {
  commissionPercent: number;
  flatShippingFee: number;
  taxPercent: number;
  returnWindowDays: number;
  maintenanceMode: boolean;
  supportEmail: string;
  supportPhone: string;
  updatedAt: Date;
}

const PlatformSettingsSchema = new Schema<IPlatformSettingsDocument>(
  {
    commissionPercent: { type: Number, default: 10 },
    flatShippingFee: { type: Number, default: 40 },
    taxPercent: { type: Number, default: 18 },
    returnWindowDays: { type: Number, default: 7 },
    maintenanceMode: { type: Boolean, default: false },
    supportEmail: { type: String, default: 'support@bookfry.com' },
    supportPhone: { type: String, default: '+91 98765 43210' },
  },
  { timestamps: true }
);

export const PlatformSettingsModel = mongoose.model<IPlatformSettingsDocument>(
  'PlatformSettings',
  PlatformSettingsSchema
);
export default PlatformSettingsModel;
