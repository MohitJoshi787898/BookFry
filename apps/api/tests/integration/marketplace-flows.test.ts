import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import app from '../../src/app';
import { UserModel } from '../../src/models/user.model';
import { CategoryModel } from '../../src/models/category.model';
import { BookCatalogModel } from '../../src/models/book-catalog.model';
import { BookListingModel } from '../../src/models/book-listing.model';
import { CartModel } from '../../src/models/cart.model';
import { OrderModel } from '../../src/models/order.model';
import { UsedBookRequestModel } from '../../src/models/used-book-request.model';
import jwt from 'jsonwebtoken';
import { env } from '../../src/config/env';

describe('Marketplace Complete Flows Audit & Verification Suite', () => {
  let mongoServer: MongoMemoryServer;
  let buyerToken: string;
  let seller1Token: string;
  let seller2Token: string;
  let adminToken: string;

  let buyerId: string;
  let seller1Id: string;
  let seller2Id: string;
  let adminId: string;

  let categoryId: string;

  let newBook1Seller1Id: string;
  let newBook2Seller1Id: string;
  let newBook3Seller2Id: string;
  let usedBook1Seller1Id: string;
  let usedBook2Seller1Id: string;
  let usedBook3Seller2Id: string;

  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();
    await mongoose.connect(uri);

    // Users
    const buyer = await UserModel.create({
      name: 'Ananya Sharma',
      email: 'ananya@example.com',
      passwordHash: 'hashedpwd',
      roles: ['customer'],
      phone: '+919876543210',
    });
    buyerId = buyer._id.toString();
    buyerToken = jwt.sign({ userId: buyerId, roles: buyer.roles }, env.JWT_ACCESS_SECRET);

    const seller1 = await UserModel.create({
      name: 'Rohan Bookstore',
      email: 'rohan.books@example.com',
      passwordHash: 'hashedpwd',
      roles: ['seller'],
      sellerProfile: { storeName: 'Rohan Academic Store' },
    });
    seller1Id = seller1._id.toString();
    seller1Token = jwt.sign({ userId: seller1Id, roles: seller1.roles }, env.JWT_ACCESS_SECRET);

    const seller2 = await UserModel.create({
      name: 'Priya Textbooks',
      email: 'priya.books@example.com',
      passwordHash: 'hashedpwd',
      roles: ['seller'],
      sellerProfile: { storeName: 'Priya Book Vault' },
    });
    seller2Id = seller2._id.toString();
    seller2Token = jwt.sign({ userId: seller2Id, roles: seller2.roles }, env.JWT_ACCESS_SECRET);

    const admin = await UserModel.create({
      name: 'Platform Admin',
      email: 'admin@bookfry.in',
      passwordHash: 'hashedpwd',
      roles: ['admin'],
    });
    adminId = admin._id.toString();
    adminToken = jwt.sign({ userId: adminId, roles: admin.roles }, env.JWT_ACCESS_SECRET);

    const category = await CategoryModel.create({
      name: 'Computer Science & Engineering',
      slug: 'cse',
      order: 1,
    });
    categoryId = category._id.toString();

    // Catalogs
    const cat1 = await BookCatalogModel.create({
      title: 'Introduction to Algorithms (CLRS)',
      slug: 'introduction-to-algorithms-clrs',
      author: 'Thomas H. Cormen',
      isbn: '9780262033848',
      description: 'The standard algorithms textbook.',
      category: categoryId,
    });

    const cat2 = await BookCatalogModel.create({
      title: 'Operating System Concepts',
      slug: 'operating-system-concepts',
      author: 'Silberschatz',
      isbn: '9781118063330',
      description: 'Dinosaur OS book.',
      category: categoryId,
    });

    const cat3 = await BookCatalogModel.create({
      title: 'Computer Networking: A Top-Down Approach',
      slug: 'computer-networking-top-down',
      author: 'Kurose & Ross',
      isbn: '9780133594140',
      description: 'Computer networking textbook.',
      category: categoryId,
    });

    // Listings
    // Seller 1 New Books
    const l1 = await BookListingModel.create({
      catalogId: cat1._id,
      sellerId: seller1Id,
      condition: 'new',
      price: 850,
      stock: 10,
      status: 'active',
    });
    newBook1Seller1Id = l1._id.toString();

    const l2 = await BookListingModel.create({
      catalogId: cat2._id,
      sellerId: seller1Id,
      condition: 'new',
      price: 650,
      stock: 8,
      status: 'active',
    });
    newBook2Seller1Id = l2._id.toString();

    // Seller 2 New Book
    const l3 = await BookListingModel.create({
      catalogId: cat3._id,
      sellerId: seller2Id,
      condition: 'new',
      price: 920,
      stock: 5,
      status: 'active',
    });
    newBook3Seller2Id = l3._id.toString();

    // Seller 1 Used Books
    const l4 = await BookListingModel.create({
      catalogId: cat1._id,
      sellerId: seller1Id,
      condition: 'good',
      price: 450,
      stock: 1,
      status: 'active',
    });
    usedBook1Seller1Id = l4._id.toString();

    const l5 = await BookListingModel.create({
      catalogId: cat2._id,
      sellerId: seller1Id,
      condition: 'fair',
      price: 320,
      stock: 1,
      status: 'active',
    });
    usedBook2Seller1Id = l5._id.toString();

    // Seller 2 Used Book
    const l6 = await BookListingModel.create({
      catalogId: cat3._id,
      sellerId: seller2Id,
      condition: 'like_new',
      price: 550,
      stock: 1,
      status: 'active',
    });
    usedBook3Seller2Id = l6._id.toString();
  }, 60000);

  afterAll(async () => {
    await mongoose.disconnect();
    if (mongoServer) {
      await mongoServer.stop();
    }
  });

  // =========================================================================
  // Scenario 1: One New Book, One Seller
  // =========================================================================
  describe('Scenario 1 — One New Book, One Seller', () => {
    it('should add to cart, checkout, split sub-order, and verify payment', async () => {
      await CartModel.findOneAndUpdate(
        { userId: buyerId },
        { items: [{ listingId: newBook1Seller1Id, quantity: 1, priceSnapshot: 850 }] },
        { upsert: true }
      );

      const checkoutRes = await request(app)
        .post('/api/v1/orders/checkout-mixed')
        .set('Authorization', `Bearer ${buyerToken}`)
        .send({
          shippingAddress: {
            street: '42 MG Road',
            city: 'Bengaluru',
            state: 'Karnataka',
            zipCode: '560001',
            country: 'India',
          },
        });

      expect(checkoutRes.status).toBe(201);
      expect(checkoutRes.body.success).toBe(true);
      expect(checkoutRes.body.data.requiresPayment).toBe(true);
      expect(checkoutRes.body.data.newOrder).toBeDefined();

      const order = checkoutRes.body.data.newOrder;
      expect(order.items.length).toBe(1);
      expect(order.subOrders.length).toBe(1);
      expect(order.subOrders[0].sellerId).toBe(seller1Id);
      expect(order.status).toBe('pending');

      // Verify payment
      const verifyRes = await request(app)
        .post('/api/v1/payments/verify')
        .set('Authorization', `Bearer ${buyerToken}`)
        .send({
          orderId: order.id,
          razorpay_payment_id: 'pay_mock_scenario1_123',
        });

      expect(verifyRes.status).toBe(200);
      expect(verifyRes.body.success).toBe(true);

      const confirmedOrder = await OrderModel.findById(order.id);
      expect(confirmedOrder?.status).toBe('confirmed');
      expect(confirmedOrder?.paymentStatus).toBe('paid');
      expect(confirmedOrder?.subOrders[0].status).toBe('confirmed');
    });
  });

  // =========================================================================
  // Scenario 2: Multiple New Books, Same Seller
  // =========================================================================
  describe('Scenario 2 — Multiple New Books, Same Seller', () => {
    it('should consolidate items into one sub-order for the shared seller', async () => {
      await CartModel.findOneAndUpdate(
        { userId: buyerId },
        {
          items: [
            { listingId: newBook1Seller1Id, quantity: 2, priceSnapshot: 850 },
            { listingId: newBook2Seller1Id, quantity: 1, priceSnapshot: 650 },
          ],
        },
        { upsert: true }
      );

      const checkoutRes = await request(app)
        .post('/api/v1/orders/checkout-mixed')
        .set('Authorization', `Bearer ${buyerToken}`)
        .send({
          shippingAddress: {
            street: '15 Nehru Place',
            city: 'New Delhi',
            state: 'Delhi',
            zipCode: '110019',
            country: 'India',
          },
        });

      expect(checkoutRes.status).toBe(201);
      const order = checkoutRes.body.data.newOrder;
      expect(order.items.length).toBe(2);
      expect(order.subOrders.length).toBe(1);
      expect(order.subOrders[0].sellerId).toBe(seller1Id);
      expect(order.subOrders[0].items.length).toBe(2);
      expect(order.subtotal).toBe(850 * 2 + 650);
    });
  });

  // =========================================================================
  // Scenario 3: Multiple New Books, Different Sellers (Multi-Seller Cart)
  // =========================================================================
  describe('Scenario 3 — Multiple New Books, Different Sellers (Multi-Seller Cart)', () => {
    let multiOrderId: string;
    let seller1SubOrderId: string;
    let seller2SubOrderId: string;

    it('should partition sub-orders by seller and enforce isolated views', async () => {
      await CartModel.findOneAndUpdate(
        { userId: buyerId },
        {
          items: [
            { listingId: newBook1Seller1Id, quantity: 1, priceSnapshot: 850 },
            { listingId: newBook3Seller2Id, quantity: 1, priceSnapshot: 920 },
          ],
        },
        { upsert: true }
      );

      const checkoutRes = await request(app)
        .post('/api/v1/orders/checkout-mixed')
        .set('Authorization', `Bearer ${buyerToken}`)
        .send({
          shippingAddress: {
            street: '77 Park Street',
            city: 'Kolkata',
            state: 'West Bengal',
            zipCode: '700016',
            country: 'India',
          },
        });

      expect(checkoutRes.status).toBe(201);
      const order = checkoutRes.body.data.newOrder;
      multiOrderId = order.id;
      expect(order.items.length).toBe(2);
      expect(order.subOrders.length).toBe(2);

      const sub1 = order.subOrders.find((s: any) => s.sellerId === seller1Id);
      const sub2 = order.subOrders.find((s: any) => s.sellerId === seller2Id);
      expect(sub1).toBeDefined();
      expect(sub2).toBeDefined();
      seller1SubOrderId = sub1.id;
      seller2SubOrderId = sub2.id;

      // Verify payment
      await request(app)
        .post('/api/v1/payments/verify')
        .set('Authorization', `Bearer ${buyerToken}`)
        .send({ orderId: multiOrderId, razorpay_payment_id: 'pay_mock_multi_999' });

      // Seller 1 isolated view on /orders/seller
      const s1OrdersRes = await request(app)
        .get('/api/v1/orders/seller')
        .set('Authorization', `Bearer ${seller1Token}`);

      expect(s1OrdersRes.status).toBe(200);
      const s1Order = s1OrdersRes.body.data.find((o: any) => o.id === multiOrderId);
      expect(s1Order).toBeDefined();
      expect(s1Order.items.length).toBe(1);
      expect(s1Order.items[0].sellerId).toBe(seller1Id);
      expect(s1Order.subOrders.length).toBe(1);
      expect(s1Order.subOrders[0].sellerId).toBe(seller1Id);

      // Seller 1 individual order view on /orders/:id (isolation verification)
      const s1SingleOrderRes = await request(app)
        .get(`/api/v1/orders/${multiOrderId}`)
        .set('Authorization', `Bearer ${seller1Token}`);

      expect(s1SingleOrderRes.status).toBe(200);
      expect(s1SingleOrderRes.body.data.items.length).toBe(1);
      expect(s1SingleOrderRes.body.data.subOrders.length).toBe(1);
      expect(s1SingleOrderRes.body.data.subOrders[0].sellerId).toBe(seller1Id);
    });

    it('should allow Seller 1 to ship their sub-order without affecting Seller 2 sub-order', async () => {
      const shipRes = await request(app)
        .patch(`/api/v1/orders/${multiOrderId}/sub-orders/${seller1SubOrderId}/status`)
        .set('Authorization', `Bearer ${seller1Token}`)
        .send({
          status: 'shipped',
          carrier: 'BlueDart Express',
          trackingNumber: 'BD987654321IN',
          estimatedDays: 3,
        });

      expect(shipRes.status).toBe(200);
      const updatedOrder = await OrderModel.findById(multiOrderId);
      const sub1 = updatedOrder?.subOrders.find((s) => s.sellerId.toString() === seller1Id);
      const sub2 = updatedOrder?.subOrders.find((s) => s.sellerId.toString() === seller2Id);

      expect(sub1?.status).toBe('shipped');
      expect(sub2?.status).toBe('confirmed');
      expect(updatedOrder?.status).toBe('shipped'); // Parent reflects overall partial shipment
    });
  });

  // =========================================================================
  // Scenario 4: One Used Book, One Seller
  // =========================================================================
  describe('Scenario 4 — One Used Book, One Seller', () => {
    let requestId: string;

    it('should create request with locked contact, and unlock upon seller accept', async () => {
      const reqRes = await request(app)
        .post('/api/v1/used-book-requests')
        .set('Authorization', `Bearer ${buyerToken}`)
        .send({
          listingId: usedBook1Seller1Id,
          phone: '+919876543210',
          whatsappPhone: '+919876543210',
          note: 'Can we meet at campus library?',
        });

      expect(reqRes.status).toBe(201);
      expect(reqRes.body.data.requestNumber).toBeDefined();
      requestId = reqRes.body.data.id;

      // Seller view before accept: phone/whatsapp must be hidden/undefined
      const sellerReqsRes = await request(app)
        .get('/api/v1/used-book-requests/seller')
        .set('Authorization', `Bearer ${seller1Token}`);

      const sReq = sellerReqsRes.body.data.find((r: any) => r.id === requestId);
      expect(sReq).toBeDefined();
      expect(sReq.buyerContact.isContactUnlocked).toBe(false);
      expect(sReq.buyerContact.phone).toBeUndefined();
      expect(sReq.buyerContact.whatsappPhone).toBeUndefined();

      // Seller accepts request
      const acceptRes = await request(app)
        .patch(`/api/v1/used-book-requests/${requestId}/accept`)
        .set('Authorization', `Bearer ${seller1Token}`);

      expect(acceptRes.status).toBe(200);
      expect(acceptRes.body.data.status).toBe('accepted');
      expect(acceptRes.body.data.buyerContact.isContactUnlocked).toBe(true);
      expect(acceptRes.body.data.buyerContact.phone).toBe('+919876543210');
    });
  });

  // =========================================================================
  // Scenario 5: Multiple Used Books, Same Seller
  // =========================================================================
  describe('Scenario 5 — Multiple Used Books, Same Seller', () => {
    it('should group multiple used books from the same seller into 1 batch request', async () => {
      const batchRes = await request(app)
        .post('/api/v1/used-book-requests/batch')
        .set('Authorization', `Bearer ${buyerToken}`)
        .send({
          listingIds: [usedBook1Seller1Id, usedBook2Seller1Id],
          phone: '+919876543210',
          whatsappPhone: '+919876543210',
          note: 'Interested in buying both algorithms and OS textbooks together.',
        });

      expect(batchRes.status).toBe(201);
      expect(batchRes.body.data.length).toBe(1); // Grouped into 1 request for Seller 1

      const reqDoc = batchRes.body.data[0];
      expect(reqDoc.sellerId).toBe(seller1Id);
      expect(reqDoc.items.length).toBe(2);
      expect(reqDoc.totalAskingPrice).toBe(450 + 320);
    });
  });

  // =========================================================================
  // Scenario 6: Multiple Used Books, Different Sellers
  // =========================================================================
  describe('Scenario 6 — Multiple Used Books, Different Sellers', () => {
    it('should partition requests by seller, creating 1 request per seller', async () => {
      const batchRes = await request(app)
        .post('/api/v1/used-book-requests/batch')
        .set('Authorization', `Bearer ${buyerToken}`)
        .send({
          listingIds: [usedBook1Seller1Id, usedBook3Seller2Id],
          phone: '+919876543210',
          whatsappPhone: '+919876543210',
        });

      expect(batchRes.status).toBe(201);
      expect(batchRes.body.data.length).toBe(2); // 1 for Seller 1, 1 for Seller 2

      const reqSeller1 = batchRes.body.data.find((r: any) => r.sellerId === seller1Id);
      const reqSeller2 = batchRes.body.data.find((r: any) => r.sellerId === seller2Id);
      expect(reqSeller1).toBeDefined();
      expect(reqSeller2).toBeDefined();
    });
  });

  // =========================================================================
  // Scenario 7 & 8: Mixed Carts (New + Used, Same & Different Sellers)
  // =========================================================================
  describe('Scenario 7 & 8 — Mixed Carts (New + Used)', () => {
    it('should split mixed cart into New book paid order and Used book requests without charging for used books', async () => {
      await CartModel.findOneAndUpdate(
        { userId: buyerId },
        {
          items: [
            { listingId: newBook1Seller1Id, quantity: 1, priceSnapshot: 850 },
            { listingId: newBook3Seller2Id, quantity: 1, priceSnapshot: 920 },
            { listingId: usedBook1Seller1Id, quantity: 1, priceSnapshot: 450 },
            { listingId: usedBook3Seller2Id, quantity: 1, priceSnapshot: 550 },
          ],
        },
        { upsert: true }
      );

      const mixedRes = await request(app)
        .post('/api/v1/orders/checkout-mixed')
        .set('Authorization', `Bearer ${buyerToken}`)
        .send({
          shippingAddress: {
            street: '10 Marine Drive',
            city: 'Mumbai',
            state: 'Maharashtra',
            zipCode: '400020',
            country: 'India',
          },
        });

      expect(mixedRes.status).toBe(201);
      expect(mixedRes.body.data.requiresPayment).toBe(true);

      // New Order covers ONLY New Books (850 + 920 = 1770)
      const newOrder = mixedRes.body.data.newOrder;
      expect(newOrder.items.length).toBe(2);
      expect(newOrder.subtotal).toBe(850 + 920);
      expect(newOrder.subOrders.length).toBe(2);

      // Used requests created for Seller 1 and Seller 2
      const usedReqs = mixedRes.body.data.usedRequests;
      expect(usedReqs.length).toBe(2);

      // Cart is cleared after checkout
      const updatedCart = await CartModel.findOne({ userId: buyerId });
      expect(updatedCart?.items.length).toBe(0);
    });

    it('should handle pure used books cart checkout without requiring payment', async () => {
      await CartModel.findOneAndUpdate(
        { userId: buyerId },
        {
          items: [
            { listingId: usedBook1Seller1Id, quantity: 1, priceSnapshot: 450 },
          ],
        },
        { upsert: true }
      );

      const mixedRes = await request(app)
        .post('/api/v1/orders/checkout-mixed')
        .set('Authorization', `Bearer ${buyerToken}`)
        .send({
          shippingAddress: {
            street: '10 Marine Drive',
            city: 'Mumbai',
            state: 'Maharashtra',
            zipCode: '400020',
            country: 'India',
          },
        });

      expect(mixedRes.status).toBe(201);
      expect(mixedRes.body.data.requiresPayment).toBe(false);
      expect(mixedRes.body.data.newOrder).toBeNull();
      expect(mixedRes.body.data.usedRequests.length).toBe(1);
    });
  });

  // =========================================================================
  // Admin Visibility & Platform Audit
  // =========================================================================
  describe('Admin Operations & Marketplace Transparency', () => {
    it('GET /api/v1/orders/admin/all should return all orders with sub-order breakdowns', async () => {
      const response = await request(app)
        .get('/api/v1/orders/admin/all')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBeGreaterThan(0);
    });

    it('GET /api/v1/used-book-requests/admin should list all used book requests across all sellers', async () => {
      const response = await request(app)
        .get('/api/v1/used-book-requests/admin')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBeGreaterThan(0);
    });
  });
});
