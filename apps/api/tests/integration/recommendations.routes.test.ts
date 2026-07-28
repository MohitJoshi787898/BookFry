import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import app from '../../src/app';
import { BookCatalogModel } from '../../src/models/book-catalog.model';
import { BookListingModel } from '../../src/models/book-listing.model';
import { CategoryModel } from '../../src/models/category.model';
import { UserModel } from '../../src/models/user.model';

let mongoServer: MongoMemoryServer;
let testCategory: any;
let testSeller: any;
let testBookCatalog: any;
let testBookListing: any;

describe('Recommendations & Events Integration Tests', () => {
  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();
    await mongoose.connect(mongoUri);

    // Setup Category
    testCategory = await CategoryModel.create({
      name: 'Computer Science',
      slug: 'computer-science',
      order: 1,
    });

    // Setup Seller
    testSeller = await UserModel.create({
      name: 'Algorithm Books Store',
      email: 'rec_seller@example.com',
      passwordHash: 'hashedpass',
      roles: ['customer', 'seller'],
    });

    // Setup Catalog
    testBookCatalog = await BookCatalogModel.create({
      title: 'Introduction to Algorithms 4th Ed',
      slug: 'intro-to-algorithms-4th-ed',
      author: 'Thomas H. Cormen',
      isbn: '9780262046305',
      description: 'Comprehensive guide to algorithms',
      category: testCategory._id,
      ratingAvg: 4.9,
      ratingCount: 15,
      viewsCount: 42,
    });

    // Setup Active Listing
    testBookListing = await BookListingModel.create({
      catalogId: testBookCatalog._id,
      sellerId: testSeller._id,
      condition: 'like_new',
      price: 49.99,
      stock: 10,
      status: 'active',
    });
  });

  afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
  });

  it('POST /api/v1/events/view should accept fire-and-forget page view payload', async () => {
    const res = await request(app)
      .post('/api/v1/events/view')
      .send({
        bookId: testBookCatalog._id.toString(),
        categoryId: testCategory._id.toString(),
      });

    expect(res.status).toBe(202);
    expect(res.body.success).toBe(true);
    expect(res.body.data.tracked).toBe(true);
  });

  it('GET /api/v1/recommendations/home should return popular, trending, and personalized arrays', async () => {
    const res = await request(app).get('/api/v1/recommendations/home');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data.popular)).toBe(true);
    expect(Array.isArray(res.body.data.trending)).toBe(true);
    expect(Array.isArray(res.body.data.personalized)).toBe(true);
    expect(res.body.data.popular.length).toBeGreaterThan(0);
    expect(res.body.data.popular[0].title).toBe('Introduction to Algorithms 4th Ed');
  });

  it('GET /api/v1/recommendations/:bookId should return co-occurring and similar category books', async () => {
    const res = await request(app).get(
      `/api/v1/recommendations/${testBookCatalog._id.toString()}`
    );

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data.frequentlyBoughtTogether)).toBe(true);
    expect(Array.isArray(res.body.data.similarCategory)).toBe(true);
  });
});
