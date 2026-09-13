import { NotificationsRepository } from './notifications.repository';
import { sseManager } from './sse.manager';
import { NotFoundError, UnauthorizedError } from '../../utils/AppError';
import { Notification } from '@bookmarket/types';
import { PushNotificationService } from '../../services/push-notification.service';
import { UserModel } from '../../models/user.model';
import mongoose from 'mongoose';

export class NotificationsService {
  private notificationsRepository: NotificationsRepository;
  private pushService: PushNotificationService;

  constructor() {
    this.notificationsRepository = new NotificationsRepository();
    this.pushService = new PushNotificationService();
  }

  private mapToDTO(doc: any): Notification {
    return {
      id: doc._id.toString(),
      userId: doc.userId.toString(),
      type: doc.type,
      title: doc.title,
      body: doc.body,
      isRead: doc.isRead,
      meta: doc.meta,
      createdAt: doc.createdAt.toISOString(),
    };
  }

  async getUserNotifications(userId: string): Promise<Notification[]> {
    const docs = await this.notificationsRepository.findByUserId(userId);
    return docs.map((doc) => this.mapToDTO(doc));
  }

  async getUnreadCount(userId: string): Promise<number> {
    return this.notificationsRepository.countUnread(userId);
  }

  async markAsRead(userId: string, id: string): Promise<Notification> {
    const doc = await this.notificationsRepository.findById(id);
    if (!doc) {
      throw new NotFoundError('Notification not found');
    }

    if (doc.userId.toString() !== userId) {
      throw new UnauthorizedError('Not authorized to access this notification.');
    }

    const updated = await this.notificationsRepository.updateReadStatus(id, true);
    return this.mapToDTO(updated!);
  }

  async markAllAsRead(userId: string): Promise<void> {
    await this.notificationsRepository.markAllAsRead(userId);
  }

  async createNotification(
    userId: string,
    type: string,
    title: string,
    body: string,
    meta?: any,
    options?: {
      sendPush?: boolean;
      channel?: 'in_app' | 'push' | 'both';
      priority?: 'critical' | 'high' | 'normal' | 'low';
      idempotencyKey?: string;
      url?: string;
    }
  ): Promise<Notification> {
    // 1. Deduplication / Idempotency Check
    if (options?.idempotencyKey) {
      const existing = await this.notificationsRepository.findByIdempotencyKey(options.idempotencyKey);
      if (existing) {
        return this.mapToDTO(existing);
      }
    }

    const channel = options?.channel || 'both';
    const priority = options?.priority || 'normal';

    // 2. Persist in MongoDB if channel is in_app or both
    let doc: any;
    if (channel !== 'push') {
      doc = await this.notificationsRepository.create({
        userId: new mongoose.Types.ObjectId(userId),
        type,
        title,
        body,
        isRead: false,
        channel,
        priority,
        idempotencyKey: options?.idempotencyKey,
        meta,
      });
    }

    const dto: Notification = doc
      ? this.mapToDTO(doc)
      : {
          id: new mongoose.Types.ObjectId().toString(),
          userId,
          type,
          title,
          body,
          isRead: false,
          meta,
          createdAt: new Date().toISOString(),
        };

    // 3. Live real-time SSE stream delivery
    if (channel !== 'push') {
      try {
        sseManager.broadcastToUser(userId, 'notification:new', dto);
      } catch {
        // Non-blocking
      }
    }

    // 4. Check user notification preferences before queuing push notification
    if (options?.sendPush !== false && channel !== 'in_app') {
      const user = await UserModel.findById(userId).select('notificationPreferences').exec();
      const prefs = user?.notificationPreferences;

      let allowed = true;
      if (prefs) {
        if (type.startsWith('order_') && prefs.orders === false) allowed = false;
        if (type.startsWith('delivery_') && prefs.delivery === false) allowed = false;
        if (type.startsWith('seller_') && prefs.seller === false) allowed = false;
        if (type === 'marketing' && prefs.marketing === false) allowed = false;
      }

      if (allowed) {
        this.pushService
          .queuePush(userId, {
            title,
            body,
            url: options?.url || (meta?.url as string) || '/account/orders',
            data: {
              type,
              notificationId: dto.id,
              entityType: meta?.entityType ? String(meta.entityType) : undefined,
              entityId: meta?.entityId ? String(meta.entityId) : undefined,
              ...(meta ? Object.fromEntries(Object.entries(meta).map(([k, v]) => [k, String(v)])) : {}),
            },
          })
          .catch((err) => console.warn('[Push Notification Dispatch Warning]:', err));
      }
    }

    return dto;
  }

  /** Register or add device FCM push token for user with device metadata and cross-user deduplication */
  async registerPushToken(
    userId: string,
    token: string,
    metadata?: { platform?: 'web' | 'android' | 'ios'; deviceId?: string; userAgent?: string }
  ): Promise<{ success: boolean }> {
    if (!token || typeof token !== 'string') {
      return { success: false };
    }

    const platform = metadata?.platform || 'web';
    const now = new Date();

    // Prevent token leaks on shared devices: Remove this token from any other user
    await UserModel.updateMany(
      { _id: { $ne: new mongoose.Types.ObjectId(userId) }, fcmTokens: token },
      {
        $pull: {
          fcmTokens: token,
          devices: { token },
        },
      }
    );

    // Update current user: Add to fcmTokens and update or push to devices
    const user = await UserModel.findById(userId);
    if (!user) return { success: false };

    if (!user.fcmTokens) user.fcmTokens = [];
    if (!user.fcmTokens.includes(token)) {
      user.fcmTokens.push(token);
    }

    if (!user.devices) user.devices = [];
    const existingDevIndex = user.devices.findIndex((d) => d.token === token);
    if (existingDevIndex >= 0) {
      user.devices[existingDevIndex].lastSeenAt = now;
      user.devices[existingDevIndex].isActive = true;
      if (metadata?.deviceId) user.devices[existingDevIndex].deviceId = metadata.deviceId;
      if (metadata?.userAgent) user.devices[existingDevIndex].userAgent = metadata.userAgent;
    } else {
      user.devices.push({
        token,
        platform,
        deviceId: metadata?.deviceId,
        userAgent: metadata?.userAgent,
        lastSeenAt: now,
        isActive: true,
        createdAt: now,
      });
    }

    await user.save();
    return { success: true };
  }

  /** Remove device FCM push token when user logs out or revokes permission */
  async removePushToken(userId: string, token: string): Promise<{ success: boolean }> {
    if (!token || typeof token !== 'string') {
      return { success: false };
    }

    await UserModel.findByIdAndUpdate(userId, {
      $pull: {
        fcmTokens: token,
        devices: { token },
      },
    });

    return { success: true };
  }

  /** Get user notification preferences */
  async getPreferences(userId: string) {
    const user = await UserModel.findById(userId).select('notificationPreferences').exec();
    return (
      user?.notificationPreferences || {
        orders: true,
        seller: true,
        delivery: true,
        marketing: false,
      }
    );
  }

  /** Update user notification preferences */
  async updatePreferences(
    userId: string,
    preferences: Partial<{ orders: boolean; seller: boolean; delivery: boolean; marketing: boolean }>
  ) {
    const updateQuery: Record<string, boolean> = {};
    if (typeof preferences.orders === 'boolean') updateQuery['notificationPreferences.orders'] = preferences.orders;
    if (typeof preferences.seller === 'boolean') updateQuery['notificationPreferences.seller'] = preferences.seller;
    if (typeof preferences.delivery === 'boolean') updateQuery['notificationPreferences.delivery'] = preferences.delivery;
    if (typeof preferences.marketing === 'boolean') updateQuery['notificationPreferences.marketing'] = preferences.marketing;

    const user = await UserModel.findByIdAndUpdate(
      userId,
      { $set: updateQuery },
      { new: true, upsert: false }
    ).select('notificationPreferences').exec();

    return (
      user?.notificationPreferences || {
        orders: true,
        seller: true,
        delivery: true,
        marketing: false,
      }
    );
  }
}
export default NotificationsService;
