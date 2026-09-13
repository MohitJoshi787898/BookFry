import { createPageViewWorker } from './workers/pageView.worker';
import { createRecommendationsWorker, recomputePopularBooks, recomputeTrendingBooks, recomputeCooccurrence } from './workers/recommendations.worker';
import { createOrderSlaWorker, checkOrderSlaBreaches, autocompleteDeliveredOrders } from './workers/orderSla.worker';
import { createEmailWorker } from './workers/email.worker';
import { createPushWorker } from './workers/push.worker';
import { recommendationsQueue, orderSlaQueue } from './queues';
import { logger } from '../utils/logger';

export const startWorkerPool = async () => {
  logger.info('[WorkerRunner] Starting BullMQ Worker Pool...');

  const pageViewWorker = createPageViewWorker();
  const recommendationsWorker = createRecommendationsWorker();
  const orderSlaWorker = createOrderSlaWorker();
  const emailWorker = createEmailWorker();
  const pushWorker = createPushWorker();

  [pageViewWorker, recommendationsWorker, orderSlaWorker, emailWorker, pushWorker].forEach((w) => {
    if (w) {
      w.on('error', (err) => {
        logger.warn(`[BullMQ Worker ${w.name} warning]: ${err.message || err}`);
      });
    }
  });

  // Schedule repeatable jobs if queue is connected
  if (recommendationsQueue) {
    try {
      // Repeat every 1 hour (3600000 ms)
      await recommendationsQueue.add(
        'recompute_popular_hourly',
        { task: 'recompute_popular' },
        { repeat: { every: 3600000 } }
      );
      await recommendationsQueue.add(
        'recompute_trending_hourly',
        { task: 'recompute_trending' },
        { repeat: { every: 3600000 } }
      );
      await recommendationsQueue.add(
        'recompute_cooccurrence_hourly',
        { task: 'recompute_cooccurrence' },
        { repeat: { every: 3600000 * 6 } } // every 6h
      );
      logger.info('[WorkerRunner] Scheduled repeatable recommendation recompute jobs.');

      // Immediate initial run to populate Redis state on boot
      recomputePopularBooks().catch((e) => logger.error('[Boot Recompute Error]', e));
      recomputeTrendingBooks().catch((e) => logger.error('[Boot Recompute Error]', e));
      recomputeCooccurrence().catch((e) => logger.error('[Boot Recompute Error]', e));
    } catch (err) {
      logger.warn('[WorkerRunner] Repeatable job scheduling skipped or failed:', err);
    }
  }

  if (orderSlaQueue) {
    try {
      await orderSlaQueue.add(
        'check_sla_breaches_hourly',
        { task: 'check_sla_breaches' },
        { repeat: { every: 3600000 * 2 } } // every 2h
      );
      await orderSlaQueue.add(
        'autocomplete_orders_daily',
        { task: 'autocomplete_orders' },
        { repeat: { every: 3600000 * 24 } } // daily
      );
      logger.info('[WorkerRunner] Scheduled repeatable order SLA jobs.');
    } catch (err) {
      logger.warn('[WorkerRunner] Repeatable SLA job scheduling skipped:', err);
    }
  }

  return {
    pageViewWorker,
    recommendationsWorker,
    orderSlaWorker,
    emailWorker,
    pushWorker,
  };
};
