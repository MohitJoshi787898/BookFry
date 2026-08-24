import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import app from '../../src/app';
import { UserModel } from '../../src/models/user.model';
import { CategoryModel } from '../../src/models/category.model';
import { BookCatalogModel } from '../../src/models/book-catalog.model';
import { BookListingModel } from '../../src/models/book-listing.model';
import jwt from 'jsonwebtoken';
import { env } from '../../src/config/env';

describe('Location-Based Seller & Book Discovery Integration Tests', () => {
  let mongoServer: MongoMemoryServer;
  let sellerDelhiToken: string;
  let sellerMumbaiToken: string;
  let buyerToken: string;

  let sellerDelhiId: string;
  let sellerMumbaiId: string;
  let buyerId: string;

  let categoryId: string;
  let catalogId: string;
  let catalogSlug: string;

  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();
    await mongoose.connect(uri);

    // 1. Create Sellers with default addresses
    // Delhi Seller: Coordinates around North Campus Delhi: [77.2100, 28.6900]
    const sellerDelhi = await UserModel.create({
      name: 'Delhi Campus Books',
      email: 'delhi.seller@example.com',
      passwordHash: 'hashedpassword',
      roles: ['seller'],
      sellerProfile: { storeName: 'Delhi University Books' },
      addresses: [
        {
          street: 'Chhatra Marg, North Campus',
          city: 'New Delhi',
          state: 'Delhi',
          zipCode: '110007',
          country: 'India',
          isDefault: true,
          location: { type: 'Point', coordinates: [77.21, 28.69] },
        },
      ],
    });
    sellerDelhiId = sellerDelhi._id.toString();
    sellerDelhiToken = jwt.sign({ userId: sellerDelhiId, roles: sellerDelhi.roles }, env.JWT_ACCESS_SECRET);

    // Mumbai Seller: Coordinates around Fort Mumbai: [72.8347, 18.9322]
    const sellerMumbai = await UserModel.create({
      name: 'Mumbai Book Vault',
      email: 'mumbai.seller@example.com',
      passwordHash: 'hashedpassword',
      roles: ['seller'],
      sellerProfile: { storeName: 'Mumbai Central Store' },
      addresses: [
        {
          street: 'MG Road, Fort',
          city: 'Mumbai',
          state: 'Maharashtra',
          zipCode: '400001',
          country: 'India',
          isDefault: true,
          location: { type: 'Point', coordinates: [72.8347, 18.9322] },
        },
      ],
    });
    sellerMumbaiId = sellerMumbai._id.toString();
    sellerMumbaiToken = jwt.sign({ userId: sellerMumbaiId, roles: sellerMumbai.roles }, env.JWT_ACCESS_SECRET);

    // Buyer
    const buyer = await UserModel.create({
      name: 'Pooja Verma',
      email: 'pooja.buyer@example.com',
      passwordHash: 'hashedpassword',
      roles: ['customer'],
    });
    buyerId = buyer._id.toString();
    buyerToken = jwt.sign({ userId: buyerId, roles: buyer.roles }, env.JWT_ACCESS_SECRET);

    // Category
    const category = await CategoryModel.create({
      name: 'Computer Science',
      slug: 'computer-science',
      order: 1,
    });
    categoryId = category._id.toString();

    // Canonical Catalog: 'Data Structures and Algorithms in Python'
    const catalog = await BookCatalogModel.create({
      title: 'Data Structures and Algorithms in Python',
      slug: 'data-structures-and-algorithms-in-python-9781118290279',
      author: 'Michael T. Goodrich',
      isbn: '9781118290279',
      description: 'Comprehensive data structures text.',
      category: categoryId,
      images: [{ url: 'https://example.com/dsa.jpg', publicId: 'dsa_img' }],
    });
    catalogId = catalog._id.toString();
    catalogSlug = catalog.slug;

    // Create 2 listings for the SAME catalog entry:
    // 1. Delhi Seller listing: Used book, ₹450, Delhi
    await BookListingModel.create({
      catalogId,
      sellerId: sellerDelhiId,
      condition: 'good',
      price: 450,
      stock: 3,
      status: 'active',
      city: 'New Delhi',
      state: 'Delhi',
      pincode: '110007',
      campusName: 'Delhi University North Campus',
      location: { type: 'Point', coordinates: [77.21, 28.69] },
    });

    // 2. Mumbai Seller listing: New book, ₹400 (cheaper!), Mumbai
    await BookListingModel.create({
      catalogId,
      sellerId: sellerMumbaiId,
      condition: 'new',
      price: 400,
      stock: 5,
      status: 'active',
      city: 'Mumbai',
      state: 'Maharashtra',
      pincode: '400001',
      location: { type: 'Point', coordinates: [72.8347, 18.9322] },
    });
  });

  afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
  });

  it('Scenario 1: Default national query should return the cheapest listing regardless of location', async () => {
    const res = await request(app).get('/api/v1/books');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.books.length).toBeGreaterThanOrEqual(1);

    const dsaBook = res.body.data.books.find((b: any) => b.isbn === '9781118290279');
    expect(dsaBook).toBeDefined();
    // Cheapest is Mumbai seller at 400
    expect(dsaBook.price).toBe(400);
    expect(dsaBook.sellerCity).toBe('Mumbai');
  });

  it('Scenario 2: Filtering by city "New Delhi" should surface the Delhi seller listing', async () => {
    const res = await request(app).get('/api/v1/books?city=New%20Delhi');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);

    const dsaBook = res.body.data.books.find((b: any) => b.isbn === '9781118290279');
    expect(dsaBook).toBeDefined();
    expect(dsaBook.price).toBe(450);
    expect(dsaBook.sellerCity).toBe('New Delhi');
    expect(dsaBook.sellerPincode).toBe('110007');
    expect(dsaBook.campusName).toBe('Delhi University North Campus');
  });

  it('Scenario 3: Filtering by pincode "110007" should match only the Delhi seller', async () => {
    const res = await request(app).get('/api/v1/books?pincode=110007');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);

    const dsaBook = res.body.data.books.find((b: any) => b.isbn === '9781118290279');
    expect(dsaBook).toBeDefined();
    expect(dsaBook.sellerCity).toBe('New Delhi');
  });

  it('Scenario 4: Geospatial coordinate search near Delhi with distance calculation', async () => {
    // Buyer is in Connaught Place, New Delhi: lat 28.6315, lng 77.2167
    const res = await request(app).get(
      '/api/v1/books?lat=28.6315&lng=77.2167&maxDistanceKm=30'
    );

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);

    const dsaBook = res.body.data.books.find((b: any) => b.isbn === '9781118290279');
    expect(dsaBook).toBeDefined();
    expect(dsaBook.sellerCity).toBe('New Delhi');
    expect(dsaBook.distanceKm).toBeDefined();
    // CP to North Campus is ~6.5 km
    expect(dsaBook.distanceKm).toBeLessThan(15);
  });

  it('Scenario 5: Book details by slug should return all sellers with their respective locations', async () => {
    const res = await request(app).get(`/api/v1/books/${catalogSlug}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.listings).toBeDefined();
    expect(res.body.data.listings.length).toBe(2);

    const delhiOffer = res.body.data.listings.find((l: any) => l.sellerCity === 'New Delhi');
    const mumbaiOffer = res.body.data.listings.find((l: any) => l.sellerCity === 'Mumbai');

    expect(delhiOffer).toBeDefined();
    expect(delhiOffer.price).toBe(450);
    expect(delhiOffer.campusName).toBe('Delhi University North Campus');

    expect(mumbaiOffer).toBeDefined();
    expect(mumbaiOffer.price).toBe(400);
  });

  it('Scenario 6: Creating a book listing should inherit default address location if not provided explicitly', async () => {
    const res = await request(app)
      .post('/api/v1/books')
      .set('Authorization', `Bearer ${sellerDelhiToken}`)
      .send({
        title: 'Artificial Intelligence: A Modern Approach',
        author: 'Stuart Russell',
        isbn: '9780136042594',
        description: 'Standard textbook in AI covering modern agents and search.',
        category: categoryId,
        condition: 'good',
        price: 650,
        stock: 2,
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);

    // Verify created listing has inherited seller's Delhi address
    const listing = await BookListingModel.findOne({
      sellerId: sellerDelhiId,
      price: 650,
    });

    expect(listing).toBeDefined();
    expect(listing?.city).toBe('New Delhi');
    expect(listing?.state).toBe('Delhi');
    expect(listing?.pincode).toBe('110007');
  });
});
