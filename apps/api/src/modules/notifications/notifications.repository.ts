import { NotificationModel, INotificationDocument } from '../../models/notification.model';
import mongoose from 'mongoose';

export class NotificationsRepository {
  async findByUserId(userId: string): Promise<INotificationDocument[]> {
    return NotificationModel.find({ userId: new mongoose.Types.ObjectId(userId) })
      .sort({ createdAt: -1 })
      .exec();
  }

  async findById(id: string): Promise<INotificationDocument | null> {
    return NotificationModel.findById(id).exec();
  }

  async findByIdempotencyKey(key: string): Promise<INotificationDocument | null> {
    return NotificationModel.findOne({ idempotencyKey: key }).exec();
  }

  async create(data: Partial<INotificationDocument>): Promise<INotificationDocument> {
    const doc = new NotificationModel(data);
    return doc.save();
  }

  async updateReadStatus(id: string, isRead: boolean): Promise<INotificationDocument | null> {
    return NotificationModel.findByIdAndUpdate(id, { isRead }, { new: true }).exec();
  }

  async countUnread(userId: string): Promise<number> {
    return NotificationModel.countDocuments({
      userId: new mongoose.Types.ObjectId(userId),
      isRead: false,
    });
  }

  async markAllAsRead(userId: string): Promise<void> {
    await NotificationModel.updateMany(
      {
        userId: new mongoose.Types.ObjectId(userId),
        isRead: false,
      },
      {
        $set: { isRead: true },
      }
    ).exec();
  }
}
export default NotificationsRepository;
