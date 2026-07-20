import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import request from 'supertest';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import app from '../../src/app';
import { UserModel } from '../../src/models/user.model';
import { CategoryModel } from '../../src/models/category.model';
import { BookModel } from '../../src/models/book.model';
import { CartModel } from '../../src/models/cart.model';
import jwt from 'jsonwebtoken';
import { env } from '../../src/config/env';

describe('Marketplace Modules Integration Tests', () => {
  let mongoServer: MongoMemoryServer;
  let adminToken: string;
  let sellerToken: string;
  let customerToken: string;
  let sellerId: string;
  let customerId: string;
  let categoryId: string;
  let bookId: string;

  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();
    await mongoose.connect(uri);

    // Create mock users
    const admin = await UserModel.create({
      name: 'Admin User',
      email: 'admin@example.com',
      passwordHash: 'hashedpwd',
      roles: ['admin'],
    });
    adminToken = jwt.sign(
      { userId: admin._id.toString(), roles: admin.roles },
      env.JWT_ACCESS_SECRET
    );

    const seller = await UserModel.create({
      name: 'Seller User',
      email: 'seller@example.com',
      passwordHash: 'hashedpwd',
      roles: ['seller'],
    });
    sellerId = seller._id.toString();
    sellerToken = jwt.sign(
      { userId: sellerId, roles: seller.roles },
      env.JWT_ACCESS_SECRET
    );

    const customer = await UserModel.create({
      name: 'Customer User',
      email: 'customer@example.com',
      passwordHash: 'hashedpwd',
      roles: ['customer'],
    });
    customerId = customer._id.toString();
    customerToken = jwt.sign(
      { userId: customerId, roles: customer.roles },
      env.JWT_ACCESS_SECRET
    );
  }, 60000);

  afterAll(async () => {
    await mongoose.disconnect();
    if (mongoServer) {
      await mongoServer.stop();
    }
  });

  describe('Categories Module', () => {
    it('POST /api/v1/categories should succeed for Admin', async () => {
      const response = await request(app)
        .post('/api/v1/categories')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'Fiction',
          order: 1,
        });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.name).toBe('Fiction');
      expect(response.body.data.slug).toBe('fiction');
      categoryId = response.body.data.id;
    });

    it('POST /api/v1/categories should fail with Forbidden for Seller', async () => {
      const response = await request(app)
        .post('/api/v1/categories')
        .set('Authorization', `Bearer ${sellerToken}`)
        .send({
          name: 'Science Fiction',
        });

      expect(response.status).toBe(403);
      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('FORBIDDEN');
    });

    it('GET /api/v1/categories should return all categories publicly', async () => {
      const response = await request(app).get('/api/v1/categories');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.length).toBeGreaterThan(0);
    });
  });

  describe('Books Module', () => {
    it('POST /api/v1/books should create book listing for Seller', async () => {
      const response = await request(app)
        .post('/api/v1/books')
        .set('Authorization', `Bearer ${sellerToken}`)
        .send({
          title: 'The Great Gatsby',
          author: 'F. Scott Fitzgerald',
          isbn: '9780743273565',
          description: 'A classic novel set in the Roaring Twenties.',
          category: categoryId,
          condition: 'like_new',
          price: 15.99,
          stock: 5,
        });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.title).toBe('The Great Gatsby');
      expect(response.body.data.sellerId).toBe(sellerId);
      bookId = response.body.data.id;
    });

    it('POST /api/v1/books should fail for standard Customer role', async () => {
      const response = await request(app)
        .post('/api/v1/books')
        .set('Authorization', `Bearer ${customerToken}`)
        .send({
          title: 'Another Book',
          author: 'Author',
          isbn: '1234567890',
          description: 'Short desc must be at least 10 chars',
          category: categoryId,
          condition: 'new',
          price: 9.99,
          stock: 2,
        });

      expect(response.status).toBe(403);
      expect(response.body.success).toBe(false);
    });

    it('GET /api/v1/books should retrieve active listings with pagination/filters', async () => {
      const response = await request(app).get('/api/v1/books').query({
        category: categoryId,
        condition: 'like_new',
        minPrice: 10,
        maxPrice: 20,
      });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.books.length).toBe(1);
      expect(response.body.data.books[0].title).toBe('The Great Gatsby');
    });

    it('GET /api/v1/books/:slug should fetch detailed book properties', async () => {
      const gatsby = await BookModel.findById(bookId);
      const response = await request(app).get(`/api/v1/books/${gatsby?.slug}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.title).toBe('The Great Gatsby');
      expect(response.body.data.viewsCount).toBe(1); // Incremented views
    });
  });

  describe('Cart Module', () => {
    it('POST /api/v1/cart/items should add active items to cart', async () => {
      const response = await request(app)
        .post('/api/v1/cart/items')
        .set('Authorization', `Bearer ${customerToken}`)
        .send({
          bookId,
          quantity: 2,
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.items.length).toBe(1);
      expect(response.body.data.items[0].bookId).toBe(bookId);
      expect(response.body.data.items[0].quantity).toBe(2);
    });

    it('POST /api/v1/cart/items should fail if quantity exceeds inventory stock', async () => {
      const response = await request(app)
        .post('/api/v1/cart/items')
        .set('Authorization', `Bearer ${customerToken}`)
        .send({
          bookId,
          quantity: 10, // Stock is only 5
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('PATCH /api/v1/cart/items/:bookId should update item quantity', async () => {
      const response = await request(app)
        .patch(`/api/v1/cart/items/${bookId}`)
        .set('Authorization', `Bearer ${customerToken}`)
        .send({
          quantity: 3,
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.items[0].quantity).toBe(3);
    });

    it('DELETE /api/v1/cart/items/:bookId should remove items from cart', async () => {
      const response = await request(app)
        .delete(`/api/v1/cart/items/${bookId}`)
        .set('Authorization', `Bearer ${customerToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.items.length).toBe(0);
    });
  });

  describe('Wishlist Module', () => {
    it('POST /api/v1/wishlist/:bookId should add item to customer wishlist', async () => {
      const response = await request(app)
        .post(`/api/v1/wishlist/${bookId}`)
        .set('Authorization', `Bearer ${customerToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.bookIds).toContain(bookId);
    });

    it('GET /api/v1/wishlist should return user wishlist and books list', async () => {
      const response = await request(app)
        .get('/api/v1/wishlist')
        .set('Authorization', `Bearer ${customerToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.wishlist.bookIds).toContain(bookId);
      expect(response.body.data.books.length).toBe(1);
      expect(response.body.data.books[0].title).toBe('The Great Gatsby');
    });

    it('DELETE /api/v1/wishlist/:bookId should remove item from customer wishlist', async () => {
      const response = await request(app)
        .delete(`/api/v1/wishlist/${bookId}`)
        .set('Authorization', `Bearer ${customerToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.bookIds).not.toContain(bookId);
    });
  });

  describe('Reviews Module', () => {
    it('POST /api/v1/reviews should fail to post a review without verified purchase order', async () => {
      const response = await request(app)
        .post('/api/v1/reviews')
        .set('Authorization', `Bearer ${customerToken}`)
        .send({
          bookId,
          orderId: new mongoose.Types.ObjectId().toString(),
          rating: 5,
          comment: 'Outstanding quality, loved this book!',
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it('GET /api/v1/reviews/book/:bookId should return empty reviews initially', async () => {
      const response = await request(app).get(`/api/v1/reviews/book/${bookId}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.length).toBe(0);
    });
  });

  describe('Notifications Module', () => {
    it('GET /api/v1/notifications should return empty array for customer initially', async () => {
      const response = await request(app)
        .get('/api/v1/notifications')
        .set('Authorization', `Bearer ${customerToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.length).toBe(0);
    });

    it('GET /api/v1/notifications/unread-count should return 0 count initially', async () => {
      const response = await request(app)
        .get('/api/v1/notifications/unread-count')
        .set('Authorization', `Bearer ${customerToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.count).toBe(0);
    });
  });

  describe('Seller Analytics Module', () => {
    it('GET /api/v1/seller/dashboard should return dashboard statistics', async () => {
      const response = await request(app)
        .get('/api/v1/seller/dashboard')
        .set('Authorization', `Bearer ${sellerToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.totalSales).toBe(0);
      expect(response.body.data.totalEarnings).toBe(0);
      expect(response.body.data.activeListingsCount).toBe(1);
    });

    it('GET /api/v1/seller/earnings should return transaction earnings history ledger', async () => {
      const response = await request(app)
        .get('/api/v1/seller/earnings')
        .set('Authorization', `Bearer ${sellerToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.length).toBe(0);
    });
  });
});
