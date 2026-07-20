import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { env } from '../config/env';
import { UserModel } from '../models/user.model';
import { BookModel } from '../models/book.model';
import { CategoryModel } from '../models/category.model';
import { OrderModel } from '../models/order.model';

async function seedAdminPortalData() {
  try {
    console.log('🔄 Connecting to MongoDB database...');
    await mongoose.connect(env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // 1. Seed Categories
    console.log('📦 Seeding Categories...');
    const categoryDefs = [
      { name: 'Engineering & Computer Science', slug: 'engineering-cs', description: 'B.Tech, M.Tech, Coding, Electrical, Mechanical & AI textbooks.' },
      { name: 'Medical & Healthcare', slug: 'medical-healthcare', description: 'MBBS, Nursing, Pharmacy, BDS & Anatomy reference books.' },
      { name: 'Management & Business', slug: 'management-business', description: 'MBA, Finance, Marketing, Economics & Entrepreneurship.' },
      { name: 'Competitive Exams (UPSC, GATE, JEE)', slug: 'competitive-exams', description: 'Preparation guides, past papers & solved mock test series.' },
      { name: 'School Textbooks (NCERT & CBSE)', slug: 'school-textbooks', description: 'Classes 6th to 12th NCERT textbooks & reference guides.' },
      { name: 'Indian Literature & Fiction', slug: 'indian-literature', description: 'Hindi, English & regional fiction, poetry & classics.' },
      { name: 'Humanities & Arts', slug: 'humanities-arts', description: 'History, Political Science, Psychology, Sociology & Philosophy.' },
    ];

    const categoryMap: Record<string, mongoose.Types.ObjectId> = {};

    for (const cat of categoryDefs) {
      const existing = await CategoryModel.findOne({ slug: cat.slug });
      if (existing) {
        categoryMap[cat.slug] = existing._id as mongoose.Types.ObjectId;
      } else {
        const created = await CategoryModel.create(cat);
        categoryMap[cat.slug] = created._id as mongoose.Types.ObjectId;
      }
    }

    // 2. Seed Users (Admins, Sellers, Customers)
    console.log('👥 Seeding Users & Verified Sellers...');
    const passwordHash = await bcrypt.hash('DemoUser123!', 12);
    const adminPasswordHash = await bcrypt.hash('AdminBookFry123!', 12);

    const userDefs = [
      {
        name: 'BookFry System Admin',
        email: 'admin@bookfry.com',
        passwordHash: adminPasswordHash,
        roles: ['customer', 'seller', 'admin'],
        storeName: 'BookFry Official Admin Store',
      },
      {
        name: 'Senior Moderator Admin',
        email: 'moderator@bookfry.com',
        passwordHash: adminPasswordHash,
        roles: ['customer', 'seller', 'admin'],
        storeName: 'BookFry Moderator Portal',
      },
      {
        name: 'Mohit Joshi (Demo Seller)',
        email: 'demouser@bookfry.com',
        passwordHash,
        roles: ['customer', 'seller'],
        storeName: "Mohit's Campus Book Store",
      },
      {
        name: 'Priya Sharma (IIT Delhi)',
        email: 'priya.sharma@iitd.ac.in',
        passwordHash,
        roles: ['customer', 'seller'],
        storeName: 'Delhi Tech Books Exchange',
      },
      {
        name: 'Rahul Verma (DU North Campus)',
        email: 'rahul.verma@du.ac.in',
        passwordHash,
        roles: ['customer', 'seller'],
        storeName: 'DU Readers Corner',
      },
      {
        name: 'Ananya Roy (Kolkata University)',
        email: 'ananya.roy@ku.ac.in',
        passwordHash,
        roles: ['customer'],
      },
      {
        name: 'Vikram Singh (BITS Pilani)',
        email: 'vikram.singh@bits.ac.in',
        passwordHash,
        roles: ['customer', 'seller'],
        storeName: 'BITS Campus Exchange',
      },
      {
        name: 'Siddharth Nair (Anna University)',
        email: 'siddharth.nair@anna.edu',
        passwordHash,
        roles: ['customer', 'seller'],
        storeName: 'South India Campus Books',
      },
    ];

    const userMap: Record<string, mongoose.Types.ObjectId> = {};

    for (const uDef of userDefs) {
      let uDoc = await UserModel.findOne({ email: uDef.email });
      if (!uDoc) {
        uDoc = await UserModel.create({
          name: uDef.name,
          email: uDef.email,
          passwordHash: uDef.passwordHash,
          roles: uDef.roles,
          isEmailVerified: true,
          addresses: [
            {
              street: 'University Road',
              city: 'New Delhi',
              state: 'Delhi',
              zipCode: '110007',
              country: 'India',
              isDefault: true,
            },
          ],
          sellerProfile: uDef.storeName
            ? {
                storeName: uDef.storeName,
                bio: 'Verified student seller on BookFry.',
                rating: 4.8,
                totalSales: 18,
              }
            : undefined,
        });
      }
      userMap[uDef.email] = uDoc._id as mongoose.Types.ObjectId;
    }

    // 3. Seed Books & Catalog Listings
    console.log('📚 Seeding Book Listings...');
    const sellerIds = [
      userMap['demouser@bookfry.com'],
      userMap['priya.sharma@iitd.ac.in'],
      userMap['rahul.verma@du.ac.in'],
      userMap['vikram.singh@bits.ac.in'],
      userMap['siddharth.nair@anna.edu'],
    ];

    const bookDefs = [
      {
        title: 'Introduction to Algorithms (CLRS 4th Edition)',
        author: 'Thomas H. Cormen, Charles E. Leiserson',
        isbn: '9780262046305',
        description: 'Standard computer science reference textbook for algorithms and data structures. Minimal highlighting on initial pages.',
        category: categoryMap['engineering-cs'],
        condition: 'good',
        price: 450,
        stock: 5,
        status: 'active',
        language: 'English',
        publisher: 'MIT Press',
        edition: '4th Edition',
      },
      {
        title: 'Operating System Concepts (Galvin)',
        author: 'Abraham Silberschatz, Peter B. Galvin',
        isbn: '9781118063330',
        description: 'Essential textbook for computer engineering students studying operating system fundamentals.',
        category: categoryMap['engineering-cs'],
        condition: 'like_new',
        price: 320,
        stock: 3,
        status: 'active',
        language: 'English',
        publisher: 'Wiley',
        edition: '10th Edition',
      },
      {
        title: 'BD Chaurasia Human Anatomy (Volume 1)',
        author: 'BD Chaurasia',
        isbn: '9789388902724',
        description: 'Gold standard anatomy textbook for 1st year MBBS medical students across India.',
        category: categoryMap['medical-healthcare'],
        condition: 'good',
        price: 550,
        stock: 2,
        status: 'active',
        language: 'English',
        publisher: 'CBS Publishers',
        edition: '8th Edition',
      },
      {
        title: 'UPSC Indian Polity (M. Laxmikanth)',
        author: 'M. Laxmikanth',
        isbn: '9789353160196',
        description: 'Must-have guide for Civil Services, State PSC and competitive entrance examinations in India.',
        category: categoryMap['competitive-exams'],
        condition: 'good',
        price: 380,
        stock: 8,
        status: 'active',
        language: 'English',
        publisher: 'McGraw Hill',
        edition: '6th Edition',
      },
      {
        title: 'Quantitative Aptitude for Competitive Examinations',
        author: 'R.S. Aggarwal',
        isbn: '9789352530168',
        description: 'Comprehensive math and quantitative reasoning practice guide for campus placement exams.',
        category: categoryMap['competitive-exams'],
        condition: 'like_new',
        price: 280,
        stock: 10,
        status: 'active',
        language: 'English',
        publisher: 'S. Chand',
        edition: 'Revised Edition',
      },
      {
        title: 'Financial Management: Theory & Practice',
        author: 'Prasanna Chandra',
        isbn: '9789353166983',
        description: 'Core MBA & BBA textbook covering corporate finance, capital budgeting, and financial analysis.',
        category: categoryMap['management-business'],
        condition: 'good',
        price: 490,
        stock: 4,
        status: 'active',
        language: 'English',
        publisher: 'McGraw Hill',
        edition: '10th Edition',
      },
      {
        title: 'NCERT Class 11 & 12 Physics Set (2 Parts)',
        author: 'NCERT Editorial Board',
        isbn: '9788174505668',
        description: 'Original NCERT Physics textbooks for Class 11th and 12th CBSE board and NEET preparation.',
        category: categoryMap['school-textbooks'],
        condition: 'good',
        price: 180,
        stock: 12,
        status: 'active',
        language: 'English',
        publisher: 'NCERT',
        edition: '2023 Edition',
      },
      {
        title: 'Godan (गौदान - मुंशी प्रेमचंद)',
        author: 'Munshi Premchand',
        isbn: '9788128801549',
        description: 'Classic Hindi novel depicting rural Indian life, peasant struggle, and human dignity.',
        category: categoryMap['indian-literature'],
        condition: 'new',
        price: 150,
        stock: 15,
        status: 'active',
        language: 'English',
        publisher: 'Diamond Books',
        edition: 'Paperback Edition',
      },
      {
        title: 'Outdated Engineering Drawing Notes (Flagged Sample)',
        author: 'Unknown Author',
        isbn: '9780000000001',
        description: 'Suspicious duplicate entry flagged for moderation test.',
        category: categoryMap['engineering-cs'],
        condition: 'fair',
        price: 50,
        stock: 1,
        status: 'removed',
        language: 'English',
        publisher: 'Self Published',
        edition: '1st',
      },
    ];

    const bookDocs = [];

    for (let i = 0; i < bookDefs.length; i++) {
      const bDef = bookDefs[i];
      const sellerId = sellerIds[i % sellerIds.length];

      let bDoc = await BookModel.findOne({ isbn: bDef.isbn });
      if (!bDoc) {
        bDoc = await BookModel.create({
          ...bDef,
          slug: bDef.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
          sellerId,
          images: [
            {
              url: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?q=80&w=800&auto=format&fit=crop',
              altText: bDef.title,
              isPrimary: true,
            },
          ],
        });
      }
      bookDocs.push(bDoc);
    }

    // 4. Seed Marketplace Orders over past 5 months (For Revenue Charts & Admin Reports)
    console.log('🛒 Seeding Marketplace Orders...');
    const now = new Date();
    const customerIds = [
      userMap['ananya.roy@ku.ac.in'],
      userMap['rahul.verma@du.ac.in'],
      userMap['siddharth.nair@anna.edu'],
    ];

    const sampleOrders = [
      { monthsAgo: 5, total: 1850, count: 4, status: 'delivered', paymentStatus: 'paid' },
      { monthsAgo: 4, total: 2420, count: 5, status: 'delivered', paymentStatus: 'paid' },
      { monthsAgo: 3, total: 3100, count: 7, status: 'delivered', paymentStatus: 'paid' },
      { monthsAgo: 2, total: 4250, count: 9, status: 'delivered', paymentStatus: 'paid' },
      { monthsAgo: 1, total: 5800, count: 12, status: 'delivered', paymentStatus: 'paid' },
      { monthsAgo: 0, total: 1250, count: 3, status: 'confirmed', paymentStatus: 'paid' },
    ];

    let orderCounter = 1001;

    for (const sOrd of sampleOrders) {
      const orderDate = new Date(now.getFullYear(), now.getMonth() - sOrd.monthsAgo, 15);

      for (let k = 0; k < sOrd.count; k++) {
        const orderNum = `BF-ORD-${orderCounter++}`;
        const existingOrd = await OrderModel.findOne({ orderNumber: orderNum });

        if (!existingOrd && bookDocs.length > 0) {
          const sampleBook = bookDocs[k % bookDocs.length];
          const buyerId = customerIds[k % customerIds.length];

          await OrderModel.create({
            orderNumber: orderNum,
            buyerId,
            sellerId: sampleBook.sellerId,
            items: [
              {
                bookId: sampleBook._id,
                title: sampleBook.title,
                price: sampleBook.price,
                quantity: 1,
                sellerId: sampleBook.sellerId,
                condition: sampleBook.condition || 'good',
              },
            ],
            subtotal: sampleBook.price,
            shippingFee: 40,
            total: sampleBook.price + 40,
            status: sOrd.status,
            paymentStatus: sOrd.paymentStatus,
            paymentMethod: 'UPI',
            shippingAddress: {
              street: 'Campus Hostel Block B',
              city: 'New Delhi',
              state: 'Delhi',
              zipCode: '110007',
              country: 'India',
            },
            createdAt: orderDate,
            updatedAt: orderDate,
          });
        }
      }
    }

    console.log('🎉 Comprehensive Admin Seed Data Successfully Inserted!');
    console.log('----------------------------------------------------');
    console.log(`- Categories Seeded : ${categoryDefs.length}`);
    console.log(`- Users & Admins    : ${userDefs.length}`);
    console.log(`- Catalog Listings  : ${bookDefs.length}`);
    console.log('----------------------------------------------------');
  } catch (error) {
    console.error('❌ Error seeding admin data:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🚪 MongoDB connection closed');
  }
}

seedAdminPortalData();
