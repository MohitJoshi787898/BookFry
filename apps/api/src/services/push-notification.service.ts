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
  url?: string;
  data?: Record<string, string>;
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
      const user = await UserModel.findById(userId).select('fcmTokens name email').exec();
      if (!user || !user.fcmTokens || user.fcmTokens.length === 0) {
        logger.info(`[PushNotification] No registered device tokens for user ${userId}.`);
        return false;
      }

      return await this.sendPushToTokens(user.fcmTokens, payload, userId);
    } catch (error) {
      logger.error(`[PushNotification Error] Failed to send push to user ${userId}:`, error);
      return false;
    }
  }

  /** Send Push Notification to a list of FCM device tokens */
  async sendPushToTokens(tokens: string[], payload: PushNotificationPayload, userId?: string): Promise<boolean> {
    if (!tokens || tokens.length === 0) return false;

    logger.info(`[Push Notification Dispatch] Tokens: ${tokens.length} | Title: "${payload.title}" | Body: "${payload.body}"`);

    if (!isFirebaseInitialized || !firebaseApp) {
      logger.info(`[Push Simulation] Simulated push notification sent to ${tokens.length} device(s).`);
      return true;
    }

    try {
      const message: MulticastMessage = {
        tokens,
        notification: {
          title: payload.title,
          body: payload.body,
          imageUrl: payload.icon || 'https://bookfry.in/fox_reading_178491148655455.png',
        },
        data: {
          url: payload.url || '/account/orders',
          ...payload.data,
        },
        webpush: {
          fcmOptions: {
            link: payload.url || 'https://bookfry.in',
          },
          notification: {
            icon: 'https://bookfry.in/fox_reading_178491148655455.png',
            badge: 'https://bookfry.in/favicon.ico',
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
            $pull: { fcmTokens: { $in: invalidTokens } },
          });
          logger.info(`[PushNotification] Removed ${invalidTokens.length} expired FCM tokens for user ${userId}.`);
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
