import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../../config/env';
import { sseManager } from './sse.manager';
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

  stream = async (req: Request, res: Response): Promise<void> => {
    let user = req.user;
    if (!user && req.query.token) {
      try {
        const decoded = jwt.verify(req.query.token as string, env.JWT_ACCESS_SECRET) as any;
        user = { id: decoded.userId, roles: decoded.roles || [] };
      } catch {
        res.status(401).json(ApiResponse.error('Invalid stream authentication token', 'UNAUTHORIZED'));
        return;
      }
    }

    if (!user) {
      res.status(401).json(ApiResponse.error('Authentication required for stream', 'UNAUTHORIZED'));
      return;
    }

    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache, no-transform');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('X-Accel-Buffering', 'no');
    if (typeof (res as any).flushHeaders === 'function') {
      (res as any).flushHeaders();
    }

    sseManager.addClient(user.id, user.roles || [], res);
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
