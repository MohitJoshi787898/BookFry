import { WishlistRepository } from './wishlist.repository';
import { BooksRepository } from '../books/books.repository';
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
      title: doc.title,
      slug: doc.slug,
      author: doc.author,
      isbn: doc.isbn,
      description: doc.description,
      category: doc.category
        ? (doc.category as any)._id?.toString() || doc.category.toString()
        : '',
      condition: doc.condition,
      price: doc.price,
      discountPrice: doc.discountPrice,
      images: doc.images,
      stock: doc.stock,
      sellerId: doc.sellerId.toString(),
      status: doc.status,
      tags: doc.tags,
      language: doc.language,
      publisher: doc.publisher,
      edition: doc.edition,
      pageCount: doc.pageCount,
      ratingAvg: doc.ratingAvg,
      ratingCount: doc.ratingCount,
      viewsCount: doc.viewsCount,
      createdAt: doc.createdAt.toISOString(),
      updatedAt: doc.updatedAt.toISOString(),
    };
  }

  async getWishlist(userId: string): Promise<{ wishlist: Wishlist; books: Book[] }> {
    let doc = await this.wishlistRepository.findByUserIdPopulated(userId);
    if (!doc) {
      doc = await this.wishlistRepository.create(userId);
    }

    const books = (doc.bookIds || [])
      .filter((b: any) => b && b._id && b.status === 'active') // filter out deleted, unpopulated, or non-active books
      .map((b: any) => this.mapBookToDTO(b));

    return {
      wishlist: {
        id: doc._id.toString(),
        userId: doc.userId.toString(),
        bookIds: (doc.bookIds || []).map((b: any) => (b._id || b).toString()),
      },
      books,
    };
  }

  async addToWishlist(userId: string, bookId: string): Promise<Wishlist> {
    const book = await this.booksRepository.findById(bookId);
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
