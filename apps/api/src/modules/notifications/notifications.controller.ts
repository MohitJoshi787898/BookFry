import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../../config/env';
import { sseManager } from './sse.manager';
import { NotificationsService } from './notifications.service';
import { ApiResponse } from '../../utils/ApiResponse';
import { EmailService } from '../../services/email.service';
import { UserModel } from '../../models/user.model';

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

  markAllRead = async (req: Request, res: Response): Promise<void> => {
    const userId = req.user!.id;
    await this.notificationsService.markAllAsRead(userId);
    res.status(200).json(ApiResponse.success({ success: true }));
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
    const { token, platform, deviceId, userAgent } = req.body;
    if (!token) {
      res.status(400).json(ApiResponse.error('Push token is required', 'VALIDATION_ERROR'));
      return;
    }
    const result = await this.notificationsService.registerPushToken(userId, token, {
      platform,
      deviceId,
      userAgent: userAgent || req.headers['user-agent'],
    });
    res.status(200).json(ApiResponse.success(result));
  };

  removePushToken = async (req: Request, res: Response): Promise<void> => {
    const userId = req.user!.id;
    const { token } = req.body;
    const result = await this.notificationsService.removePushToken(userId, token);
    res.status(200).json(ApiResponse.success(result));
  };

  getPreferences = async (req: Request, res: Response): Promise<void> => {
    const userId = req.user!.id;
    const preferences = await this.notificationsService.getPreferences(userId);
    res.status(200).json(ApiResponse.success(preferences));
  };

  updatePreferences = async (req: Request, res: Response): Promise<void> => {
    const userId = req.user!.id;
    const preferences = await this.notificationsService.updatePreferences(userId, req.body);
    res.status(200).json(ApiResponse.success(preferences));
  };

  testEmail = async (req: Request, res: Response): Promise<void> => {
    let targetEmail = req.body?.email;
    if (!targetEmail) {
      const user = await UserModel.findById(req.user!.id).select('email').exec();
      targetEmail = user?.email;
    }

    if (!targetEmail) {
      res.status(400).json(ApiResponse.error('Recipient email could not be determined', 'VALIDATION_ERROR'));
      return;
    }

    const emailService = new EmailService();
    const result = await emailService.sendRawEmail(
      targetEmail,
      'BookFry • Notification & Email Delivery Test',
      `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff; border: 1px solid #e5e7eb; border-radius: 12px; overflow: hidden;">
        <div style="background-color: #1A3B5C; padding: 24px; text-align: center;">
          <h1 style="color: #ffffff; margin: 0; font-size: 22px;">BookFry Delivery Test</h1>
          <p style="color: #F26522; font-style: italic; margin-top: 6px; font-weight: bold;">"क्योंकि.. पढ़ाई रुकनी नहीं चाहिए"</p>
        </div>
        <div style="padding: 24px;">
          <p style="font-size: 15px; color: #374151;">Hello,</p>
          <p style="font-size: 14px; color: #4b5563;">This is a test notification confirming that transactional email delivery is functioning properly for BookFry.</p>
          <div style="background-color: #f9fafb; padding: 12px 16px; border-radius: 8px; margin: 16px 0; border: 1px solid #e5e7eb;">
            <p style="margin: 0; font-size: 13px; color: #111827;"><strong>Timestamp:</strong> ${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })} IST</p>
            <p style="margin: 4px 0 0 0; font-size: 13px; color: #059669;"><strong>Status:</strong> Successfully Delivered via SMTP</p>
          </div>
        </div>
      </div>
      `
    );

    if (result.success) {
      res.status(200).json(ApiResponse.success({
        delivered: true,
        recipient: targetEmail,
        messageId: result.messageId,
      }));
    } else {
      res.status(500).json(ApiResponse.error(`Failed to send test email: ${result.error}`, 'EMAIL_SEND_FAILED'));
    }
  };

  testPush = async (req: Request, res: Response): Promise<void> => {
    const userId = req.user!.id;
    const notification = await this.notificationsService.createNotification(
      userId,
      'system_test',
      'BookFry • Push Notification Test',
      'Real-time alerts and push notifications are active and working!',
      { url: '/account/notifications', entityType: 'system', test: true },
      { sendPush: true, channel: 'both', priority: 'high' }
    );

    res.status(200).json(ApiResponse.success({
      triggered: true,
      notification,
    }));
  };
}
export default NotificationsController;
