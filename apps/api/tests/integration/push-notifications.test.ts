import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import request from 'supertest';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import app from '../../src/app';
import { UserModel } from '../../src/models/user.model';
import { NotificationModel } from '../../src/models/notification.model';
import { NotificationsService } from '../../src/modules/notifications/notifications.service';
import { PushNotificationService } from '../../src/services/push-notification.service';
import jwt from 'jsonwebtoken';
import { env } from '../../src/config/env';

describe('Production Push Notifications & Unified Event Platform', () => {
  let mongoServer: MongoMemoryServer;
  let notificationsService: NotificationsService;
  let pushService: PushNotificationService;

  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();
    await mongoose.connect(uri);
    notificationsService = new NotificationsService();
    pushService = new PushNotificationService();
  }, 60000);

  afterAll(async () => {
    await mongoose.disconnect();
    if (mongoServer) {
      await mongoServer.stop();
    }
  });

  beforeEach(async () => {
    await UserModel.deleteMany({});
    await NotificationModel.deleteMany({});
  });

  const createTestUser = async (email = 'student@campus.ac.in', name = 'Aarav Sharma') => {
    const user = await UserModel.create({
      name,
      email,
      passwordHash: '$2a$12$dummyhashedpassword1234567890abcdef',
      roles: ['customer'],
      isEmailVerified: true,
      isBanned: false,
      fcmTokens: [],
      devices: [],
      notificationPreferences: {
        orders: true,
        seller: true,
        delivery: true,
        marketing: false,
      },
    });

    const token = jwt.sign(
      { userId: user._id.toString(), roles: user.roles },
      env.JWT_ACCESS_SECRET,
      { expiresIn: '15m' }
    );

    return { user, token };
  };

  describe('1. Device Token Registration & Multi-Platform Management', () => {
    it('should register a push token with device metadata', async () => {
      const { user, token } = await createTestUser();

      const res = await request(app)
        .post('/api/v1/notifications/push-token')
        .set('Authorization', `Bearer ${token}`)
        .send({
          token: 'fcm-device-token-abc-123',
          platform: 'web',
          deviceId: 'chrome-desktop-xyz',
          userAgent: 'Mozilla/5.0 Chrome/120.0',
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);

      const updatedUser = await UserModel.findById(user._id);
      expect(updatedUser?.fcmTokens).toContain('fcm-device-token-abc-123');
      expect(updatedUser?.devices).toHaveLength(1);
      expect(updatedUser?.devices?.[0].token).toBe('fcm-device-token-abc-123');
      expect(updatedUser?.devices?.[0].platform).toBe('web');
      expect(updatedUser?.devices?.[0].isActive).toBe(true);
    });

    it('should deduplicate token across users when a device is shared (campus computer / browser switch)', async () => {
      const userA = await createTestUser('usera@campus.edu', 'User A');
      const userB = await createTestUser('userb@campus.edu', 'User B');

      const sharedToken = 'fcm-shared-campus-terminal-token';

      await request(app)
        .post('/api/v1/notifications/push-token')
        .set('Authorization', `Bearer ${userA.token}`)
        .send({ token: sharedToken, platform: 'web' });

      let docA = await UserModel.findById(userA.user._id);
      expect(docA?.fcmTokens).toContain(sharedToken);

      await request(app)
        .post('/api/v1/notifications/push-token')
        .set('Authorization', `Bearer ${userB.token}`)
        .send({ token: sharedToken, platform: 'web' });

      docA = await UserModel.findById(userA.user._id);
      expect(docA?.fcmTokens).not.toContain(sharedToken);
      expect(docA?.devices?.find((d) => d.token === sharedToken)).toBeUndefined();

      const docB = await UserModel.findById(userB.user._id);
      expect(docB?.fcmTokens).toContain(sharedToken);
      expect(docB?.devices?.find((d) => d.token === sharedToken)).toBeDefined();
    });

    it('should revoke token on user logout', async () => {
      const { user, token } = await createTestUser();
      const testToken = 'fcm-token-to-be-revoked';

      await request(app)
        .post('/api/v1/notifications/push-token')
        .set('Authorization', `Bearer ${token}`)
        .send({ token: testToken, platform: 'web' });

      let doc = await UserModel.findById(user._id);
      expect(doc?.fcmTokens).toContain(testToken);

      const delRes = await request(app)
        .delete('/api/v1/notifications/push-token')
        .set('Authorization', `Bearer ${token}`)
        .send({ token: testToken });

      expect(delRes.status).toBe(200);

      doc = await UserModel.findById(user._id);
      expect(doc?.fcmTokens).not.toContain(testToken);
    });
  });

  describe('2. Idempotency & Deduplication Engine', () => {
    it('should not create duplicate notifications when same idempotencyKey is supplied', async () => {
      const { user } = await createTestUser();
      const idempotencyKey = 'order_confirmed_ORD-98765';

      const first = await notificationsService.createNotification(
        user._id.toString(),
        'order_confirmed',
        'Order Confirmed #ORD-98765',
        'Your book is packed and ready for dispatch',
        { orderId: 'ORD-98765' },
        { idempotencyKey }
      );

      const second = await notificationsService.createNotification(
        user._id.toString(),
        'order_confirmed',
        'Order Confirmed #ORD-98765',
        'Your book is packed and ready for dispatch',
        { orderId: 'ORD-98765' },
        { idempotencyKey }
      );

      expect(first.id).toBe(second.id);

      const totalCount = await NotificationModel.countDocuments({
        userId: user._id,
        idempotencyKey,
      });
      expect(totalCount).toBe(1);
    });
  });

  describe('3. User Notification Preferences & Routing', () => {
    it('should fetch and update user notification preferences via API', async () => {
      const { user, token } = await createTestUser();

      const getRes = await request(app)
        .get('/api/v1/notifications/preferences')
        .set('Authorization', `Bearer ${token}`);

      expect(getRes.status).toBe(200);
      expect(getRes.body.data.orders).toBe(true);
      expect(getRes.body.data.marketing).toBe(false);

      const patchRes = await request(app)
        .patch('/api/v1/notifications/preferences')
        .set('Authorization', `Bearer ${token}`)
        .send({
          marketing: true,
          seller: false,
        });

      expect(patchRes.status).toBe(200);
      expect(patchRes.body.data.marketing).toBe(true);
      expect(patchRes.body.data.seller).toBe(false);

      const updatedUser = await UserModel.findById(user._id);
      expect(updatedUser?.notificationPreferences?.marketing).toBe(true);
      expect(updatedUser?.notificationPreferences?.seller).toBe(false);
    });
  });

  describe('4. Notification In-App Lifecycle & Security', () => {
    it('should list notifications, fetch unread count, and mark as read', async () => {
      const { user, token } = await createTestUser();

      const n1 = await notificationsService.createNotification(
        user._id.toString(),
        'order_delivery',
        'Textbook Delivered',
        'Your package has been delivered to your college hostel.'
      );

      const n2 = await notificationsService.createNotification(
        user._id.toString(),
        'request_accepted',
        'Seller Accepted Request',
        'Mohit has accepted your request for HC Verma Concepts of Physics.'
      );

      const countRes = await request(app)
        .get('/api/v1/notifications/unread-count')
        .set('Authorization', `Bearer ${token}`);
      expect(countRes.body.data.count).toBe(2);

      const markRes = await request(app)
        .patch(`/api/v1/notifications/${n1.id}/read`)
        .set('Authorization', `Bearer ${token}`);
      expect(markRes.status).toBe(200);
      expect(markRes.body.data.isRead).toBe(true);

      const countRes2 = await request(app)
        .get('/api/v1/notifications/unread-count')
        .set('Authorization', `Bearer ${token}`);
      expect(countRes2.body.data.count).toBe(1);

      const allReadRes = await request(app)
        .patch('/api/v1/notifications/read-all')
        .set('Authorization', `Bearer ${token}`);
      expect(allReadRes.status).toBe(200);

      const countRes3 = await request(app)
        .get('/api/v1/notifications/unread-count')
        .set('Authorization', `Bearer ${token}`);
      expect(countRes3.body.data.count).toBe(0);
    });

    it('should prevent IDOR: user cannot read another user notification', async () => {
      const userA = await createTestUser('usera_sec@campus.edu', 'User A');
      const userB = await createTestUser('userb_sec@campus.edu', 'User B');

      const notifA = await notificationsService.createNotification(
        userA.user._id.toString(),
        'private_alert',
        'Confidential Alert',
        'Secret information'
      );

      const attackRes = await request(app)
        .patch(`/api/v1/notifications/${notifA.id}/read`)
        .set('Authorization', `Bearer ${userB.token}`);

      expect(attackRes.status).toBe(401);
    });
  });

  describe('5. Fallback & Simulation Mode Verification', () => {
    it('should successfully dispatch in simulation mode when Firebase credentials are placeholders', async () => {
      const { user } = await createTestUser();
      await notificationsService.registerPushToken(user._id.toString(), 'dummy-fcm-device-simulation-token');

      const success = await pushService.sendPushToUser(user._id.toString(), {
        title: 'Simulation Test Alert',
        body: 'Testing graceful fallback mode without real external keys.',
        url: '/account/orders',
      });

      expect(success).toBe(true);
    });
  });
});