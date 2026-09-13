import mongoose, { Schema, Document } from 'mongoose';

export type NotificationChannel = 'in_app' | 'push' | 'both';
export type NotificationPriority = 'critical' | 'high' | 'normal' | 'low';

export interface INotificationDocument extends Document {
  userId: mongoose.Types.ObjectId;
  type: string;
  title: string;
  body: string;
  isRead: boolean;
  channel?: NotificationChannel;
  priority?: NotificationPriority;
  idempotencyKey?: string;
  meta?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

const NotificationSchema = new Schema<INotificationDocument>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    type: { type: String, required: true },
    title: { type: String, required: true },
    body: { type: String, required: true },
    isRead: { type: Boolean, required: true, default: false, index: true },
    channel: {
      type: String,
      enum: ['in_app', 'push', 'both'],
      default: 'both',
    },
    priority: {
      type: String,
      enum: ['critical', 'high', 'normal', 'low'],
      default: 'normal',
    },
    idempotencyKey: { type: String, sparse: true, index: true },
    meta: { type: Schema.Types.Mixed },
  },
  {
    timestamps: true,
  }
);

// Retrieve newest first
NotificationSchema.index({ userId: 1, createdAt: -1 });

export const NotificationModel = mongoose.model<INotificationDocument>(
  'Notification',
  NotificationSchema
);
export default NotificationModel;
