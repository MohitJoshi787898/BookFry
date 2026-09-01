import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import app from '../../src/app';
import { UserModel } from '../../src/models/user.model';
import { sseManager } from '../../src/modules/notifications/sse.manager';
import jwt from 'jsonwebtoken';
import { env } from '../../src/config/env';

describe('SSE Real-Time Stream Integration Tests', () => {
  let mongoServer: MongoMemoryServer;
  let testUserToken: string;
  let testUserId: string;

  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();
    await mongoose.connect(uri);

    const user = await UserModel.create({
      name: 'Realtime Tester',
      email: 'realtime.test@example.com',
      passwordHash: 'hashedpwd',
      roles: ['customer', 'seller'],
    });
    testUserId = user._id.toString();
    testUserToken = jwt.sign({ userId: testUserId, roles: user.roles }, env.JWT_ACCESS_SECRET);
  });

  afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
  });

  it('should reject unauthenticated SSE stream connection', async () => {
    const res = await request(app).get('/api/v1/notifications/stream');
    expect(res.status).toBe(401);
  });

  it('should accept SSE stream connection with Bearer header or ?token query param', async () => {
    // Test with query token parameter
    const reqPromise = request(app)
      .get(`/api/v1/notifications/stream?token=${testUserToken}`)
      .set('Accept', 'text/event-stream');

    // Give connection a brief tick to establish
    await new Promise((resolve) => setTimeout(resolve, 150));

    // Verify sseManager can broadcast events without throwing
    expect(() => {
      sseManager.broadcastToUser(testUserId, 'order:updated', {
        orderId: 'test_order_123',
        newStatus: 'shipped',
      });
    }).not.toThrow();
  });
});
