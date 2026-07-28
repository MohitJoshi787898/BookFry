import { Worker, Job } from 'bullmq';
import { getRedisClient } from '../../config/redis';
import { QUEUE_NAMES } from '../queues';
import { BookCatalogModel } from '../../models/book-catalog.model';
import { logger } from '../../utils/logger';

export interface PageViewJobData {
  bookId: string;
  userId?: string;
  categoryId?: string;
  authorId?: string;
  timestamp: string;
}

const redisConnection = getRedisClient();

export const createPageViewWorker = () => {
  if (!redisConnection) return null;

  const worker = new Worker<PageViewJobData>(
    QUEUE_NAMES.PAGE_VIEW,
    async (job: Job<PageViewJobData>) => {
      const { bookId, userId, categoryId } = job.data;

      try {
        // 1. Increment Redis view counter for book
        await redisConnection.zincrby('views:books:all', 1, bookId);

        if (categoryId) {
          await redisConnection.zincrby(`views:books:category:${categoryId}`, 1, bookId);
        }

        // 2. Track user-level recent views and category affinity if logged in
        if (userId) {
          const userViewsKey = `user:views:${userId}`;
          await redisConnection.lrem(userViewsKey, 0, bookId);
          await redisConnection.lpush(userViewsKey, bookId);
          await redisConnection.ltrim(userViewsKey, 0, 19); // retain last 20 viewed books

          if (categoryId) {
            await redisConnection.zincrby(`user:affinity:${userId}:categories`, 1, categoryId);
          }
        }

        // 3. Increment MongoDB viewsCount
        await BookCatalogModel.findByIdAndUpdate(bookId, { $inc: { viewsCount: 1 } });

        logger.debug(`[PageViewWorker] Processed view for book ${bookId}`);
      } catch (err) {
        logger.error(`[PageViewWorker Error] Failed to process view event for ${bookId}:`, err);
        throw err;
      }
    },
    {
      connection: redisConnection,
      concurrency: 10,
    }
  );

  return worker;
};
