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

  async createNotification(
    userId: string,
    type: string,
    title: string,
    body: string,
    meta?: any,
    options?: { sendPush?: boolean }
  ): Promise<Notification> {
    const doc = await this.notificationsRepository.create({
      userId: new mongoose.Types.ObjectId(userId),
      type,
      title,
      body,
      isRead: false,
      meta,
    });

    const dto = this.mapToDTO(doc);

    // Live real-time SSE stream delivery
    try {
      sseManager.broadcastToUser(userId, 'notification:new', dto);
    } catch {
      // Non-blocking
    }

    // Automatically trigger Web/Mobile Push notification asynchronously
    if (options?.sendPush !== false) {
      this.pushService
        .queuePush(userId, {
          title,
          body,
          data: {
            type,
            ...(meta ? Object.fromEntries(Object.entries(meta).map(([k, v]) => [k, String(v)])) : {}),
          },
        })
        .catch((err) => console.warn('[Push Notification Dispatch Warning]:', err));
    }

    return dto;
  }

  /** Register or add device FCM push token for user */
  async registerPushToken(userId: string, token: string): Promise<{ success: boolean }> {
    if (!token || typeof token !== 'string') {
      return { success: false };
    }

    await UserModel.findByIdAndUpdate(userId, {
      $addToSet: { fcmTokens: token },
    });

    return { success: true };
  }

  /** Remove device FCM push token when user logs out or revokes permission */
  async removePushToken(userId: string, token: string): Promise<{ success: boolean }> {
    if (!token || typeof token !== 'string') {
      return { success: false };
    }

    await UserModel.findByIdAndUpdate(userId, {
      $pull: { fcmTokens: token },
    });

    return { success: true };
  }
}
export default NotificationsService;
