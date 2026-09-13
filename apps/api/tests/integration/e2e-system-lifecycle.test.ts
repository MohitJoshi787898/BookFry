import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import app from '../../src/app';
import { UserModel } from '../../src/models/user.model';
import { CategoryModel } from '../../src/models/category.model';
import { BookCatalogModel } from '../../src/models/book-catalog.model';
import { BookListingModel } from '../../src/models/book-listing.model';
import { OrderModel } from '../../src/models/order.model';
import { CartModel } from '../../src/models/cart.model';
import { otpService } from '../../src/services/otp.service';
import jwt from 'jsonwebtoken';
import { env } from '../../src/config/env';

describe('BookFry Complete End-to-End System Lifecycle & Production Audit Test Suite', () => {
  let mongoServer: MongoMemoryServer;

  let buyer1Id: string;
  let buyer1Token: string;
  let buyer2Id: string;
  let buyer2Token: string;

  let seller1Id: string;
  let seller1Token: string;
  let seller2Id: string;
  let seller2Token: string;

  let adminId: string;
  let adminToken: string;

  let categoryId: string;
  let testCatalogId: string;
  let seller1ListingId: string;
  let seller2ListingId: string;

  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();
    await mongoose.connect(uri);

    // Setup Category
    const category = await CategoryModel.create({
      name: 'Engineering & Technology',
      slug: 'engineering-tech',
      order: 1,
    });
    categoryId = category._id.toString();

    // Create Admin User
    const admin = await UserModel.create({
      name: 'BookFry Root Admin',
      email: 'root.admin@bookfry.in',
      passwordHash: 'hashedpwd',
      roles: ['admin'],
      isEmailVerified: true,
    });
    adminId = admin._id.toString();
    adminToken = jwt.sign({ userId: adminId, roles: admin.roles }, env.JWT_ACCESS_SECRET);
  }, 60000);

  afterAll(async () => {
    await mongoose.disconnect();
    if (mongoServer) {
      await mongoServer.stop();
    }
  });

  // =========================================================================
  // 1. Authentication & Onboarding Lifecycle
  // =========================================================================
  describe('Phase 1: Full Authentication & Role Onboarding Lifecycle', () => {
    it('Buyer 1 Registration -> Auto OTP generation -> Email verification -> Login', async () => {
      // 1. Registration
      const regRes = await request(app).post('/api/v1/auth/register').send({
        name: 'Kabir Sharma',
        email: 'kabir@example.com',
        password: 'Password123!',
        roles: ['customer'],
      });

      expect(regRes.status).toBe(201);
      expect(regRes.body.success).toBe(true);
      buyer1Id = regRes.body.data.user.id;
      buyer1Token = regRes.body.data.accessToken;

      const userInDb = await UserModel.findById(buyer1Id);
      expect(userInDb?.isEmailVerified).toBe(false);

      // 2. Fetch dispatched OTP from OtpService
      const verificationOtp = await otpService.getStoredOtp('kabir@example.com', 'email_verification');
      expect(verificationOtp).toBeDefined();
      expect(verificationOtp).toHaveLength(6);

      // 3. Verify Email with OTP
      const verifyRes = await request(app).post('/api/v1/auth/verify-email-otp').send({
        email: 'kabir@example.com',
        otp: verificationOtp,
      });

      expect(verifyRes.status).toBe(200);
      expect(verifyRes.body.data.user.isEmailVerified).toBe(true);

      const verifiedUserInDb = await UserModel.findById(buyer1Id);
      expect(verifiedUserInDb?.isEmailVerified).toBe(true);

      // 4. Login with credentials
      const loginRes = await request(app).post('/api/v1/auth/login').send({
        email: 'kabir@example.com',
        password: 'Password123!',
      });

      expect(loginRes.status).toBe(200);
      expect(loginRes.body.success).toBe(true);
      expect(loginRes.body.data.accessToken).toBeTypeOf('string');
      buyer1Token = loginRes.body.data.accessToken;
    });

    it('Buyer 2 Registration (for multi-buyer IDOR and concurrency checks)', async () => {
      const regRes = await request(app).post('/api/v1/auth/register').send({
        name: 'Tara Verma',
        email: 'tara@example.com',
        password: 'Password123!',
        roles: ['customer'],
      });

      expect(regRes.status).toBe(201);
      buyer2Id = regRes.body.data.user.id;
      buyer2Token = regRes.body.data.accessToken;
    });

    it('Seller 1 Registration -> Seller onboarding -> Incomplete profile -> Profile completion -> Admin approval', async () => {
      // 1. Register as Seller
      const regRes = await request(app).post('/api/v1/auth/register').send({
        name: 'Vikram Joshi',
        email: 'vikram.books@example.com',
        password: 'Password123!',
        roles: ['customer', 'seller'],
        storeName: 'Vikram Book Depo',
      });

      expect(regRes.status).toBe(201);
      seller1Id = regRes.body.data.user.id;
      seller1Token = regRes.body.data.accessToken;

      // 2. Initial verification status must be not_submitted
      const sellerUser = await UserModel.findById(seller1Id);
      expect(sellerUser?.sellerVerificationStatus).toBe('not_submitted');

      // 3. Complete Seller Profile (Phone + UPI + Store Name) to reach 'complete' onboarding status
      const updateProfileRes = await request(app)
        .patch('/api/v1/users/seller-profile')
        .set('Authorization', `Bearer ${seller1Token}`)
        .send({
          storeName: 'Vikram Book Depo',
          phone: '+919876543210',
          upiId: 'vikram@upi',
          street: '12 College Road',
          city: 'Pune',
          state: 'Maharashtra',
          zipCode: '411001',
        });
      expect(updateProfileRes.status).toBe(200);
      expect(updateProfileRes.body.data.sellerOnboardingStatus).toBe('complete');

      // 4. Seller submits verification
      const submitRes = await request(app)
        .post('/api/v1/users/seller-verification')
        .set('Authorization', `Bearer ${seller1Token}`);

      expect(submitRes.status).toBe(200);
      expect(submitRes.body.data.sellerVerificationStatus).toBe('pending');

      // 4. Admin approves seller
      const approveRes = await request(app)
        .patch(`/api/v1/admin/users/${seller1Id}/seller-verification`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ action: 'approved' });

      expect(approveRes.status).toBe(200);
      expect(approveRes.body.data.sellerVerificationStatus).toBe('approved');

      const approvedUser = await UserModel.findById(seller1Id);
      expect(approvedUser?.sellerVerificationStatus).toBe('approved');
    });

    it('Seller 2 Registration & Approval', async () => {
      const regRes = await request(app).post('/api/v1/auth/register').send({
        name: 'Neha Book Store',
        email: 'neha.books@example.com',
        password: 'Password123!',
        roles: ['customer', 'seller'],
        storeName: 'Neha Educational Supplies',
      });

      expect(regRes.status).toBe(201);
      seller2Id = regRes.body.data.user.id;
      seller2Token = regRes.body.data.accessToken;

      await UserModel.findByIdAndUpdate(seller2Id, { sellerVerificationStatus: 'approved' });
    });
  });

  // =========================================================================
  // 2. RBAC & IDOR Security Audit
  // =========================================================================
  describe('Phase 2: RBAC & IDOR Boundary Security Checks', () => {
    it('Buyer must NOT access admin routes (GET /api/v1/admin/dashboard)', async () => {
      const res = await request(app)
        .get('/api/v1/admin/dashboard')
        .set('Authorization', `Bearer ${buyer1Token}`);

      expect(res.status).toBe(403);
    });

    it('Buyer must NOT access admin orders (GET /api/v1/orders/admin/all)', async () => {
      const res = await request(app)
        .get('/api/v1/orders/admin/all')
        .set('Authorization', `Bearer ${buyer1Token}`);

      expect(res.status).toBe(403);
    });

    it('Seller must NOT access admin routes (GET /api/v1/admin/users)', async () => {
      const res = await request(app)
        .get('/api/v1/admin/users')
        .set('Authorization', `Bearer ${seller1Token}`);

      expect(res.status).toBe(403);
    });

    it('Unauthenticated requests must be rejected (401)', async () => {
      const res = await request(app).get('/api/v1/orders');
      expect(res.status).toBe(401);
    });
  });

  // =========================================================================
  // 3. Catalog & Multi-Seller Listing Workflow
  // =========================================================================
  describe('Phase 3: Catalog & Multi-Seller Listing Workflow', () => {
    it('Seller 1 creates a new book listing and it is approved to active', async () => {
      const createRes = await request(app)
        .post('/api/v1/books')
        .set('Authorization', `Bearer ${seller1Token}`)
        .send({
          title: 'Advanced Engineering Mathematics',
          author: 'Erwin Kreyszig',
          isbn: '9780470458365',
          description: 'Standard textbook on advanced engineering mathematics.',
          category: categoryId,
          condition: 'new',
          price: 750,
          stock: 5,
        });

      expect(createRes.status).toBe(201);
      expect(createRes.body.success).toBe(true);

      seller1ListingId = createRes.body.data.id;
      const listingInDb = await BookListingModel.findById(seller1ListingId);
      expect(listingInDb).not.toBeNull();
      testCatalogId = listingInDb!.catalogId.toString();

      // Moderate listing to active for marketplace purchases
      await BookListingModel.findByIdAndUpdate(seller1ListingId, { status: 'active' });
    });

    it('Seller 2 creates a competing listing on the SAME canonical book and it is approved', async () => {
      const createRes = await request(app)
        .post('/api/v1/books')
        .set('Authorization', `Bearer ${seller2Token}`)
        .send({
          title: 'Advanced Engineering Mathematics',
          author: 'Erwin Kreyszig',
          isbn: '9780470458365',
          description: 'Standard textbook on advanced engineering mathematics.',
          category: categoryId,
          condition: 'new',
          price: 499,
          stock: 2,
        });

      expect(createRes.status).toBe(201);
      seller2ListingId = createRes.body.data.id;

      // Both listings must point to the identical catalog entity
      const l2 = await BookListingModel.findById(seller2ListingId);
      expect(l2?.catalogId.toString()).toBe(testCatalogId);

      // Moderate listing to active for marketplace purchases
      await BookListingModel.findByIdAndUpdate(seller2ListingId, { status: 'active' });
    });

    it('IDOR Check: Seller 2 must NOT be able to modify Seller 1 listing', async () => {
      const updateRes = await request(app)
        .patch(`/api/v1/books/${seller1ListingId}`)
        .set('Authorization', `Bearer ${seller2Token}`)
        .send({ price: 100 });

      expect(updateRes.status).toBe(401); // UnauthorizedError
    });
  });

  // =========================================================================
  // 4. Order, Payment, Sub-Orders & Invoice Verification
  // =========================================================================
  describe('Phase 4: Order, Multi-Seller Sub-Order Splitting, Payment & Invoice', () => {
    let orderId: string;
    let orderNumber: string;

    it('Buyer 1 places an order buying both Seller 1 and Seller 2 books in one cart', async () => {
      await CartModel.findOneAndUpdate(
        { userId: buyer1Id },
        {
          items: [
            { listingId: seller1ListingId, quantity: 1, priceSnapshot: 750 },
            { listingId: seller2ListingId, quantity: 1, priceSnapshot: 499 },
          ],
        },
        { upsert: true }
      );

      const checkoutRes = await request(app)
        .post('/api/v1/orders/checkout-mixed')
        .set('Authorization', `Bearer ${buyer1Token}`)
        .send({
          shippingAddress: {
            street: '100 Ring Road',
            city: 'Pune',
            state: 'Maharashtra',
            zipCode: '411001',
            country: 'India',
          },
        });

      expect(checkoutRes.status).toBe(201);
      const order = checkoutRes.body.data.newOrder;
      expect(order).toBeDefined();
      orderId = order.id;
      orderNumber = order.orderNumber;

      // Master order & sub-order validation
      expect(order.items.length).toBe(2);
      expect(order.subOrders.length).toBe(2);
      expect(order.status).toBe('pending');
      expect(order.paymentStatus).toBe('pending');
    });

    it('IDOR Check: Buyer 2 must NOT access Buyer 1 order details', async () => {
      const res = await request(app)
        .get(`/api/v1/orders/${orderId}`)
        .set('Authorization', `Bearer ${buyer2Token}`);

      expect(res.status).toBe(401);
    });

    it('Payment Intent Generation & Verification with atomic state transitions', async () => {
      // 1. Create Payment Intent
      const intentRes = await request(app)
        .post('/api/v1/payments/create-intent')
        .set('Authorization', `Bearer ${buyer1Token}`)
        .send({ orderId });

      expect(intentRes.status).toBe(200);
      expect(intentRes.body.data.id).toBeDefined();

      // 2. Verify Payment (Simulation/Mock gateway fallback)
      const verifyRes = await request(app)
        .post('/api/v1/payments/verify')
        .set('Authorization', `Bearer ${buyer1Token}`)
        .send({
          orderId,
          razorpay_payment_id: 'pay_mock_e2e_verify_999',
        });

      expect(verifyRes.status).toBe(200);
      expect(verifyRes.body.data.verified).toBe(true);

      // Order must now be confirmed & paid
      const confirmedOrder = await OrderModel.findById(orderId);
      expect(confirmedOrder?.status).toBe('confirmed');
      expect(confirmedOrder?.paymentStatus).toBe('paid');
      expect(confirmedOrder?.subOrders.every((s: any) => s.status === 'confirmed')).toBe(true);
    });

    it('Seller Isolation: Seller 1 must only see their sub-order items, not Seller 2', async () => {
      const seller1OrdersRes = await request(app)
        .get('/api/v1/orders/seller')
        .set('Authorization', `Bearer ${seller1Token}`);

      expect(seller1OrdersRes.status).toBe(200);
      const s1Order = seller1OrdersRes.body.data.find((o: any) => o.id === orderId);
      expect(s1Order).toBeDefined();
      expect(s1Order.items.length).toBe(1);
      expect(s1Order.items[0].sellerId).toBe(seller1Id);
    });

    it('Invoice Integrity & Authorization Check', async () => {
      // Buyer 1 can view invoice
      const invoiceRes = await request(app)
        .get(`/api/v1/orders/public/${orderNumber}`)
        .set('Authorization', `Bearer ${buyer1Token}`);

      expect(invoiceRes.status).toBe(200);
      expect(invoiceRes.body.data.orderNumber).toBe(orderNumber);

      // Buyer 2 cannot view Buyer 1 invoice (IDOR prevented)
      const unauthorizedInvoiceRes = await request(app)
        .get(`/api/v1/orders/public/${orderNumber}`)
        .set('Authorization', `Bearer ${buyer2Token}`);

      expect(unauthorizedInvoiceRes.status).toBe(401);

      // Admin CAN view any invoice
      const adminInvoiceRes = await request(app)
        .get(`/api/v1/orders/public/${orderNumber}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(adminInvoiceRes.status).toBe(200);
    });

    it('Order Fulfillment & Logistics: Seller 1 generates AWB and ships package', async () => {
      const order = await OrderModel.findById(orderId);
      const seller1Sub = order?.subOrders.find((s: any) => s.sellerId.toString() === seller1Id);
      expect(seller1Sub).toBeDefined();

      const subId = seller1Sub._id.toString();

      // Generate AWB
      const awbRes = await request(app)
        .post(`/api/v1/orders/${orderId}/sub-orders/${subId}/generate-awb`)
        .set('Authorization', `Bearer ${seller1Token}`);

      expect(awbRes.status).toBe(200);
      expect(awbRes.body.data.awbCode).toBeDefined();
      expect(awbRes.body.data.courierName).toBeDefined();

      // Check sub-order is now shipped
      const updatedOrder = await OrderModel.findById(orderId);
      const updatedSub = updatedOrder?.subOrders.find((s: any) => s._id.toString() === subId);
      expect(updatedSub?.status).toBe('shipped');
    });
  });

  // =========================================================================
  // 5. Admin Governance & Platform Metrics
  // =========================================================================
  describe('Phase 5: Admin Management & Platform Governance', () => {
    it('Admin Dashboard Stats reflects real GMV and counts', async () => {
      const statsRes = await request(app)
        .get('/api/v1/admin/dashboard')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(statsRes.status).toBe(200);
      expect(statsRes.body.data.totalUsers).toBeGreaterThanOrEqual(4);
      expect(statsRes.body.data.totalOrders).toBeGreaterThanOrEqual(1);
      expect(statsRes.body.data.grossMerchandiseValue).toBeGreaterThan(0);
    });

    it('Admin can moderate listings (reject with reason)', async () => {
      const modRes = await request(app)
        .patch(`/api/v1/admin/listings/${seller2ListingId}/moderate`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          status: 'rejected',
          rejectionReason: 'Listing photos are blurry or missing ISBN cover.',
        });

      expect(modRes.status).toBe(200);
      expect(modRes.body.data.status).toBe('rejected');
      expect(modRes.body.data.rejectionReason).toContain('blurry');
    });
  });
});
