import { Worker, Job } from 'bullmq';
import { getRedisClient } from '../../config/redis';
import { QUEUE_NAMES } from '../queues';
import { OrderModel } from '../../models/order.model';
import { TransactionModel } from '../../models/transaction.model';
import { NotificationsService } from '../../modules/notifications/notifications.service';
import { logger } from '../../utils/logger';

export interface OrderSlaJobData {
  task: 'check_sla_breaches' | 'autocomplete_orders';
}

const redisConnection = getRedisClient();

export const checkOrderSlaBreaches = async (): Promise<number> => {
  const fortyEightHoursAgo = new Date(Date.now() - 48 * 60 * 60 * 1000);
  const unshippedOrders = await OrderModel.find({
    status: { $in: ['pending', 'confirmed'] },
    createdAt: { $lt: fortyEightHoursAgo },
  });

  const notificationsService = new NotificationsService();

  for (const order of unshippedOrders) {
    logger.warn(`[OrderSLA] SLA Breach detected for order ${order.orderNumber}`);

    // Notify unique sellers of the order
    const sellerIds = Array.from(new Set(order.items.map((item) => item.sellerId.toString())));
    for (const sellerId of sellerIds) {
      await notificationsService.createNotification(
        sellerId,
        'sla_breach_warning',
        '⚠️ Shipment SLA Breach Warning',
        `Order ${order.orderNumber} has not been shipped within 48 hours. Please dispatch immediately to avoid seller account penalties.`,
        { orderId: order._id.toString() }
      );
    }
  }

  return unshippedOrders.length;
};

export const autocompleteDeliveredOrders = async (): Promise<number> => {
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const eligibleOrders = await OrderModel.find({
    status: 'delivered',
    paymentStatus: 'paid',
    updatedAt: { $lt: sevenDaysAgo },
  });

  for (const order of eligibleOrders) {
    // Release escrow transactions to seller
    await TransactionModel.updateMany({ orderId: order._id }, { status: 'released' });
    logger.info(`[OrderSLA] Auto-released escrow funds for order ${order.orderNumber}`);
  }

  return eligibleOrders.length;
};

export const createOrderSlaWorker = () => {
  if (!redisConnection) return null;

  const worker = new Worker<OrderSlaJobData>(
    QUEUE_NAMES.ORDER_SLA,
    async (job: Job<OrderSlaJobData>) => {
      const { task } = job.data;
      if (task === 'check_sla_breaches') {
        await checkOrderSlaBreaches();
      } else if (task === 'autocomplete_orders') {
        await autocompleteDeliveredOrders();
      }
    },
    {
      connection: redisConnection,
      concurrency: 1,
    }
  );

  return worker;
};
