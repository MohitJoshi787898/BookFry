import { Queue } from 'bullmq';
import { getRedisClient } from '../config/redis';
import { logger } from '../utils/logger';

export const QUEUE_NAMES = {
  PAGE_VIEW: 'page-view-queue',
  RECOMMENDATIONS: 'recommendations-queue',
  ORDER_SLA: 'order-sla-queue',
  EMAIL: 'email-queue',
  PUSH: 'push-queue',
} as const;

const redisConnection = getRedisClient();

const queueOptions = redisConnection
  ? {
      connection: redisConnection,
      defaultJobOptions: {
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 2000,
        },
        removeOnComplete: { age: 3600 * 24, count: 1000 }, // retain 24h
        removeOnFail: { age: 3600 * 24 * 7 }, // retain 7d
      },
    }
  : null;

export const pageViewQueue = queueOptions
  ? new Queue(QUEUE_NAMES.PAGE_VIEW, queueOptions)
  : null;

export const recommendationsQueue = queueOptions
  ? new Queue(QUEUE_NAMES.RECOMMENDATIONS, queueOptions)
  : null;

export const orderSlaQueue = queueOptions
  ? new Queue(QUEUE_NAMES.ORDER_SLA, queueOptions)
  : null;

export const emailQueue = queueOptions
  ? new Queue(QUEUE_NAMES.EMAIL, queueOptions)
  : null;

export const pushQueue = queueOptions
  ? new Queue(QUEUE_NAMES.PUSH, queueOptions)
  : null;

export const allQueues = [
  pageViewQueue,
  recommendationsQueue,
  orderSlaQueue,
  emailQueue,
  pushQueue,
].filter(Boolean) as Queue[];

allQueues.forEach((q) => {
  q.on('error', (err) => {
    logger.warn(`[BullMQ Queue ${q.name} warning]: ${err.message || err}`);
  });
});

logger.info(`[BullMQ] Initialized ${allQueues.length} queue instances.`);
