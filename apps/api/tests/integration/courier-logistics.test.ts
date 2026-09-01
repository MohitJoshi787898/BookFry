import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import app from '../../src/app';
import { UserModel } from '../../src/models/user.model';
import { OrderModel } from '../../src/models/order.model';
import jwt from 'jsonwebtoken';
import { env } from '../../src/config/env';

describe('Courier Logistics & AWB Integration Tests', () => {
  let mongoServer: MongoMemoryServer;
  let sellerToken: string;
  let buyerToken: string;
  let sellerId: string;
  let buyerId: string;
  let testOrderId: string;
  let testSubOrderNumber: string;

  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();
    await mongoose.connect(uri);

    const buyer = await UserModel.create({
      name: 'Courier Buyer',
      email: 'courier.buyer@example.com',
      passwordHash: 'hashedpwd',
      roles: ['customer'],
    });
    buyerId = buyer._id.toString();
    buyerToken = jwt.sign({ userId: buyerId, roles: buyer.roles }, env.JWT_ACCESS_SECRET);

    const seller = await UserModel.create({
      name: 'Logistics Bookshop',
      email: 'logistics.seller@example.com',
      passwordHash: 'hashedpwd',
      roles: ['seller'],
      sellerProfile: { storeName: 'Logistics Central Store' },
      addresses: [
        {
          street: 'Warehouse 12 Sector 62',
          city: 'Noida',
          state: 'Uttar Pradesh',
          zipCode: '201301',
          country: 'India',
          isDefault: true,
        },
      ],
    });
    sellerId = seller._id.toString();
    sellerToken = jwt.sign({ userId: sellerId, roles: seller.roles }, env.JWT_ACCESS_SECRET);

    // Create a confirmed order with subOrder
    const order = await OrderModel.create({
      orderNumber: 'ORD-LOGISTICS-001',
      buyerId: new mongoose.Types.ObjectId(buyerId),
      items: [
        {
          bookId: new mongoose.Types.ObjectId(),
          sellerId: new mongoose.Types.ObjectId(sellerId),
          title: 'Algorithms Book',
          price: 499,
          quantity: 1,
          condition: 'new',
        },
      ],
      subOrders: [
        {
          subOrderNumber: 'ORD-LOGISTICS-001-S1',
          sellerId: new mongoose.Types.ObjectId(sellerId),
          items: [
            {
              bookId: new mongoose.Types.ObjectId(),
              sellerId: new mongoose.Types.ObjectId(sellerId),
              title: 'Algorithms Book',
              price: 499,
              quantity: 1,
              condition: 'new',
            },
          ],
          subtotal: 499,
          shippingFee: 0,
          tax: 39.92,
          total: 538.92,
          sellerPayout: 449.1,
          status: 'confirmed',
          shippingDetails: {},
          timeline: [
            {
              status: 'confirmed',
              note: 'Order confirmed and ready for packing',
              timestamp: new Date(),
            },
          ],
        },
      ],
      shippingAddress: {
        street: '42 MG Road',
        city: 'Bengaluru',
        state: 'Karnataka',
        zipCode: '560001',
        country: 'India',
      },
      subtotal: 499,
      shippingFee: 0,
      tax: 39.92,
      total: 538.92,
      currency: 'INR',
      status: 'confirmed',
      paymentStatus: 'paid',
      timeline: [
        {
          status: 'confirmed',
          note: 'Payment verified',
          timestamp: new Date(),
        },
      ],
    });

    testOrderId = order._id.toString();
    testSubOrderNumber = order.subOrders[0].subOrderNumber;
  });

  afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
  });

  it('should allow seller to generate AWB and dispatch package', async () => {
    const res = await request(app)
      .post(`/api/v1/orders/${testOrderId}/sub-orders/${testSubOrderNumber}/generate-awb`)
      .set('Authorization', `Bearer ${sellerToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.awbCode).toBeDefined();
    expect(res.body.data.courierName).toBeDefined();
    expect(res.body.data.trackingUrl).toBeDefined();

    // Verify order status in DB transitioned to 'shipped'
    const updatedOrder = await OrderModel.findById(testOrderId);
    expect(updatedOrder?.subOrders[0].status).toBe('shipped');
    expect(updatedOrder?.subOrders[0].shippingDetails?.trackingNumber).toBe(res.body.data.awbCode);
  });

  it('should process courier tracking webhook and update package status to delivered', async () => {
    const orderBefore = await OrderModel.findById(testOrderId);
    const awbCode = orderBefore?.subOrders[0].shippingDetails?.trackingNumber;
    expect(awbCode).toBeDefined();

    const res = await request(app)
      .post('/api/v1/orders/courier-webhook')
      .send({
        awb: awbCode,
        current_status: 'DELIVERED',
        courier_name: 'BlueDart Express',
        delivered_at: new Date().toISOString(),
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.processed).toBe(true);

    // Verify DB updated to delivered
    const updatedOrder = await OrderModel.findById(testOrderId);
    expect(updatedOrder?.subOrders[0].status).toBe('delivered');
    expect(updatedOrder?.status).toBe('delivered');
  });
});
