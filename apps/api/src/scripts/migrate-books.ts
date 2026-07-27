import mongoose from 'mongoose';
import BookModel from '../models/book.model';
import BookCatalogModel from '../models/book-catalog.model';
import BookListingModel from '../models/book-listing.model';

export async function migrateBooksToCatalogAndListings() {
  console.log('Starting book catalog and listing migration...');

  const books = await BookModel.find().exec();
  console.log(`Found ${books.length} existing book documents to migrate.`);

  let catalogCreatedCount = 0;
  let listingCreatedCount = 0;

  for (const book of books) {
    const cleanIsbn = (book.isbn || '9780000000000').trim();

    // 1. Find or create catalog entry by ISBN
    let catalog = await BookCatalogModel.findOne({ isbn: cleanIsbn }).exec();

    if (!catalog) {
      catalog = new BookCatalogModel({
        title: book.title,
        slug: book.slug,
        author: book.author,
        isbn: cleanIsbn,
        description: book.description,
        category: book.category,
        images: book.images || [],
        tags: book.tags || [],
        language: book.language || 'English',
        publisher: book.publisher,
        edition: book.edition,
        pageCount: book.pageCount,
        ratingAvg: book.ratingAvg || 0,
        ratingCount: book.ratingCount || 0,
        viewsCount: book.viewsCount || 0,
      });
      await catalog.save();
      catalogCreatedCount++;
    }

    // 2. Check if listing already exists for this seller + catalog
    const existingListing = await BookListingModel.findOne({
      catalogId: catalog._id,
      sellerId: book.sellerId,
    }).exec();

    if (!existingListing) {
      const listing = new BookListingModel({
        catalogId: catalog._id,
        sellerId: book.sellerId,
        condition: book.condition,
        price: book.price,
        discountPrice: book.discountPrice,
        stock: book.stock,
        status: book.status,
        rejectionReason: book.rejectionReason,
        moderationHistory: book.moderationHistory || [],
      });
      await listing.save();
      listingCreatedCount++;
    }
  }

  console.log(
    `Migration complete! Created ${catalogCreatedCount} catalog entries and ${listingCreatedCount} listing records.`
  );
}

// If run directly via ts-node / node
if (require.main === module) {
  const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/bookmarket';
  mongoose
    .connect(mongoUri)
    .then(() => migrateBooksToCatalogAndListings())
    .then(() => mongoose.disconnect())
    .catch((err) => {
      console.error('Migration failed:', err);
      process.exit(1);
    });
}
