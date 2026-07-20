import { Request, Response } from 'express';
import { NotificationsService } from './notifications.service';
import { ApiResponse } from '../../utils/ApiResponse';

export class NotificationsController {
  private notificationsService: NotificationsService;

  constructor() {
    this.notificationsService = new NotificationsService();
  }

  list = async (req: Request, res: Response): Promise<void> => {
    const userId = req.user!.id;
    const notifications = await this.notificationsService.getUserNotifications(userId);
    res.status(200).json(ApiResponse.success(notifications));
  };

  unreadCount = async (req: Request, res: Response): Promise<void> => {
    const userId = req.user!.id;
    const count = await this.notificationsService.getUnreadCount(userId);
    res.status(200).json(ApiResponse.success({ count }));
  };

  markRead = async (req: Request, res: Response): Promise<void> => {
    const userId = req.user!.id;
    const { id } = req.params;
    const notification = await this.notificationsService.markAsRead(userId, id);
    res.status(200).json(ApiResponse.success(notification));
  };
}
export default NotificationsController;
