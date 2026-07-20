import { NotificationsRepository } from './notifications.repository';
import { NotFoundError, UnauthorizedError } from '../../utils/AppError';
import { Notification } from '@bookmarket/types';
import mongoose from 'mongoose';

export class NotificationsService {
  private notificationsRepository: NotificationsRepository;

  constructor() {
    this.notificationsRepository = new NotificationsRepository();
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
    meta?: any
  ): Promise<Notification> {
    const doc = await this.notificationsRepository.create({
      userId: new mongoose.Types.ObjectId(userId),
      type,
      title,
      body,
      isRead: false,
      meta,
    });
    return this.mapToDTO(doc);
  }
}
export default NotificationsService;
