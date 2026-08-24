import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import app from '../../src/app';
import { UserModel } from '../../src/models/user.model';
import { CategoryModel } from '../../src/models/category.model';
import { BookModel } from '../../src/models/book.model';
import { BookCatalogModel } from '../../src/models/book-catalog.model';
import { BookListingModel } from '../../src/models/book-listing.model';
import { CartModel } from '../../src/models/cart.model';
import { OrderModel } from '../../src/models/order.model';
import jwt from 'jsonwebtoken';
import { env } from '../../src/config/env';

describe('Transactions Modules Integration Tests', () => {
  let mongoServer: MongoMemoryServer;
  let buyerToken: string;
  let sellerToken: string;
  let buyerId: string;
  let sellerId: string;
  let categoryId: string;
  let bookId: string;
  let orderId: string;

  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();
    await mongoose.connect(uri);

    const buyer = await UserModel.create({
      name: 'Buyer User',
      email: 'buyer@example.com',
      passwordHash: 'hashedpwd',
      roles: ['customer'],
    });
    buyerId = buyer._id.toString();
    buyerToken = jwt.sign({ userId: buyerId, roles: buyer.roles }, env.JWT_ACCESS_SECRET);

    const seller = await UserModel.create({
      name: 'Seller User',
      email: 'seller@example.com',
      passwordHash: 'hashedpwd',
      roles: ['seller'],
    });
    sellerId = seller._id.toString();
    sellerToken = jwt.sign({ userId: sellerId, roles: seller.roles }, env.JWT_ACCESS_SECRET);

    const category = await CategoryModel.create({
      name: 'Engineering',
      slug: 'engineering',
      order: 1,
    });
    categoryId = category._id.toString();

    const catalog = await BookCatalogModel.create({
      title: 'Structural Design Handbook',
      slug: 'structural-design-handbook',
      author: 'E. Spencer',
      isbn: '9780070602311',
      description: 'A comprehensive guide to steel structures.',
      category: categoryId,
    });

    const listing = await BookListingModel.create({
      catalogId: catalog._id,
      sellerId: sellerId,
      condition: 'new',
      price: 99.0,
      stock: 4,
      status: 'active',
    });
    bookId = listing._id.toString();

    await CartModel.create({
      userId: buyerId,
      items: [
        {
          listingId: listing._id,
          quantity: 2,
          priceSnapshot: 99.0,
        },
      ],
    });
  }, 60000);

  afterAll(async () => {
    await mongoose.disconnect();
    if (mongoServer) {
      await mongoServer.stop();
    }
  });

  describe('Orders Module - Checkout', () => {
    it('POST /api/v1/orders should create a new order and clear the cart', async () => {
      const response = await request(app)
        .post('/api/v1/orders')
        .set('Authorization', `Bearer ${buyerToken}`)
        .send({
          shippingAddress: {
            street: '123 Tech Lane',
            city: 'Silicon Valley',
            state: 'CA',
            zipCode: '94025',
            country: 'USA',
          },
        });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.orderNumber).toBeDefined();
      expect(response.body.data.items.length).toBe(1);
      expect(response.body.data.subtotal).toBe(198.0);
      expect(response.body.data.status).toBe('pending');
      orderId = response.body.data.id;

      const updatedBook = await BookListingModel.findById(bookId);
      expect(updatedBook?.stock).toBe(2);

      const updatedCart = await CartModel.findOne({ userId: buyerId });
      expect(updatedCart?.items.length).toBe(0);
    });
  });

  describe('Payments Module - Intents & Webhooks', () => {
    it('POST /api/v1/payments/create-intent should succeed for the active order', async () => {
      const response = await request(app)
        .post('/api/v1/payments/create-intent')
        .set('Authorization', `Bearer ${buyerToken}`)
        .send({
          orderId,
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.clientSecret).toBeDefined();
    });

    it('POST /api/v1/payments/webhook should verify status and confirm the order', async () => {
      const response = await request(app).post('/api/v1/payments/webhook').send({
        event: 'order.paid',
        orderId,
        paymentIntentId: 'pi_test_stripe_webhook_123',
        payload: {
          order: { entity: { receipt: orderId } },
          payment: { entity: { id: 'pi_test_stripe_webhook_123' } },
        },
      });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);

      const updatedOrder = await OrderModel.findById(orderId);
      expect(updatedOrder?.status).toBe('confirmed');
      expect(updatedOrder?.paymentStatus).toBe('paid');
    });
  });

  describe('Orders Module - Fulfillment Lifecycle', () => {
    it('PATCH /api/v1/orders/:id/status should update timeline for active Seller', async () => {
      const response = await request(app)
        .patch(`/api/v1/orders/${orderId}/status`)
        .set('Authorization', `Bearer ${sellerToken}`)
        .send({
          status: 'shipped',
          note: 'Package shipped via Fedex tracking #998811',
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.status).toBe('shipped');
      expect(response.body.data.timeline.length).toBeGreaterThanOrEqual(2);
    });

    it('GET /api/v1/orders/seller should return only seller isolated items and subOrders', async () => {
      const response = await request(app)
        .get('/api/v1/orders/seller')
        .set('Authorization', `Bearer ${sellerToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
      const sellerOrder = response.body.data.find((o: any) => o.id === orderId);
      expect(sellerOrder).toBeDefined();
      expect(sellerOrder.subOrders?.length).toBeGreaterThanOrEqual(1);
    });

    it('PATCH /api/v1/orders/:orderId/sub-orders/:subOrderId/status should update carrier tracking', async () => {
      const order = await OrderModel.findById(orderId);
      const subOrderId = order?.subOrders?.[0]?._id?.toString() || order?.subOrders?.[0]?.subOrderNumber;

      if (subOrderId) {
        const response = await request(app)
          .patch(`/api/v1/orders/${orderId}/sub-orders/${subOrderId}/status`)
          .set('Authorization', `Bearer ${sellerToken}`)
          .send({
            status: 'delivered',
            carrier: 'Delhivery',
            trackingNumber: 'DL123456789',
            note: 'Delivered to recipient doorstep',
          });

        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
        expect(response.body.data.status).toBe('delivered');
      }
    });
  });

  describe('Used Book Requests Module - Batch and Accept Flow', () => {
    let usedListingId: string;
    let createdRequestId: string;

    beforeAll(async () => {
      const catalog = await BookCatalogModel.create({
        title: 'Used Quantum Mechanics',
        slug: 'used-quantum-mechanics',
        author: 'D. Griffiths',
        description: 'Comprehensive textbook on Quantum Mechanics for university students.',
        isbn: '9780131118928',
        category: categoryId,
      });

      const listing = await BookListingModel.create({
        catalogId: catalog._id,
        sellerId,
        condition: 'good',
        price: 299,
        stock: 1,
        city: 'Delhi',
        state: 'Delhi',
        pincode: '110007',
        status: 'active',
      });
      usedListingId = listing._id.toString();
    });

    it('POST /api/v1/used-book-requests/batch should create grouped request with locked contact', async () => {
      const response = await request(app)
        .post('/api/v1/used-book-requests/batch')
        .set('Authorization', `Bearer ${buyerToken}`)
        .send({
          listingIds: [usedListingId],
          phone: '+919999999999',
          whatsappPhone: '+919999999999',
          note: 'Can we meet at university gate?',
          preferredContactMethod: 'whatsapp',
        });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.length).toBe(1);
      const reqDoc = response.body.data[0];
      createdRequestId = reqDoc.id;
      expect(reqDoc.items.length).toBe(1);
      expect(reqDoc.status).toBe('requested');
    });

    it('PATCH /api/v1/used-book-requests/:id/accept should transition status and unlock contact', async () => {
      const response = await request(app)
        .patch(`/api/v1/used-book-requests/${createdRequestId}/accept`)
        .set('Authorization', `Bearer ${sellerToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.status).toBe('accepted');
      expect(response.body.data.buyerContact.isContactUnlocked).toBe(true);
    });
  });
});
