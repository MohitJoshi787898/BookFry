import { Worker, Job } from 'bullmq';
import { getRedisClient } from '../../config/redis';
import { QUEUE_NAMES } from '../queues';
import { BookCatalogModel } from '../../models/book-catalog.model';
import { OrderModel } from '../../models/order.model';
import { logger } from '../../utils/logger';

export interface RecommendationJobData {
  task: 'recompute_popular' | 'recompute_trending' | 'recompute_cooccurrence';
}

const redisConnection = getRedisClient();

export const recomputePopularBooks = async (): Promise<number> => {
  if (!redisConnection) return 0;

  try {
    const catalogs = await BookCatalogModel.find({});
    if (catalogs.length === 0) return 0;

    const pipeline = redisConnection.pipeline();

    // Clear existing popular keys
    pipeline.del('popular:books');

    for (const catalog of catalogs) {
      const bookId = catalog._id.toString();
      const ratingAvg = catalog.ratingAvg || 0;
      const ratingCount = catalog.ratingCount || 0;
      const viewsCount = catalog.viewsCount || 0;

      // Score formula: (views * 1) + (ratingAvg * ratingCount * 2)
      const score = viewsCount * 1 + ratingAvg * ratingCount * 2;
      pipeline.zadd('popular:books', score, bookId);

      if (catalog.category) {
        const catId = catalog.category.toString();
        pipeline.zadd(`popular:books:category:${catId}`, score, bookId);
      }
    }

    await pipeline.exec();
    logger.info(`[RecommendationsWorker] Recomputed popular books for ${catalogs.length} catalog items.`);
    return catalogs.length;
  } catch (err) {
    logger.error('[RecommendationsWorker Error] Recomputing popular books failed:', err);
    throw err;
  }
};

export const recomputeTrendingBooks = async (): Promise<number> => {
  if (!redisConnection) return 0;

  try {
    // 72h window calculation
    const seventyTwoHoursAgo = new Date(Date.now() - 72 * 60 * 60 * 1000);
    const recentOrders = await OrderModel.find({ createdAt: { $gte: seventyTwoHoursAgo } });

    const recentSalesMap = new Map<string, number>();
    for (const order of recentOrders) {
      for (const item of order.items) {
        const bId = item.bookId.toString();
        recentSalesMap.set(bId, (recentSalesMap.get(bId) || 0) + item.quantity);
      }
    }

    const catalogs = await BookCatalogModel.find({});
    const pipeline = redisConnection.pipeline();
    pipeline.del('trending:books');

    let count = 0;
    for (const catalog of catalogs) {
      const bookId = catalog._id.toString();
      const recentSales = recentSalesMap.get(bookId) || 0;
      const viewsCount = catalog.viewsCount || 0;

      // Activity floor check: minimum 1 sale OR minimum 10 views
      if (recentSales < 1 && viewsCount < 10) {
        continue;
      }

      // Exponential velocity score
      const velocityScore = recentSales * 15 + viewsCount * 0.5;
      pipeline.zadd('trending:books', velocityScore, bookId);
      count++;
    }

    await pipeline.exec();
    logger.info(`[RecommendationsWorker] Recomputed trending books. ${count} books qualified.`);
    return count;
  } catch (err) {
    logger.error('[RecommendationsWorker Error] Recomputing trending books failed:', err);
    throw err;
  }
};

export const recomputeCooccurrence = async (): Promise<number> => {
  if (!redisConnection) return 0;

  try {
    const orders = await OrderModel.find({ status: { $in: ['confirmed', 'shipped', 'delivered'] } });
    const cooccurMap = new Map<string, Map<string, number>>();

    for (const order of orders) {
      const bookIds = Array.from(new Set(order.items.map((i) => i.bookId.toString())));
      for (let i = 0; i < bookIds.length; i++) {
        for (let j = 0; j < bookIds.length; j++) {
          if (i === j) continue;
          const target = bookIds[i];
          const paired = bookIds[j];

          if (!cooccurMap.has(target)) cooccurMap.set(target, new Map());
          const subMap = cooccurMap.get(target)!;
          subMap.set(paired, (subMap.get(paired) || 0) + 1);
        }
      }
    }

    const pipeline = redisConnection.pipeline();
    for (const [targetId, subMap] of cooccurMap.entries()) {
      const key = `cooccurs:${targetId}`;
      pipeline.del(key);
      for (const [pairedId, score] of subMap.entries()) {
        pipeline.zadd(key, score, pairedId);
      }
    }

    await pipeline.exec();
    logger.info(`[RecommendationsWorker] Recomputed co-occurrence matrix for ${cooccurMap.size} books.`);
    return cooccurMap.size;
  } catch (err) {
    logger.error('[RecommendationsWorker Error] Recomputing cooccurrence failed:', err);
    throw err;
  }
};

export const createRecommendationsWorker = () => {
  if (!redisConnection) return null;

  const worker = new Worker<RecommendationJobData>(
    QUEUE_NAMES.RECOMMENDATIONS,
    async (job: Job<RecommendationJobData>) => {
      const { task } = job.data;
      if (task === 'recompute_popular') {
        await recomputePopularBooks();
      } else if (task === 'recompute_trending') {
        await recomputeTrendingBooks();
      } else if (task === 'recompute_cooccurrence') {
        await recomputeCooccurrence();
      }
    },
    {
      connection: redisConnection,
      concurrency: 1, // Prevent concurrent recompute races
    }
  );

  return worker;
};
