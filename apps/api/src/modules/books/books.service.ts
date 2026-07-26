import { BooksRepository } from './books.repository';
import { IBookDocument } from '../../models/book.model';
import { NotFoundError, UnauthorizedError } from '../../utils/AppError';
import { Book, BookCondition, BookStatus } from '@bookmarket/types';
import mongoose from 'mongoose';

export class BooksService {
  private booksRepository: BooksRepository;

  constructor() {
    this.booksRepository = new BooksRepository();
  }

  private generateSlug(title: string): string {
    return (
      title
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, '')
        .replace(/[\s_-]+/g, '-')
        .replace(/^-+|-+$/g, '') +
      '-' +
      Math.random().toString(36).substring(2, 6)
    );
  }

  async getBookById(id: string): Promise<Book> {
    const doc = await this.booksRepository.findById(id);
    if (!doc) {
      throw new NotFoundError('Book listing not found');
    }
    return this.mapToDTO(doc);
  }

  async getBookBySlug(slug: string, requestingUser?: { id: string; roles: string[] }): Promise<Book> {
    const doc = await this.booksRepository.findBySlug(slug);
    if (!doc) {
      throw new NotFoundError('Book listing not found');
    }

    const isOwner = requestingUser && doc.sellerId.toString() === requestingUser.id;
    const isAdmin = requestingUser && requestingUser.roles.includes('admin');

    if (doc.status !== 'active' && !isOwner && !isAdmin) {
      throw new NotFoundError('Book listing not found or is inactive');
    }

    doc.viewsCount += 1;
    await doc.save();
    return this.mapToDTO(doc);
  }

  async listBooks(query: {
    page: number;
    limit: number;
    search?: string;
    category?: string;
    condition?: string;
    minPrice?: number;
    maxPrice?: number;
    sortBy?: string;
    sortOrder: 'asc' | 'desc';
  }): Promise<{ books: Book[]; total: number }> {
    const filter: any = { status: 'active' };

    if (query.search) {
      filter.$text = { $search: query.search };
    }

    if (query.category) {
      filter.category = new mongoose.Types.ObjectId(query.category);
    }

    if (query.condition) {
      const conditions = query.condition.split(',');
      filter.condition = { $in: conditions };
    }

    if (query.minPrice !== undefined || query.maxPrice !== undefined) {
      filter.price = {};
      if (query.minPrice !== undefined) filter.price.$gte = query.minPrice;
      if (query.maxPrice !== undefined) filter.price.$lte = query.maxPrice;
    }

    const sort: any = {};
    if (query.search) {
      sort.score = { $meta: 'textScore' };
    } else if (query.sortBy) {
      sort[query.sortBy] = query.sortOrder === 'asc' ? 1 : -1;
    } else {
      sort.createdAt = -1;
    }

    const { docs, total } = await this.booksRepository.findAndPaginate(
      filter,
      sort,
      query.page,
      query.limit
    );
    return {
      books: docs.map((doc) => this.mapToDTO(doc)),
      total,
    };
  }

  async createBook(
    sellerId: string,
    data: {
      title: string;
      author: string;
      isbn: string;
      description: string;
      category: string;
      condition: BookCondition;
      price: number;
      discountPrice?: number;
      stock: number;
      tags?: string[];
      language?: string;
      publisher?: string;
      edition?: string;
      pageCount?: number;
      images?: Array<{ url: string; publicId: string }>;
    }
  ): Promise<Book> {
    const slug = this.generateSlug(data.title);

    const doc = await this.booksRepository.create({
      ...data,
      slug,
      category: new mongoose.Types.ObjectId(data.category),
      sellerId: new mongoose.Types.ObjectId(sellerId),
      status: 'pending',
      tags: data.tags || [],
      language: data.language || 'English',
      ratingAvg: 0,
      ratingCount: 0,
      viewsCount: 0,
      images: data.images || [],
      moderationHistory: [
        {
          status: 'pending',
          notes: 'Listing created and submitted for review',
          timestamp: new Date(),
        },
      ],
    });

    return this.mapToDTO(doc);
  }

  async updateBook(
    sellerId: string,
    roles: string[],
    id: string,
    data: Partial<{
      title: string;
      author: string;
      isbn: string;
      description: string;
      category: string;
      condition: BookCondition;
      price: number;
      discountPrice: number;
      stock: number;
      tags: string[];
      language: string;
      publisher: string;
      edition: string;
      pageCount: number;
      status: BookStatus;
      images: Array<{ url: string; publicId: string }>;
    }>
  ): Promise<Book> {
    const book = await this.booksRepository.findById(id);
    if (!book) {
      throw new NotFoundError('Book listing not found');
    }

    const isOwner = book.sellerId.toString() === sellerId;
    const isAdmin = roles.includes('admin');
    if (!isOwner && !isAdmin) {
      throw new UnauthorizedError('You are not authorized to update this listing');
    }

    const updateData: any = { ...data };
    if (data.category) {
      updateData.category = new mongoose.Types.ObjectId(data.category);
    }

    if (data.title && data.title !== book.title) {
      updateData.slug = this.generateSlug(data.title);
    }

    // Handlers for status transitions and resubmission
    if (!isAdmin) {
      if (book.status === 'rejected' || data.status === 'pending') {
        updateData.status = 'pending';
        updateData.rejectionReason = ''; // clear rejection reason
      }
    }

    // Add entry to moderation history if status changed to pending
    if (updateData.status === 'pending' && book.status !== 'pending') {
      const history = book.moderationHistory || [];
      history.push({
        status: 'pending',
        notes: 'Resubmitted by seller for review',
        timestamp: new Date(),
      } as any);
      updateData.moderationHistory = history;
    }

    const updatedDoc = await this.booksRepository.update(id, updateData);
    if (!updatedDoc) {
      throw new NotFoundError('Book not found for update');
    }

    return this.mapToDTO(updatedDoc);
  }

  async deleteBook(sellerId: string, roles: string[], id: string): Promise<void> {
    const book = await this.booksRepository.findById(id);
    if (!book) {
      throw new NotFoundError('Book listing not found');
    }

    const isOwner = book.sellerId.toString() === sellerId;
    const isAdmin = roles.includes('admin');
    if (!isOwner && !isAdmin) {
      throw new UnauthorizedError('You are not authorized to delete this listing');
    }

    await this.booksRepository.delete(id);
  }

  mapToDTO(doc: IBookDocument): Book {
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
      rejectionReason: doc.rejectionReason,
      moderationHistory: doc.moderationHistory?.map((item) => ({
        status: item.status,
        notes: item.notes,
        moderatorId: item.moderatorId?.toString(),
        timestamp: item.timestamp.toISOString(),
      })),
      createdAt: doc.createdAt.toISOString(),
      updatedAt: doc.updatedAt.toISOString(),
    };
  }
}
export default BooksService;
