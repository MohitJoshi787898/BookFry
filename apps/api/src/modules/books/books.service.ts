import { CatalogRepository } from './catalog.repository';
import { ListingRepository } from './listing.repository';
import { IBookCatalogDocument } from '../../models/book-catalog.model';
import { IBookListingDocument } from '../../models/book-listing.model';
import { NotFoundError, UnauthorizedError, ValidationError } from '../../utils/AppError';
import { Book, BookCondition, BookStatus, BookCatalog, BookListing } from '@bookmarket/types';
import { deleteFromCloudinary } from '../../config/cloudinary';
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
    catalog.viewsCount = (catalog.viewsCount || 0) + 1;

    // Fetch all active listings for this catalog entry
    const activeListings = await this.listingRepository.findByCatalogId(catalog._id.toString());

    // Use pre-populated seller information
    const listingsWithSeller = activeListings.map((l) => {
      const sellerObj = l.sellerId as any;
      return {
        id: l._id.toString(),
        sellerId: sellerObj?._id ? sellerObj._id.toString() : (l.sellerId ? l.sellerId.toString() : ''),
        sellerName: sellerObj?.name || 'Verified Seller',
        sellerCity: l.city || sellerObj?.addresses?.[0]?.city || undefined,
        sellerState: l.state || sellerObj?.addresses?.[0]?.state || undefined,
        sellerPincode: l.pincode || sellerObj?.addresses?.[0]?.zipCode || undefined,
        campusName: l.campusName,
        condition: l.condition,
        conditionNotes: l.conditionNotes,
        images: (l.images && l.images.length > 0) ? l.images : (catalog.images || []),
        price: l.price,
        discountPrice: l.discountPrice,
        stock: l.stock,
        status: l.status,
        catalogId: catalog._id.toString(),
        createdAt: l.createdAt.toISOString(),
        updatedAt: (l.updatedAt || l.createdAt).toISOString(),
      };
    });

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
    return activeListings.map((l) => {
      const sellerObj = l.sellerId as any;
      return {
        id: l._id.toString(),
        sellerId: sellerObj?._id ? sellerObj._id.toString() : (l.sellerId ? l.sellerId.toString() : ''),
        sellerName: sellerObj?.name || 'Verified Seller',
        sellerCity: l.city || sellerObj?.addresses?.[0]?.city || undefined,
        sellerState: l.state || sellerObj?.addresses?.[0]?.state || undefined,
        sellerPincode: l.pincode || sellerObj?.addresses?.[0]?.zipCode || undefined,
        campusName: l.campusName,
        condition: l.condition,
        conditionNotes: l.conditionNotes,
        images: (l.images && l.images.length > 0) ? l.images : (catalog.images || []),
        price: l.price,
        discountPrice: l.discountPrice,
        stock: l.stock,
        status: l.status,
        catalogId: catalog._id.toString(),
        createdAt: l.createdAt.toISOString(),
        updatedAt: (l.updatedAt || l.createdAt).toISOString(),
      };
    });
  }

  private calculateDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371; // Earth radius in km
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return parseFloat((R * c).toFixed(1));
  }

  async listBooks(query: {
    page: number;
    limit: number;
    search?: string;
    category?: string;
    conditionType?: 'all' | 'new' | 'used';
    condition?: string;
    minPrice?: number;
    maxPrice?: number;
    city?: string;
    state?: string;
    pincode?: string;
    campusName?: string;
    lat?: number;
    lng?: number;
    maxDistanceKm?: number;
    sortBy?: string;
    sortOrder: 'asc' | 'desc';
  }): Promise<{ books: Book[]; total: number }> {
    const filter: Record<string, unknown> = {};

    if (query.search) {
      const trimmedSearch = query.search.trim();
      const cleanIsbnSearch = trimmedSearch.replace(/[^0-9X]/gi, '').toUpperCase();
      const isLikelyIsbn = cleanIsbnSearch.length >= 8 && /^[\d\-X\s]+$/i.test(trimmedSearch);

      if (isLikelyIsbn) {
        filter.$or = [
          { isbn: { $regex: cleanIsbnSearch, $options: 'i' } },
          { title: { $regex: trimmedSearch.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), $options: 'i' } },
        ];
      } else {
        const escaped = trimmedSearch.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        filter.$or = [
          { title: { $regex: escaped, $options: 'i' } },
          { author: { $regex: escaped, $options: 'i' } },
          { tags: { $regex: escaped, $options: 'i' } },
          ...(cleanIsbnSearch.length >= 3 ? [{ isbn: { $regex: cleanIsbnSearch, $options: 'i' } }] : []),
        ];
      }
    }

    if (query.category) {
      filter.category = new mongoose.Types.ObjectId(query.category);
    }

    const sort: Record<string, unknown> = {};
    if (query.sortBy === 'price_asc') {
      sort.lowestPrice = 1;
    } else if (query.sortBy === 'price_desc') {
      sort.lowestPrice = -1;
    } else if (query.sortBy === 'rating') {
      sort.ratingAvg = -1;
    } else if (query.sortBy) {
      sort[query.sortBy] = query.sortOrder === 'asc' ? 1 : -1;
    } else {
      sort.createdAt = -1;
    }

    const { docs, total } = await this.catalogRepository.findAndPaginate(
      filter,
      sort,
      query.page,
      query.limit,
      {
        conditionType: query.conditionType,
        condition: query.condition,
        minPrice: query.minPrice,
        maxPrice: query.maxPrice,
        city: query.city,
        state: query.state,
        pincode: query.pincode,
        campusName: query.campusName,
        lat: query.lat,
        lng: query.lng,
        maxDistanceKm: query.maxDistanceKm,
      }
    );

    const books = docs.map((doc) => {
      const categoryId = doc.category
        ? doc.category._id
          ? doc.category._id.toString()
          : doc.category.toString()
        : '';

      const bookId = doc.primaryListingId
        ? doc.primaryListingId.toString()
        : doc._id.toString();

      let distanceKm: number | undefined;
      if (
        query.lat !== undefined &&
        query.lng !== undefined &&
        doc.primaryListingLocation?.coordinates?.length === 2
      ) {
        const [listingLng, listingLat] = doc.primaryListingLocation.coordinates;
        distanceKm = this.calculateDistanceKm(query.lat, query.lng, listingLat, listingLng);
      }

      return {
        id: bookId,
        title: doc.title,
        slug: doc.slug,
        author: doc.author,
        isbn: doc.isbn,
        description: doc.description,
        category: categoryId,
        condition: (doc.primaryListingCondition || 'good') as BookCondition,
        price: doc.lowestPrice || 0,
        discountPrice: undefined,
        images: doc.images || [],
        stock: doc.listingCount || 1,
        sellerId: doc.primaryListingSellerId ? doc.primaryListingSellerId.toString() : '',
        sellerCity: doc.primaryListingCity,
        sellerState: doc.primaryListingState,
        sellerPincode: doc.primaryListingPincode,
        campusName: doc.primaryListingCampusName,
        distanceKm,
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
      conditionNotes?: string;
      price: number;
      discountPrice?: number;
      stock: number;
      tags?: string[];
      language?: string;
      publisher?: string;
      edition?: string;
      pageCount?: number;
      city?: string;
      state?: string;
      pincode?: string;
      campusName?: string;
      lat?: number;
      lng?: number;
      images?: Array<{ url: string; publicId: string }>;
    }
  ): Promise<Book> {
    // 0. Auto promote user to 'seller' role if needed
    const { UserModel } = await import('../../models/user.model');
    const sellerUser = await UserModel.findByIdAndUpdate(
      sellerId,
      { $addToSet: { roles: 'seller' } },
      { new: true }
    ).exec();

    const cleanIsbn = data.isbn.replace(/[^0-9X]/gi, '').toUpperCase();
    const slug = this.generateSlug(data.title, cleanIsbn);

    // 1. Find or create canonical catalog entry by ISBN (deduplication!)
    const catalogDescription =
      data.description && data.description.trim().length >= 10
        ? data.description.trim()
        : `${data.title} by ${data.author}. Available on the BookFry marketplace.`;

    const { doc: catalog } = await this.catalogRepository.findOrCreate({
      title: data.title,
      slug,
      author: data.author,
      isbn: cleanIsbn,
      description: catalogDescription,
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

    // 2. Resolve seller listing location details (explicit or from profile default address)
    const defaultAddress = sellerUser?.addresses?.find((a) => a.isDefault) || sellerUser?.addresses?.[0];
    const listingCity = data.city || defaultAddress?.city || undefined;
    const listingState = data.state || defaultAddress?.state || undefined;
    const listingPincode = data.pincode || defaultAddress?.zipCode || undefined;
    const listingCampus = data.campusName || undefined;

    let listingLocation: { type: 'Point'; coordinates: [number, number] } | undefined;
    if (data.lat !== undefined && data.lng !== undefined) {
      listingLocation = { type: 'Point', coordinates: [data.lng, data.lat] };
    } else if (defaultAddress?.location?.coordinates?.length === 2) {
      listingLocation = { type: 'Point', coordinates: defaultAddress.location.coordinates };
    }

    // 3. Check if seller already has a listing for this catalog entry
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
      if (data.conditionNotes) existingListing.conditionNotes = data.conditionNotes;
      if (data.images && data.images.length > 0) existingListing.images = data.images;
      existingListing.stock = data.stock;
      existingListing.status = 'pending';
      existingListing.rejectionReason = '';
      if (listingCity) existingListing.city = listingCity;
      if (listingState) existingListing.state = listingState;
      if (listingPincode) existingListing.pincode = listingPincode;
      if (listingCampus) existingListing.campusName = listingCampus;
      if (listingLocation) existingListing.location = listingLocation;

      existingListing.moderationHistory.push({
        status: 'pending',
        notes: 'Resubmitted listing for review',
        timestamp: new Date(),
      } as any);
      await existingListing.save();
      return this.mapCatalogAndListingToBook(catalog, existingListing);
    }

    // 4. Create new seller listing referencing canonical catalog entry
    const listing = await this.listingRepository.create({
      catalogId: catalog._id as mongoose.Types.ObjectId,
      sellerId: new mongoose.Types.ObjectId(sellerId),
      condition: data.condition,
      conditionNotes: data.conditionNotes || (data.description ? data.description : undefined),
      images: data.images || [],
      price: data.price,
      discountPrice: data.discountPrice,
      stock: data.stock,
      city: listingCity,
      state: listingState,
      pincode: listingPincode,
      campusName: listingCampus,
      location: listingLocation,
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
      conditionNotes: string;
      price: number;
      discountPrice: number;
      stock: number;
      tags: string[];
      language: string;
      publisher: string;
      edition: string;
      pageCount: number;
      city: string;
      state: string;
      pincode: string;
      campusName: string;
      lat: number;
      lng: number;
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
    if (data.conditionNotes !== undefined) updateData.conditionNotes = data.conditionNotes;
    if (data.images && data.images.length > 0) {
      // Prevent orphaned images: delete any old Cloudinary assets not present in the new list
      const newPublicIds = new Set(data.images.map((img) => img.publicId));
      for (const oldImg of listing.images || []) {
        if (
          oldImg.publicId &&
          !newPublicIds.has(oldImg.publicId) &&
          !oldImg.publicId.startsWith('mock_') &&
          !oldImg.publicId.startsWith('img_')
        ) {
          deleteFromCloudinary(oldImg.publicId).catch(() => {});
        }
      }
      updateData.images = data.images;
    }
    if (data.stock !== undefined) updateData.stock = data.stock;
    if (data.status) updateData.status = data.status;
    if (data.city !== undefined) updateData.city = data.city;
    if (data.state !== undefined) updateData.state = data.state;
    if (data.pincode !== undefined) updateData.pincode = data.pincode;
    if (data.campusName !== undefined) updateData.campusName = data.campusName;
    if (data.lat !== undefined && data.lng !== undefined) {
      updateData.location = { type: 'Point', coordinates: [data.lng, data.lat] };
    }

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

    // Clean up all Cloudinary assets associated with this listing
    if (listing.images && listing.images.length > 0) {
      for (const img of listing.images) {
        if (
          img.publicId &&
          !img.publicId.startsWith('mock_') &&
          !img.publicId.startsWith('img_')
        ) {
          deleteFromCloudinary(img.publicId).catch(() => {});
        }
      }
    }

    await this.listingRepository.delete(id);
  }

  public mapCatalogAndListingToBook(
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
      conditionNotes: listing ? listing.conditionNotes : undefined,
      price: listing ? listing.price : 0,
      discountPrice: listing ? listing.discountPrice : undefined,
      images: (listing?.images && listing.images.length > 0) ? listing.images : (catalog.images || []),
      stock: listing ? listing.stock : 0,
      sellerId: listing ? listing.sellerId.toString() : '',
      sellerCity: listing ? listing.city : undefined,
      sellerState: listing ? listing.state : undefined,
      sellerPincode: listing ? listing.pincode : undefined,
      campusName: listing ? listing.campusName : undefined,
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

  async lookupIsbn(rawIsbn: string): Promise<{
    source: 'catalog' | 'openlibrary' | 'google';
    book: {
      title: string;
      author: string;
      isbn: string;
      publisher?: string;
      edition?: string;
      pageCount?: number;
      category?: string;
      images: Array<{ url: string; publicId?: string }>;
      description?: string;
    };
  } | null> {
    const cleanIsbn = (rawIsbn || '').replace(/[^0-9X]/gi, '').toUpperCase();
    if (cleanIsbn.length !== 10 && cleanIsbn.length !== 13) {
      throw new ValidationError('Please provide a valid 10 or 13 digit ISBN.');
    }

    // 1. Check local catalog
    const localCatalog = await this.catalogRepository.findByIsbn(cleanIsbn);
    if (localCatalog) {
      const categoryId = localCatalog.category
        ? (localCatalog.category as any)._id
          ? (localCatalog.category as any)._id.toString()
          : localCatalog.category.toString()
        : undefined;

      return {
        source: 'catalog',
        book: {
          title: localCatalog.title,
          author: localCatalog.author,
          isbn: localCatalog.isbn,
          publisher: localCatalog.publisher,
          edition: localCatalog.edition,
          pageCount: localCatalog.pageCount,
          category: categoryId,
          images: localCatalog.images || [],
          description: localCatalog.description,
        },
      };
    }

    // 2. Try OpenLibrary Search API
    try {
      const olRes = await fetch(`https://openlibrary.org/search.json?isbn=${cleanIsbn}`, {
        signal: AbortSignal.timeout(5000),
      });
      if (olRes.ok) {
        const olData = (await olRes.json()) as any;
        const doc = olData?.docs?.[0];
        if (doc && doc.title) {
          const author = Array.isArray(doc.author_name) ? doc.author_name.join(', ') : (doc.author_name || '');
          const publisher = Array.isArray(doc.publisher) ? doc.publisher[0] : (doc.publisher || '');
          const coverUrl = doc.cover_i
            ? `https://covers.openlibrary.org/b/id/${doc.cover_i}-L.jpg`
            : `https://covers.openlibrary.org/b/isbn/${cleanIsbn}-M.jpg`;

          return {
            source: 'openlibrary',
            book: {
              title: doc.title,
              author: author || 'Unknown Author',
              isbn: cleanIsbn,
              publisher: publisher || undefined,
              edition: doc.edition_count ? `${doc.edition_count}th Edition` : undefined,
              images: [{ url: coverUrl }],
              description: doc.first_sentence?.[0] || undefined,
            },
          };
        }
      }
    } catch {
      // Continue to next provider
    }

    // 3. Try OpenLibrary direct ISBN endpoint
    try {
      const olIsbnRes = await fetch(`https://openlibrary.org/isbn/${cleanIsbn}.json`, {
        signal: AbortSignal.timeout(5000),
      });
      if (olIsbnRes.ok) {
        const bookData = (await olIsbnRes.json()) as any;
        if (bookData && bookData.title) {
          const publisher = Array.isArray(bookData.publishers)
            ? bookData.publishers[0]
            : (bookData.publishers || '');

          return {
            source: 'openlibrary',
            book: {
              title: bookData.title,
              author: 'Unknown Author',
              isbn: cleanIsbn,
              publisher: publisher || undefined,
              pageCount: bookData.number_of_pages,
              images: [{ url: `https://covers.openlibrary.org/b/isbn/${cleanIsbn}-M.jpg` }],
              description:
                typeof bookData.description === 'string'
                  ? bookData.description
                  : bookData.description?.value,
            },
          };
        }
      }
    } catch {
      // Continue to Google Books
    }

    // 4. Try Google Books API fallback
    try {
      const gRes = await fetch(`https://www.googleapis.com/books/v1/volumes?q=isbn:${cleanIsbn}`, {
        signal: AbortSignal.timeout(5000),
      });
      if (gRes.ok) {
        const gData = (await gRes.json()) as any;
        const item = gData?.items?.[0]?.volumeInfo;
        if (item && item.title) {
          const author = Array.isArray(item.authors) ? item.authors.join(', ') : (item.authors || '');
          const coverUrl = item.imageLinks?.thumbnail || item.imageLinks?.smallThumbnail;

          return {
            source: 'google',
            book: {
              title: item.title,
              author: author || 'Unknown Author',
              isbn: cleanIsbn,
              publisher: item.publisher,
              pageCount: item.pageCount,
              images: coverUrl ? [{ url: coverUrl.replace(/^http:/, 'https:') }] : [],
              description: item.description,
            },
          };
        }
      }
    } catch {
      // Fallback exhausted
    }

    return null;
  }
}
export default BooksService;
