import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import app from '../../src/app';
import { UserModel } from '../../src/models/user.model';
import { NotificationModel } from '../../src/models/notification.model';
import jwt from 'jsonwebtoken';
import { env } from '../../src/config/env';

describe('Notifications API Integration Tests', () => {
  let mongoServer: MongoMemoryServer;
  let testUserToken: string;
  let testUserId: string;

  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();
    await mongoose.connect(uri);

    const user = await UserModel.create({
      name: 'Mohit Joshi',
      email: 'mohit.test@bookfry.in',
      passwordHash: 'hashedpwd123',
      roles: ['customer', 'seller'],
    });
    testUserId = user._id.toString();
    testUserToken = jwt.sign({ userId: testUserId, roles: user.roles }, env.JWT_ACCESS_SECRET);

    // Seed 3 unread notifications
    await NotificationModel.create([
      {
        userId: user._id,
        type: 'order',
        title: 'Order Confirmed',
        body: 'Your book order #101 is confirmed.',
        isRead: false,
      },
      {
        userId: user._id,
        type: 'lead',
        title: 'New Buyer Lead',
        body: 'A buyer requested your listing.',
        isRead: false,
      },
      {
        userId: user._id,
        type: 'promo',
        title: 'Semester Discount',
        body: 'Enjoy ₹50 off on books.',
        isRead: true,
      },
    ]);
  });

  afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
  });

  it('GET /api/v1/notifications should return user notifications', async () => {
    const res = await request(app)
      .get('/api/v1/notifications')
      .set('Authorization', `Bearer ${testUserToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.length).toBe(3);
  });

  it('GET /api/v1/notifications/unread-count should return correct count', async () => {
    const res = await request(app)
      .get('/api/v1/notifications/unread-count')
      .set('Authorization', `Bearer ${testUserToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.count).toBe(2);
  });

  it('PATCH /api/v1/notifications/:id/read should mark a single notification as read', async () => {
    const unread = await NotificationModel.findOne({ userId: testUserId, isRead: false });
    expect(unread).not.toBeNull();

    const res = await request(app)
      .patch(`/api/v1/notifications/${unread!._id}/read`)
      .set('Authorization', `Bearer ${testUserToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.isRead).toBe(true);

    const countRes = await request(app)
      .get('/api/v1/notifications/unread-count')
      .set('Authorization', `Bearer ${testUserToken}`);
    expect(countRes.body.data.count).toBe(1);
  });

  it('PATCH /api/v1/notifications/read-all should mark all notifications as read', async () => {
    const res = await request(app)
      .patch('/api/v1/notifications/read-all')
      .set('Authorization', `Bearer ${testUserToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);

    const countRes = await request(app)
      .get('/api/v1/notifications/unread-count')
      .set('Authorization', `Bearer ${testUserToken}`);
    expect(countRes.body.data.count).toBe(0);
  });
});
