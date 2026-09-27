import mongoose, { Schema, Document } from 'mongoose';

export interface ISettingAuditEntry {
  key: string;
  oldValue: any;
  newValue: any;
  changedBy: string;
  changedAt: Date;
}

export interface IPlatformSettingsDocument extends Document {
  commissionPercent: number;
  flatShippingFee: number;
  taxPercent: number;
  returnWindowDays: number;
  maintenanceMode: boolean;
  supportEmail: string;
  supportPhone: string;
  sellerRegistrationEnabled: boolean;
  sellerLoginEnabled: boolean;
  auditLog: ISettingAuditEntry[];
  updatedAt: Date;
}

const SettingAuditSchema = new Schema<ISettingAuditEntry>(
  {
    key: { type: String, required: true },
    oldValue: { type: Schema.Types.Mixed },
    newValue: { type: Schema.Types.Mixed },
    changedBy: { type: String, required: true },
    changedAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const PlatformSettingsSchema = new Schema<IPlatformSettingsDocument>(
  {
    commissionPercent: { type: Number, default: 10 },
    flatShippingFee: { type: Number, default: 40 },
    taxPercent: { type: Number, default: 18 },
    returnWindowDays: { type: Number, default: 7 },
    maintenanceMode: { type: Boolean, default: false },
    supportEmail: { type: String, default: 'support@bookfry.com' },
    supportPhone: { type: String, default: '+91 98765 43210' },
    sellerRegistrationEnabled: { type: Boolean, default: false },
    sellerLoginEnabled: { type: Boolean, default: false },
    auditLog: { type: [SettingAuditSchema], default: [] },
  },
  { timestamps: true }
);

export const PlatformSettingsModel = mongoose.model<IPlatformSettingsDocument>(
  'PlatformSettings',
  PlatformSettingsSchema
);
export default PlatformSettingsModel;
