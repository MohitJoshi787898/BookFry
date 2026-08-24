import { Worker, Job } from 'bullmq';
import { QUEUE_NAMES } from '../queues';
import { getRedisClient } from '../../config/redis';
import { EmailService } from '../../services/email.service';
import { logger } from '../../utils/logger';

const redisConnection = getRedisClient();

export const createEmailWorker = () => {
  if (!redisConnection) {
    logger.warn('[BullMQ] Redis not connected. Email worker running in passive mode.');
    return null;
  }

  const worker = new Worker(
    QUEUE_NAMES.EMAIL,
    async (job: Job) => {
      logger.info(`[EmailWorker] Processing job ${job.name} (id: ${job.id})`);
      const emailService = new EmailService();

      switch (job.name) {
        case 'order_confirmation_buyer': {
          const { to, buyerName, orderNumber, items, totalAmount } = job.data;
          await emailService.sendOrderConfirmationToBuyer(to, buyerName, orderNumber, items, totalAmount);
          break;
        }

        case 'new_sale_seller': {
          const { to, sellerName, orderNumber, bookTitle, payoutAmount } = job.data;
          await emailService.sendSaleNotificationToSeller(to, sellerName, orderNumber, bookTitle, payoutAmount);
          break;
        }

        case 'used_book_request_seller': {
          const { to, sellerName, requestNumber, bookTitle, buyerName, buyerEmail, buyerPhone } = job.data;
          await emailService.sendUsedBookRequestToSeller(
            to,
            sellerName,
            requestNumber,
            bookTitle,
            buyerName,
            buyerEmail,
            buyerPhone
          );
          break;
        }

        case 'used_book_status_buyer': {
          const { to, buyerName, requestNumber, bookTitle, status, note } = job.data;
          await emailService.sendUsedBookRequestStatusUpdateToBuyer(
            to,
            buyerName,
            requestNumber,
            bookTitle,
            status,
            note
          );
          break;
        }

        default:
          logger.warn(`[EmailWorker] Unknown job name: ${job.name}`);
      }
    },
    {
      connection: redisConnection,
      concurrency: 5,
    }
  );

  worker.on('completed', (job) => {
    logger.info(`[EmailWorker] Successfully completed job ${job.id} (${job.name})`);
  });

  worker.on('failed', (job, err) => {
    logger.error(`[EmailWorker] Failed job ${job?.id} (${job?.name}):`, err);
  });

  return worker;
};
