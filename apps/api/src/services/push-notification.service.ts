import { initializeApp, cert, getApps, App } from 'firebase-admin/app';
import { getMessaging, MulticastMessage, SendResponse } from 'firebase-admin/messaging';
import { env } from '../config/env';
import { logger } from '../utils/logger';
import { UserModel } from '../models/user.model';
import { pushQueue } from '../jobs/queues';

let firebaseApp: App | null = null;
let isFirebaseInitialized = false;

try {
  if (
    env.FIREBASE_PROJECT_ID &&
    env.FIREBASE_PROJECT_ID !== 'bookfry-app-dummy' &&
    env.FIREBASE_PRIVATE_KEY !== 'dummy-firebase-private-key'
  ) {
    if (getApps().length === 0) {
      firebaseApp = initializeApp({
        credential: cert({
          projectId: env.FIREBASE_PROJECT_ID,
          clientEmail: env.FIREBASE_CLIENT_EMAIL,
          privateKey: env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
        }),
      });
    } else {
      firebaseApp = getApps()[0];
    }
    isFirebaseInitialized = true;
    logger.info('[PushNotificationService] Firebase Admin SDK initialized successfully.');
  } else {
    logger.info('[PushNotificationService] Running with placeholder Firebase credentials (simulation mode).');
  }
} catch (err) {
  logger.warn('[PushNotificationService] Firebase Admin SDK init warning:', err);
}

export interface PushNotificationPayload {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  url?: string;
  tag?: string;
  data?: {
    notificationId?: string;
    type?: string;
    entityType?: string;
    entityId?: string;
    url?: string;
    [key: string]: string | undefined;
  };
}

export class PushNotificationService {
  /** Queue a push notification via BullMQ or execute immediately */
  async queuePush(userId: string, payload: PushNotificationPayload): Promise<void> {
    if (pushQueue) {
      try {
        await pushQueue.add('send_user_push', { userId, payload });
        return;
      } catch (err) {
        logger.warn('[PushNotificationService] Failed to enqueue push job, falling back to direct send:', err);
      }
    }
    await this.sendPushToUser(userId, payload);
  }

  /** Send Push Notification to all active device tokens of a user */
  async sendPushToUser(userId: string, payload: PushNotificationPayload): Promise<boolean> {
    try {
      const user = await UserModel.findById(userId).select('fcmTokens devices name email notificationPreferences').exec();
      if (!user) {
        logger.info(`[PushNotification] User ${userId} not found.`);
        return false;
      }

      // Collect active tokens from both fcmTokens and devices array
      const deviceTokens = (user.devices || [])
        .filter((d) => d.isActive && d.token)
        .map((d) => d.token);
      const directTokens = user.fcmTokens || [];
      const allTokens = Array.from(new Set([...deviceTokens, ...directTokens]));

      if (allTokens.length === 0) {
        logger.info(`[PushNotification] No registered device tokens for user ${userId}.`);
        return false;
      }

      return await this.sendPushToTokens(allTokens, payload, userId);
    } catch (error) {
      logger.error(`[PushNotification Error] Failed to send push to user ${userId}:`, error);
      return false;
    }
  }

  /** Send Push Notification to a list of FCM device tokens */
  async sendPushToTokens(tokens: string[], payload: PushNotificationPayload, userId?: string): Promise<boolean> {
    if (!tokens || tokens.length === 0) return false;

    logger.info(`[Push Notification Dispatch] User: ${userId || 'broadcast'} | Tokens: ${tokens.length} | Title: "${payload.title}" | Body: "${payload.body}"`);

    if (!isFirebaseInitialized || !firebaseApp) {
      logger.info(`[Push Simulation] Simulated push notification dispatched to ${tokens.length} device(s). Target URL: ${payload.url || '/account/orders'}`);
      return true;
    }

    try {
      // Stringify all data values for FCM compatibility
      const stringData: Record<string, string> = {
        url: payload.url || '/account/orders',
      };
      if (payload.data) {
        for (const [k, v] of Object.entries(payload.data)) {
          if (v !== undefined && v !== null) {
            stringData[k] = String(v);
          }
        }
      }

      const message: MulticastMessage = {
        tokens,
        notification: {
          title: payload.title,
          body: payload.body,
          imageUrl: payload.icon || 'https://bookfry.in/fox_reading_178491148655455.png',
        },
        data: stringData,
        webpush: {
          fcmOptions: {
            link: payload.url || 'https://bookfry.in',
          },
          notification: {
            icon: payload.icon || 'https://bookfry.in/fox_reading_178491148655455.png',
            badge: payload.badge || 'https://bookfry.in/favicon.ico',
            tag: payload.tag || 'bookfry-general',
          },
        },
      };

      const messaging = getMessaging(firebaseApp);
      const response = await messaging.sendEachForMulticast(message);
      logger.info(`[PushNotification] Sent: ${response.successCount} succeeded, ${response.failureCount} failed.`);

      // Clean up invalid or expired tokens
      if (response.failureCount > 0 && userId) {
        const invalidTokens: string[] = [];
        response.responses.forEach((res: SendResponse, idx: number) => {
          if (!res.success) {
            const errCode = res.error?.code;
            if (
              errCode === 'messaging/invalid-registration-token' ||
              errCode === 'messaging/registration-token-not-registered'
            ) {
              invalidTokens.push(tokens[idx]);
            }
          }
        });

        if (invalidTokens.length > 0) {
          await UserModel.findByIdAndUpdate(userId, {
            $pull: {
              fcmTokens: { $in: invalidTokens },
              devices: { token: { $in: invalidTokens } },
            },
          });
          logger.info(`[PushNotification] Pruned ${invalidTokens.length} expired FCM tokens from user ${userId}.`);
        }
      }

      return response.successCount > 0;
    } catch (error) {
      logger.error('[PushNotification] Error sending multicast push:', error);
      return false;
    }
  }
}

export default PushNotificationService;
