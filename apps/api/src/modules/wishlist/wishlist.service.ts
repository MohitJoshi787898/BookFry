import { WishlistRepository } from './wishlist.repository';
import { BooksRepository } from '../books/books.repository';
import { BookListingModel } from '../../models/book-listing.model';
import { BookCatalogModel } from '../../models/book-catalog.model';
import { NotFoundError } from '../../utils/AppError';
import { Wishlist, Book } from '@bookmarket/types';
import mongoose from 'mongoose';

export class WishlistService {
  private wishlistRepository: WishlistRepository;
  private booksRepository: BooksRepository;

  constructor() {
    this.wishlistRepository = new WishlistRepository();
    this.booksRepository = new BooksRepository();
  }

  private mapBookToDTO(doc: any): Book {
    return {
      id: doc._id.toString(),
      title: doc.title || doc.catalogId?.title || 'Untitled Book',
      slug: doc.slug || doc.catalogId?.slug || '',
      author: doc.author || doc.catalogId?.author || 'Unknown Author',
      isbn: doc.isbn || doc.catalogId?.isbn || '',
      description: doc.description || doc.catalogId?.description || '',
      category: doc.category
        ? (doc.category as any)._id?.toString() || doc.category.toString()
        : '',
      condition: doc.condition || 'good',
      price: doc.price || 0,
      discountPrice: doc.discountPrice,
      images: doc.images || doc.catalogId?.images || [],
      stock: doc.stock || 1,
      sellerId: doc.sellerId?.toString() || '',
      status: doc.status || 'active',
      tags: doc.tags || doc.catalogId?.tags || [],
      language: doc.language || doc.catalogId?.language || 'English',
      publisher: doc.publisher || doc.catalogId?.publisher,
      edition: doc.edition || doc.catalogId?.edition,
      pageCount: doc.pageCount || doc.catalogId?.pageCount,
      ratingAvg: doc.ratingAvg || 0,
      ratingCount: doc.ratingCount || 0,
      viewsCount: doc.viewsCount || 0,
      createdAt: doc.createdAt ? doc.createdAt.toISOString() : new Date().toISOString(),
      updatedAt: doc.updatedAt ? doc.updatedAt.toISOString() : new Date().toISOString(),
    };
  }

  async getWishlist(userId: string): Promise<{ wishlist: Wishlist; books: Book[] }> {
    let doc = await this.wishlistRepository.findByUserId(userId);
    if (!doc) {
      doc = await this.wishlistRepository.create(userId);
    }

    const rawBookIds = (doc.bookIds || []).map((id) => id.toString());
    const books: Book[] = [];

    for (const bId of rawBookIds) {
      const listing = await BookListingModel.findById(bId).populate('catalogId');
      if (listing) {
        books.push(this.mapBookToDTO(listing));
      } else {
        const legacyBook = await this.booksRepository.findById(bId);
        if (legacyBook) {
          books.push(this.mapBookToDTO(legacyBook));
        }
      }
    }

    return {
      wishlist: {
        id: doc._id.toString(),
        userId: doc.userId.toString(),
        bookIds: rawBookIds,
      },
      books,
    };
  }

  async addToWishlist(userId: string, bookId: string): Promise<Wishlist> {
    let book = await this.booksRepository.findById(bookId);
    if (!book) {
      const listing = await BookListingModel.findById(bookId);
      if (listing) book = listing as any;
    }
    if (!book) {
      const catalog = await BookCatalogModel.findById(bookId);
      if (catalog) book = catalog as any;
    }
    if (!book) {
      throw new NotFoundError('Book not found');
    }

    let doc = await this.wishlistRepository.findByUserId(userId);
    if (!doc) {
      doc = await this.wishlistRepository.create(userId);
    }

    const bookObjectId = new mongoose.Types.ObjectId(bookId);
    if (!doc.bookIds.some((id) => id.toString() === bookId)) {
      doc.bookIds.push(bookObjectId);
      await this.wishlistRepository.save(doc);
    }

    return {
      id: doc._id.toString(),
      userId: doc.userId.toString(),
      bookIds: doc.bookIds.map((id) => id.toString()),
    };
  }

  async removeFromWishlist(userId: string, bookId: string): Promise<Wishlist> {
    let doc = await this.wishlistRepository.findByUserId(userId);
    if (!doc) {
      doc = await this.wishlistRepository.create(userId);
    }

    doc.bookIds = doc.bookIds.filter((id) => id.toString() !== bookId);
    await this.wishlistRepository.save(doc);

    return {
      id: doc._id.toString(),
      userId: doc.userId.toString(),
      bookIds: doc.bookIds.map((id) => id.toString()),
    };
  }
}
export default WishlistService;
