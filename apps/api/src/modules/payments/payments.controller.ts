import { Request, Response } from 'express';
import { getPaymentProvider } from './payment-provider.factory';
import { OrderModel } from '../../models/order.model';
import { TransactionModel } from '../../models/transaction.model';
import { NotificationsService } from '../notifications/notifications.service';
import { NotFoundError } from '../../utils/AppError';
import { ApiResponse } from '../../utils/ApiResponse';

export class PaymentsController {
  createIntent = async (req: Request, res: Response): Promise<void> => {
    const { orderId } = req.body;

    const order = await OrderModel.findById(orderId);
    if (!order) {
      throw new NotFoundError('Order not found');
    }

    const provider = getPaymentProvider();
    const result = await provider.createPaymentIntent(
      order.total,
      order.currency,
      order._id.toString()
    );

    res.status(200).json(ApiResponse.success(result));
  };

  webhook = async (req: Request, res: Response): Promise<void> => {
    const signature = req.headers['stripe-signature'] as string;
    const provider = getPaymentProvider();

    // Use rawBody buffer if available (useful for Stripe signature verification)
    const payload = (req as any).rawBody || req.body;
    const result = await provider.verifyWebhook(payload, signature || '');

    const order = await OrderModel.findById(result.orderId);
    if (order) {
      if (result.status === 'paid') {
        order.paymentStatus = 'paid';
        order.status = 'confirmed';
        order.paymentRef = result.paymentRef;
        order.timeline.push({
          status: 'confirmed',
          note: 'Payment received via webhook',
          timestamp: new Date(),
        });
        await order.save();

        // 1. Group items by seller for creating Transaction records & notifications
        const sellerAmounts: Record<string, number> = {};
        for (const item of order.items) {
          const sId = item.sellerId.toString();
          sellerAmounts[sId] = (sellerAmounts[sId] || 0) + item.price * item.quantity;
        }

        const notificationsService = new NotificationsService();

        for (const [sId, amount] of Object.entries(sellerAmounts)) {
          const platformFee = parseFloat((amount * 0.10).toFixed(2)); // 10% platform fee
          const netPayout = parseFloat((amount - platformFee).toFixed(2));

          await TransactionModel.create({
            orderId: order._id,
            sellerId: new mongoose.Types.ObjectId(sId),
            amount,
            platformFee,
            netPayout,
            status: 'pending',
          });

          // 2. Notify Seller
          await notificationsService.createNotification(
            sId,
            'new_sale',
            'New Sale Received!',
            `You have received a new order ${order.orderNumber} for fulfillment.`,
            { orderId: order._id.toString() }
          );
        }

        // 3. Notify Buyer
        await notificationsService.createNotification(
          order.buyerId.toString(),
          'order_confirmed',
          'Order Confirmed!',
          `Your order ${order.orderNumber} has been placed and confirmed.`,
          { orderId: order._id.toString() }
        );
      } else {
        order.paymentStatus = 'failed';
        order.timeline.push({
          status: 'pending',
          note: 'Payment failed via webhook',
          timestamp: new Date(),
        });
        await order.save();
      }
    }

    res.status(200).json(ApiResponse.success({ received: true }));
  };
}
import mongoose from 'mongoose';
export default PaymentsController;
