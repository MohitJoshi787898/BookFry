import { Worker, Job } from 'bullmq';
import { QUEUE_NAMES } from '../queues';
import { getRedisClient } from '../../config/redis';
import { PushNotificationService } from '../../services/push-notification.service';
import { logger } from '../../utils/logger';

const redisConnection = getRedisClient();

export const createPushWorker = () => {
  if (!redisConnection) {
    logger.warn('[BullMQ] Redis not connected. Push notification worker running in passive mode.');
    return null;
  }

  const worker = new Worker(
    QUEUE_NAMES.PUSH,
    async (job: Job) => {
      logger.info(`[PushWorker] Processing push job ${job.name} (id: ${job.id})`);
      const pushService = new PushNotificationService();

      if (job.name === 'send_user_push') {
        const { userId, payload } = job.data;
        await pushService.sendPushToUser(userId, payload);
      } else if (job.name === 'send_multicast_push') {
        const { tokens, payload, userId } = job.data;
        await pushService.sendPushToTokens(tokens, payload, userId);
      } else {
        logger.warn(`[PushWorker] Unknown job name: ${job.name}`);
      }
    },
    {
      connection: redisConnection,
      concurrency: 10,
    }
  );

  worker.on('completed', (job) => {
    logger.info(`[PushWorker] Successfully sent push for job ${job.id}`);
  });

  worker.on('failed', (job, err) => {
    logger.error(`[PushWorker] Failed push job ${job?.id}:`, err);
  });

  return worker;
};
