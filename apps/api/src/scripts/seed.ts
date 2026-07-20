import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { env } from '../config/env';
import { UserModel } from '../models/user.model';
import { CategoryModel } from '../models/category.model';
import { BookModel } from '../models/book.model';

const SELLER_EMAIL = 'seller@example.com';
const CUSTOMER_EMAIL = 'customer@example.com';

const CATEGORIES = [
  { name: 'Fiction', slug: 'fiction', order: 1 },
  { name: 'Non-Fiction', slug: 'non-fiction', order: 2 },
  { name: 'Science', slug: 'science', order: 3 },
  { name: 'Technology', slug: 'technology', order: 4 },
  { name: 'Biography', slug: 'biography', order: 5 },
  { name: 'History', slug: 'history', order: 6 },
];

const BOOKS = [
  {
    title: 'The Great Gatsby',
    author: 'F. Scott Fitzgerald',
    isbn: '9780743273565',
    description: 'The story of the mysteriously wealthy Jay Gatsby and his love for the beautiful Daisy Buchanan, of lavish parties on Long Island at a time when The New York Times noted "gin was the national drink and sex the national obsession," it is an exquisitely crafted tale of America in the 1920s.',
    condition: 'like_new' as const,
    price: 12.99,
    discountPrice: 9.99,
    stock: 5,
    language: 'English',
    publisher: 'Scribner',
    edition: 'Reissue edition',
    pageCount: 180,
    tags: ['classic', 'fiction', 'novel'],
    categorySlug: 'fiction',
    images: [
      {
        url: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&q=80&w=600',
        publicId: 'seed/gatsby',
      },
    ],
  },
  {
    title: 'To Kill a Mockingbird',
    author: 'Harper Lee',
    isbn: '9780061120084',
    description: 'The unforgettable novel of a childhood in a sleepy Southern town and the crisis of conscience that rocked it, To Kill a Mockingbird became both an instant bestseller and a critical success when it was first published in 1960.',
    condition: 'good' as const,
    price: 8.50,
    stock: 3,
    language: 'English',
    publisher: 'Harper Perennial Modern Classics',
    edition: '50th Anniversary edition',
    pageCount: 324,
    tags: ['classic', 'fiction', 'drama'],
    categorySlug: 'fiction',
    images: [
      {
        url: 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?auto=format&fit=crop&q=80&w=600',
        publicId: 'seed/mockingbird',
      },
    ],
  },
  {
    title: '1984',
    author: 'George Orwell',
    isbn: '9780451524935',
    description: 'Written more than 70 years ago, 1984 was George Orwell’s chilling prophecy about the future. And while 1984 has come and gone, his dystopian vision of a government that will do anything to control the narrative is timelier than ever.',
    condition: 'new' as const,
    price: 14.99,
    stock: 10,
    language: 'English',
    publisher: 'Signet Classics',
    edition: 'Mass Market Paperback',
    pageCount: 328,
    tags: ['dystopian', 'sci-fi', 'classic'],
    categorySlug: 'fiction',
    images: [
      {
        url: 'https://images.unsplash.com/photo-1532012197267-da84d127e765?auto=format&fit=crop&q=80&w=600',
        publicId: 'seed/1984',
      },
    ],
  },
  {
    title: 'A Brief History of Time',
    author: 'Stephen Hawking',
    isbn: '9780553380163',
    description: 'A landmark volume in science writing by one of the great minds of our time, Stephen Hawking’s book explores the most profound questions at the heart of the cosmos.',
    condition: 'good' as const,
    price: 15.00,
    discountPrice: 12.00,
    stock: 2,
    language: 'English',
    publisher: 'Bantam',
    edition: 'Updated and Expanded Edition',
    pageCount: 212,
    tags: ['science', 'physics', 'space'],
    categorySlug: 'science',
    images: [
      {
        url: 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&q=80&w=600',
        publicId: 'seed/brief_history',
      },
    ],
  },
  {
    title: 'Clean Code: A Handbook of Agile Software Craftsmanship',
    author: 'Robert C. Martin',
    isbn: '9780132350884',
    description: 'Even bad code can function. But if code isn’t clean, it can bring a development organization to its knees. Every year, countless hours and significant resources are lost because of poorly written code. But it doesn’t have to be that way.',
    condition: 'new' as const,
    price: 39.99,
    stock: 8,
    language: 'English',
    publisher: 'Prentice Hall',
    edition: '1st Edition',
    pageCount: 464,
    tags: ['technology', 'programming', 'software'],
    categorySlug: 'technology',
    images: [
      {
        url: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&q=80&w=600',
        publicId: 'seed/clean_code',
      },
    ],
  },
  {
    title: 'Steve Jobs',
    author: 'Walter Isaacson',
    isbn: '9781451648539',
    description: 'Based on more than forty interviews with Jobs conducted over two years—as well as interviews with more than a hundred family members, friends, adversaries, competitors, and colleagues—Walter Isaacson has written a riveting story of the roller-coaster life and searingly intense personality of a creative entrepreneur.',
    condition: 'fair' as const,
    price: 9.99,
    stock: 1,
    language: 'English',
    publisher: 'Simon & Schuster',
    edition: 'Hardcover',
    pageCount: 656,
    tags: ['biography', 'history', 'technology'],
    categorySlug: 'biography',
    images: [
      {
        url: 'https://images.unsplash.com/photo-1495640388908-05fa85288e61?auto=format&fit=crop&q=80&w=600',
        publicId: 'seed/steve_jobs',
      },
    ],
  },
];

async function seed() {
  try {
    console.log('🔄 Connecting to MongoDB...');
    await mongoose.connect(env.MONGODB_URI);
    console.log('✅ MongoDB Connected');

    // 1. Clean existing records
    console.log('🧹 Cleaning existing test data...');
    await UserModel.deleteMany({ email: { $in: [SELLER_EMAIL, CUSTOMER_EMAIL] } });
    await BookModel.deleteMany({});
    await CategoryModel.deleteMany({});

    // 2. Create Users
    console.log('👤 Creating users...');
    const salt = await bcrypt.genSalt(12);
    const passwordHash = await bcrypt.hash('password123', salt);

    const seller = await UserModel.create({
      name: 'John the Seller',
      email: SELLER_EMAIL,
      passwordHash,
      roles: ['customer', 'seller'],
      isEmailVerified: true,
      addresses: [
        {
          street: '123 Book St',
          city: 'Noveltown',
          state: 'NY',
          zipCode: '10001',
          country: 'USA',
          isDefault: true,
        },
      ],
      sellerProfile: {
        storeName: "John's Rare Books",
        bio: 'Curator of the finest classic and scientific literary works.',
        rating: 4.9,
        totalSales: 42,
      },
    });

    const customer = await UserModel.create({
      name: 'Alice Reader',
      email: CUSTOMER_EMAIL,
      passwordHash,
      roles: ['customer'],
      isEmailVerified: true,
      addresses: [
        {
          street: '456 Page Rd',
          city: 'Bibliopolis',
          state: 'CA',
          zipCode: '90210',
          country: 'USA',
          isDefault: true,
        },
      ],
      sellerProfile: null,
    });

    console.log(`✅ Created Seller: ${seller.email}`);
    console.log(`✅ Created Customer: ${customer.email}`);

    // 3. Create Categories
    console.log('📂 Seeding categories...');
    const categoriesMap: Record<string, mongoose.Types.ObjectId> = {};
    for (const cat of CATEGORIES) {
      const doc = await CategoryModel.create({
        name: cat.name,
        slug: cat.slug,
        order: cat.order,
        parentId: null,
      });
      categoriesMap[cat.slug] = doc._id as mongoose.Types.ObjectId;
      console.log(`   - Created Category: ${cat.name}`);
    }

    // 4. Create Books
    console.log('📚 Seeding books...');
    for (const book of BOOKS) {
      const categoryId = categoriesMap[book.categorySlug];
      if (!categoryId) continue;

      const slug = book.title
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, '')
        .replace(/[\s_-]+/g, '-')
        .replace(/^-+|-+$/g, '') + '-' + Math.random().toString(36).substring(2, 6);

      await BookModel.create({
        title: book.title,
        slug,
        author: book.author,
        isbn: book.isbn,
        description: book.description,
        category: categoryId,
        condition: book.condition,
        price: book.price,
        discountPrice: book.discountPrice,
        stock: book.stock,
        language: book.language,
        publisher: book.publisher,
        edition: book.edition,
        pageCount: book.pageCount,
        tags: book.tags,
        images: book.images,
        sellerId: seller._id,
        status: 'active',
        ratingAvg: 4.5,
        ratingCount: 1,
        viewsCount: 12,
      });
      console.log(`   - Created Book: ${book.title}`);
    }

    console.log('🎉 Seeding successfully completed!');
  } catch (error) {
    console.error('❌ Error during seeding:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🚪 Disconnected from MongoDB');
  }
}

seed();
