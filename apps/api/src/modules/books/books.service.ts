import { CatalogRepository } from './catalog.repository';
import { ListingRepository } from './listing.repository';
import { IBookCatalogDocument } from '../../models/book-catalog.model';
import { IBookListingDocument } from '../../models/book-listing.model';
import { NotFoundError, UnauthorizedError, ValidationError } from '../../utils/AppError';
import { Book, BookCondition, BookStatus, BookCatalog, BookListing } from '@bookmarket/types';
import mongoose from 'mongoose';

export class BooksService {
  private catalogRepository: CatalogRepository;
  private listingRepository: ListingRepository;

  constructor() {
    this.catalogRepository = new CatalogRepository();
    this.listingRepository = new ListingRepository();
  }

  private generateSlug(title: string, isbn: string): string {
    const cleanTitle = title
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');
    const cleanIsbn = isbn.replace(/[^0-9X]/gi, '').toLowerCase();
    return `${cleanTitle}-${cleanIsbn}`;
  }

  async getBookById(id: string): Promise<Book> {
    // Try finding by listing ID first
    let listing = await this.listingRepository.findById(id);
    if (listing) {
      const catalog = listing.catalogId as any as IBookCatalogDocument;
      return this.mapCatalogAndListingToBook(catalog, listing);
    }

    // Otherwise try catalog ID
    const catalog = await this.catalogRepository.findById(id);
    if (!catalog) {
      throw new NotFoundError('Book not found');
    }
    const listings = await this.listingRepository.findByCatalogId(catalog._id.toString());
    const cheapestListing = listings[0];
    return this.mapCatalogAndListingToBook(catalog, cheapestListing);
  }

  async getBookBySlug(
    slug: string,
    requestingUser?: { id: string; roles: string[] }
  ): Promise<Book & { listings?: any[] }> {
    const catalog = await this.catalogRepository.findBySlug(slug);
    if (!catalog) {
      throw new NotFoundError('Book listing not found');
    }

    await this.catalogRepository.incrementViewCount(catalog._id.toString());

    // Fetch all active listings for this catalog entry
    const activeListings = await this.listingRepository.findByCatalogId(catalog._id.toString());

    // Populate seller information for each listing
    const listingsWithSeller = await Promise.all(
      activeListings.map(async (l) => {
        const populated = await l.populate('sellerId', 'name email avatar');
        const sellerObj = populated.sellerId as any;
        return {
          id: l._id.toString(),
          sellerId: sellerObj?._id ? sellerObj._id.toString() : l.sellerId.toString(),
          sellerName: sellerObj?.name || 'Verified Seller',
          condition: l.condition,
          price: l.price,
          discountPrice: l.discountPrice,
          stock: l.stock,
          status: l.status,
          createdAt: l.createdAt.toISOString(),
        };
      })
    );

    const cheapestListing = activeListings[0];
    const bookDTO = this.mapCatalogAndListingToBook(catalog, cheapestListing);

    return {
      ...bookDTO,
      lowestPrice: cheapestListing ? cheapestListing.price : catalog.ratingAvg,
      listingCount: activeListings.length,
      listings: listingsWithSeller,
    };
  }

  async getListingsForCatalog(catalogSlug: string) {
    const catalog = await this.catalogRepository.findBySlug(catalogSlug);
    if (!catalog) throw new NotFoundError('Book catalog not found');

    const activeListings = await this.listingRepository.findByCatalogId(catalog._id.toString());
    return Promise.all(
      activeListings.map(async (l) => {
        const populated = await l.populate('sellerId', 'name email avatar');
        const sellerObj = populated.sellerId as any;
        return {
          id: l._id.toString(),
          sellerId: sellerObj?._id ? sellerObj._id.toString() : l.sellerId.toString(),
          sellerName: sellerObj?.name || 'Verified Seller',
          condition: l.condition,
          price: l.price,
          discountPrice: l.discountPrice,
          stock: l.stock,
          status: l.status,
          createdAt: l.createdAt.toISOString(),
        };
      })
    );
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
    const filter: Record<string, unknown> = {};

    if (query.search) {
      filter.$text = { $search: query.search };
    }

    if (query.category) {
      filter.category = new mongoose.Types.ObjectId(query.category);
    }

    const sort: Record<string, unknown> = {};
    if (query.search) {
      sort.score = { $meta: 'textScore' };
    } else if (query.sortBy) {
      sort[query.sortBy] = query.sortOrder === 'asc' ? 1 : -1;
    } else {
      sort.createdAt = -1;
    }

    const { docs, total } = await this.catalogRepository.findAndPaginate(
      filter,
      sort,
      query.page,
      query.limit
    );

    const books = docs.map((doc) => {
      const categoryId = doc.category
        ? doc.category._id
          ? doc.category._id.toString()
          : doc.category.toString()
        : '';

      return {
        id: doc._id.toString(),
        title: doc.title,
        slug: doc.slug,
        author: doc.author,
        isbn: doc.isbn,
        description: doc.description,
        category: categoryId,
        condition: 'good' as BookCondition,
        price: doc.lowestPrice || 0,
        discountPrice: undefined,
        images: doc.images || [],
        stock: doc.listingCount || 1,
        sellerId: '',
        status: 'active' as BookStatus,
        tags: doc.tags || [],
        language: doc.language || 'English',
        publisher: doc.publisher,
        edition: doc.edition,
        pageCount: doc.pageCount,
        ratingAvg: doc.ratingAvg || 0,
        ratingCount: doc.ratingCount || 0,
        viewsCount: doc.viewsCount || 0,
        lowestPrice: doc.lowestPrice,
        listingCount: doc.listingCount,
        createdAt: doc.createdAt ? new Date(doc.createdAt).toISOString() : new Date().toISOString(),
        updatedAt: doc.updatedAt ? new Date(doc.updatedAt).toISOString() : new Date().toISOString(),
      };
    });

    return { books, total };
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
    const slug = this.generateSlug(data.title, data.isbn);

    // 1. Find or create canonical catalog entry by ISBN (deduplication!)
    const { doc: catalog } = await this.catalogRepository.findOrCreate({
      title: data.title,
      slug,
      author: data.author,
      isbn: data.isbn.trim(),
      description: data.description,
      category: new mongoose.Types.ObjectId(data.category),
      images: data.images || [],
      tags: data.tags || [],
      language: data.language || 'English',
      publisher: data.publisher,
      edition: data.edition,
      pageCount: data.pageCount,
      ratingAvg: 0,
      ratingCount: 0,
      viewsCount: 0,
    });

    // 2. Check if seller already has a listing for this catalog entry
    const existingListing = await this.listingRepository.findBySellerAndCatalog(
      sellerId,
      catalog._id.toString()
    );

    if (existingListing) {
      if (['active', 'pending'].includes(existingListing.status)) {
        throw new ValidationError(
          'You already have an active or pending listing for this book (ISBN: ' + data.isbn + '). Please edit your existing listing.'
        );
      }
      // Update existing inactive/rejected listing
      existingListing.price = data.price;
      existingListing.discountPrice = data.discountPrice;
      existingListing.condition = data.condition;
      existingListing.stock = data.stock;
      existingListing.status = 'pending';
      existingListing.rejectionReason = '';
      existingListing.moderationHistory.push({
        status: 'pending',
        notes: 'Resubmitted listing for review',
        timestamp: new Date(),
      } as any);
      await existingListing.save();
      return this.mapCatalogAndListingToBook(catalog, existingListing);
    }

    // 3. Create new seller listing referencing canonical catalog entry
    const listing = await this.listingRepository.create({
      catalogId: catalog._id as mongoose.Types.ObjectId,
      sellerId: new mongoose.Types.ObjectId(sellerId),
      condition: data.condition,
      price: data.price,
      discountPrice: data.discountPrice,
      stock: data.stock,
      status: 'pending',
      rejectionReason: '',
      moderationHistory: [
        {
          status: 'pending',
          notes: 'Listing created and submitted for review',
          timestamp: new Date(),
        },
      ],
    });

    return this.mapCatalogAndListingToBook(catalog, listing);
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
    let listing = await this.listingRepository.findById(id);
    if (!listing) {
      throw new NotFoundError('Book listing not found');
    }

    const isOwner = listing.sellerId.toString() === sellerId;
    const isAdmin = roles.includes('admin');
    if (!isOwner && !isAdmin) {
      throw new UnauthorizedError('You are not authorized to update this listing');
    }

    const updateData: any = {};
    if (data.price !== undefined) updateData.price = data.price;
    if (data.discountPrice !== undefined) updateData.discountPrice = data.discountPrice;
    if (data.condition) updateData.condition = data.condition;
    if (data.stock !== undefined) updateData.stock = data.stock;
    if (data.status) updateData.status = data.status;

    if (!isAdmin && (listing.status === 'rejected' || data.status === 'pending')) {
      updateData.status = 'pending';
      updateData.rejectionReason = '';
    }

    if (updateData.status === 'pending' && listing.status !== 'pending') {
      const history = listing.moderationHistory || [];
      history.push({
        status: 'pending',
        notes: 'Resubmitted by seller for review',
        timestamp: new Date(),
      } as any);
      updateData.moderationHistory = history;
    }

    const updatedListing = await this.listingRepository.update(id, updateData);
    const catalog = await this.catalogRepository.findById(listing.catalogId.toString());

    return this.mapCatalogAndListingToBook(catalog!, updatedListing!);
  }

  async deleteBook(sellerId: string, roles: string[], id: string): Promise<void> {
    const listing = await this.listingRepository.findById(id);
    if (!listing) {
      throw new NotFoundError('Book listing not found');
    }

    const isOwner = listing.sellerId.toString() === sellerId;
    const isAdmin = roles.includes('admin');
    if (!isOwner && !isAdmin) {
      throw new UnauthorizedError('You are not authorized to delete this listing');
    }

    await this.listingRepository.delete(id);
  }

  private mapCatalogAndListingToBook(
    catalog: IBookCatalogDocument,
    listing?: IBookListingDocument | null
  ): Book {
    const categoryId = catalog.category
      ? (catalog.category as any)._id
        ? (catalog.category as any)._id.toString()
        : catalog.category.toString()
      : '';

    return {
      id: listing ? listing._id.toString() : catalog._id.toString(),
      title: catalog.title,
      slug: catalog.slug,
      author: catalog.author,
      isbn: catalog.isbn,
      description: catalog.description,
      category: categoryId,
      condition: listing ? listing.condition : ('good' as BookCondition),
      price: listing ? listing.price : 0,
      discountPrice: listing ? listing.discountPrice : undefined,
      images: catalog.images || [],
      stock: listing ? listing.stock : 0,
      sellerId: listing ? listing.sellerId.toString() : '',
      status: listing ? listing.status : ('active' as BookStatus),
      tags: catalog.tags || [],
      language: catalog.language || 'English',
      publisher: catalog.publisher,
      edition: catalog.edition,
      pageCount: catalog.pageCount,
      ratingAvg: catalog.ratingAvg || 0,
      ratingCount: catalog.ratingCount || 0,
      viewsCount: catalog.viewsCount || 0,
      rejectionReason: listing ? listing.rejectionReason : undefined,
      moderationHistory: listing?.moderationHistory?.map((item) => ({
        status: item.status,
        notes: item.notes,
        moderatorId: item.moderatorId?.toString(),
        timestamp: item.timestamp.toISOString(),
      })),
      createdAt: listing ? listing.createdAt.toISOString() : catalog.createdAt.toISOString(),
      updatedAt: listing ? listing.updatedAt.toISOString() : catalog.updatedAt.toISOString(),
    };
  }
}
export default BooksService;
