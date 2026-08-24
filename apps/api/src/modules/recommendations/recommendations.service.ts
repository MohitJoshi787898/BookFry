import { getRedisClient } from '../../config/redis';
import { BookCatalogModel } from '../../models/book-catalog.model';
import { BookListingModel } from '../../models/book-listing.model';
import { OrderModel } from '../../models/order.model';
import { WishlistModel } from '../../models/wishlist.model';
import { BooksService } from '../books/books.service';
import { Book } from '@bookmarket/types';
import mongoose from 'mongoose';

export class RecommendationsService {
  private booksService: BooksService;

  constructor() {
    this.booksService = new BooksService();
  }

  /** Helper to format BookCatalog documents into Book DTOs */
  private async hydrateBookDTOs(bookIds: string[]): Promise<Book[]> {
    if (bookIds.length === 0) return [];

    // Filter to ensure only books with active seller listings are returned
    const activeListings = await BookListingModel.find({
      catalogId: { $in: bookIds.map((id) => new mongoose.Types.ObjectId(id)) },
      status: 'active',
      stock: { $gt: 0 },
    }).populate('catalogId');

    const validCatalogIds = Array.from(
      new Set(activeListings.map((l: any) => l.catalogId?._id?.toString()).filter(Boolean))
    );

    const catalogs = await BookCatalogModel.find({
      _id: { $in: validCatalogIds.map((id) => new mongoose.Types.ObjectId(id)) },
    }).populate('category');

    const bookMap = new Map<string, Book>();
    for (const catalog of catalogs) {
      const activeListing = activeListings.find(
        (l: any) => l.catalogId?._id?.toString() === catalog._id.toString()
      );
      if (activeListing) {
        const dto = this.booksService.mapCatalogAndListingToBook(catalog, activeListing);
        bookMap.set(catalog._id.toString(), dto);
      }
    }

    // Preserve original rank order
    return bookIds.map((id) => bookMap.get(id)).filter((b): b is Book => Boolean(b));
  }

  async getHomeRecommendations(userId?: string): Promise<{
    popular: Book[];
    trending: Book[];
    personalized: Book[];
  }> {
    const redis = getRedisClient();

    let popularIds: string[] = [];
    let trendingIds: string[] = [];
    let personalizedIds: string[] = [];

    if (redis && redis.status === 'ready') {
      try {
        // Fetch top 12 popular IDs from Redis ZSET
        popularIds = await redis.zrevrange('popular:books', 0, 11);
        // Fetch top 12 trending IDs from Redis ZSET
        trendingIds = await redis.zrevrange('trending:books', 0, 11);

        // Personalized calculation for authenticated user
        if (userId) {
          const userAffinityCats = await redis.zrevrange(`user:affinity:${userId}:categories`, 0, 2);
          for (const catId of userAffinityCats) {
            const catBookIds = await redis.zrevrange(`popular:books:category:${catId}`, 0, 5);
            personalizedIds.push(...catBookIds);
          }
        }
      } catch (err) {
        // Silent fallback to MongoDB
      }
    }

    // Fallback: If Redis is empty or cold, fetch top-rated catalog items from Mongo
    if (popularIds.length < 4) {
      const popularCatalogs = await BookCatalogModel.find({})
        .sort({ ratingAvg: -1, ratingCount: -1 })
        .limit(12);
      popularIds = popularCatalogs.map((c) => c._id.toString());
    }

    if (trendingIds.length < 4) {
      const trendingCatalogs = await BookCatalogModel.find({})
        .sort({ viewsCount: -1, createdAt: -1 })
        .limit(12);
      trendingIds = trendingCatalogs.map((c) => c._id.toString());
    }

    // MongoDB User Affinity Fallback for Personalized section
    if (userId && personalizedIds.length < 4) {
      const userOrders = await OrderModel.find({ buyerId: userId }).sort({ createdAt: -1 }).limit(5);
      const boughtCategories = userOrders.flatMap((o) => o.items.map((i) => (i as any).category)).filter(Boolean);
      
      const userWishlist = await WishlistModel.findOne({ userId });
      const wishlistBookIds = userWishlist?.bookIds.map((id) => id.toString()) || [];

      if (boughtCategories.length > 0 || wishlistBookIds.length > 0) {
        const matchedCatalogs = await BookCatalogModel.find({
          $or: [
            { category: { $in: boughtCategories } },
            { _id: { $in: wishlistBookIds.map((id) => new mongoose.Types.ObjectId(id)) } },
          ],
        }).limit(12);
        personalizedIds = matchedCatalogs.map((c) => c._id.toString());
      }
    }

    // Fallback personalized to popular if still empty
    if (personalizedIds.length === 0) {
      personalizedIds = [...popularIds];
    }

    const [popular, trending, personalized] = await Promise.all([
      this.hydrateBookDTOs(popularIds),
      this.hydrateBookDTOs(trendingIds),
      this.hydrateBookDTOs(personalizedIds),
    ]);

    return { popular, trending, personalized };
  }

  async getBookRecommendations(bookId: string): Promise<{
    frequentlyBoughtTogether: Book[];
    similarCategory: Book[];
  }> {
    const redis = getRedisClient();
    let cooccurIds: string[] = [];

    if (redis && redis.status === 'ready') {
      try {
        cooccurIds = await redis.zrevrange(`cooccurs:${bookId}`, 0, 7);
      } catch (err) {
        // Fallback to MongoDB
      }
    }

    // Fallback for Frequently Bought Together
    if (cooccurIds.length < 2) {
      const targetBook = await BookCatalogModel.findById(bookId);
      if (targetBook) {
        const sameCategoryCatalogs = await BookCatalogModel.find({
          _id: { $ne: new mongoose.Types.ObjectId(bookId) },
          category: targetBook.category,
        })
          .sort({ ratingAvg: -1 })
          .limit(8);
        cooccurIds = sameCategoryCatalogs.map((c) => c._id.toString());
      }
    }

    const targetCatalog = await BookCatalogModel.findById(bookId);
    let similarCategoryIds: string[] = [];
    if (targetCatalog) {
      const categoryCatalogs = await BookCatalogModel.find({
        _id: { $ne: targetCatalog._id },
        category: targetCatalog.category,
      })
        .sort({ viewsCount: -1 })
        .limit(8);
      similarCategoryIds = categoryCatalogs.map((c) => c._id.toString());
    }

    const [frequentlyBoughtTogether, similarCategory] = await Promise.all([
      this.hydrateBookDTOs(cooccurIds),
      this.hydrateBookDTOs(similarCategoryIds),
    ]);

    return { frequentlyBoughtTogether, similarCategory };
  }
}
export default RecommendationsService;
