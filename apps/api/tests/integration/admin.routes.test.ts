import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import app from '../../src/app';
import { UserModel } from '../../src/models/user.model';
import jwt from 'jsonwebtoken';
import { env } from '../../src/config/env';

let mongoServer: MongoMemoryServer;
let adminUser: any;
let adminToken: string;

describe('Admin Module Integration Tests', () => {
  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();
    await mongoose.connect(mongoUri);

    adminUser = await UserModel.create({
      name: 'System Admin',
      email: 'admin@bookfry.com',
      passwordHash: 'hashedpass',
      roles: ['customer', 'seller', 'admin'],
      isEmailVerified: true,
    });

    adminToken = jwt.sign(
      { userId: adminUser._id.toString(), roles: adminUser.roles },
      env.JWT_ACCESS_SECRET
    );
  });

  afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
  });

  it('GET /api/v1/admin/dashboard should return system metrics', async () => {
    const res = await request(app)
      .get('/api/v1/admin/dashboard')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.totalUsers).toBeGreaterThan(0);
  });

  it('GET & PATCH /api/v1/admin/cms should persist announcement text', async () => {
    const patchRes = await request(app)
      .patch('/api/v1/admin/cms')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ announcementText: '🎉 Updated Production Announcement Bar!' });

    expect(patchRes.status).toBe(200);
    expect(patchRes.body.data.announcementText).toBe('🎉 Updated Production Announcement Bar!');

    const getRes = await request(app).get('/api/v1/contact/cms');
    expect(getRes.status).toBe(200);
    expect(getRes.body.data.announcementText).toBe('🎉 Updated Production Announcement Bar!');
  });

  it('POST & GET & DELETE /api/v1/admin/coupons should manage promo codes', async () => {
    const createRes = await request(app)
      .post('/api/v1/admin/coupons')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        code: 'TESTPROMO100',
        discountType: 'flat',
        discountValue: 100,
        minOrderSubtotal: 499,
      });

    expect(createRes.status).toBe(201);
    expect(createRes.body.data.code).toBe('TESTPROMO100');

    const getRes = await request(app)
      .get('/api/v1/admin/coupons')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(getRes.status).toBe(200);
    expect(getRes.body.data.length).toBeGreaterThan(0);

    const deleteRes = await request(app)
      .delete(`/api/v1/admin/coupons/${createRes.body.data._id}`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(deleteRes.status).toBe(200);
  });

  it('GET & PATCH /api/v1/admin/settings should manage platform settings', async () => {
    const patchRes = await request(app)
      .patch('/api/v1/admin/settings')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        commissionPercent: 12,
        flatShippingFee: 45,
      });

    expect(patchRes.status).toBe(200);
    expect(patchRes.body.data.commissionPercent).toBe(12);
    expect(patchRes.body.data.flatShippingFee).toBe(45);
  });

  it('GET /api/v1/admin/reports/export should return CSV statement', async () => {
    const res = await request(app)
      .get('/api/v1/admin/reports/export')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.headers['content-type']).toContain('text/csv');
    expect(res.text).toContain('OrderNumber,BuyerID,Total,Status,PaymentStatus,Date');
  });
});
