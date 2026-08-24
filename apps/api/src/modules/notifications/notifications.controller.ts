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

  registerPushToken = async (req: Request, res: Response): Promise<void> => {
    const userId = req.user!.id;
    const { token } = req.body;
    if (!token) {
      res.status(400).json(ApiResponse.error('Push token is required', 'VALIDATION_ERROR'));
      return;
    }
    const result = await this.notificationsService.registerPushToken(userId, token);
    res.status(200).json(ApiResponse.success(result));
  };

  removePushToken = async (req: Request, res: Response): Promise<void> => {
    const userId = req.user!.id;
    const { token } = req.body;
    const result = await this.notificationsService.removePushToken(userId, token);
    res.status(200).json(ApiResponse.success(result));
  };
}
export default NotificationsController;
