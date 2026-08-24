import { Request, Response } from 'express';
import mongoose from 'mongoose';
import { getPaymentProvider } from './payment-provider.factory';
import { OrderModel, IOrderDocument } from '../../models/order.model';
import { TransactionModel } from '../../models/transaction.model';
import { NotificationsService } from '../notifications/notifications.service';
import { NotFoundError } from '../../utils/AppError';
import { ApiResponse } from '../../utils/ApiResponse';
import { logger } from '../../utils/logger';

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

  verify = async (req: Request, res: Response): Promise<void> => {
    const { orderId, razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    let session: mongoose.ClientSession | undefined;
    if (process.env.NODE_ENV !== 'test') {
      try {
        session = await mongoose.startSession();
        session.startTransaction();
      } catch {
        session = undefined;
      }
    }

    try {
      const orderQuery = OrderModel.findById(orderId);
      const order = session ? await orderQuery.session(session) : await orderQuery;
      if (!order) {
        throw new NotFoundError('Order not found');
      }

      // If order is already paid, return early to prevent double-processing
      if (order.paymentStatus === 'paid') {
        if (session) {
          await session.commitTransaction();
          session.endSession();
        }
        res.status(200).json(ApiResponse.success({ verified: true }));
        return;
      }

      const provider = getPaymentProvider();

      // 1. Mock Payment verification fallback
      if (provider.constructor.name === 'MockPaymentProvider') {
        logger.info(`[PaymentsController] Verifying payment using mock provider`);
        order.paymentStatus = 'paid';
        order.status = 'confirmed';
        order.paymentRef = razorpay_payment_id || `pay_mock_${Math.random().toString(36).substring(2, 10)}`;
        order.timeline.push({
          status: 'confirmed',
          note: 'Payment verified via mock client confirmation',
          timestamp: new Date(),
        });
        if (session) {
          await order.save({ session });
        } else {
          await order.save();
        }

        await this.processSuccessfulPayment(order, session);
        if (session) {
          await session.commitTransaction();
          session.endSession();
        }
        res.status(200).json(ApiResponse.success({ verified: true }));
        return;
      }

      // 2. Live Razorpay signature verification
      if (provider.constructor.name === 'RazorpayProvider') {
        const razorpayProvider = provider as any;
        const isValid = razorpayProvider.verifyPaymentSignature(
          razorpay_order_id,
          razorpay_payment_id,
          razorpay_signature
        );

        if (!isValid) {
          order.paymentStatus = 'failed';
          order.timeline.push({
            status: 'pending',
            note: 'Razorpay signature verification failed',
            timestamp: new Date(),
          });
          if (session) {
            await order.save({ session });
            await session.commitTransaction();
            session.endSession();
          } else {
            await order.save();
          }
          res.status(400).json(ApiResponse.error('INVALID_SIGNATURE', 'Razorpay signature verification failed'));
          return;
        }

        order.paymentStatus = 'paid';
        order.status = 'confirmed';
        order.paymentRef = razorpay_payment_id;
        order.timeline.push({
          status: 'confirmed',
          note: 'Payment verified via client signature confirmation',
          timestamp: new Date(),
        });
        if (session) {
          await order.save({ session });
        } else {
          await order.save();
        }

        await this.processSuccessfulPayment(order, session);
        if (session) {
          await session.commitTransaction();
          session.endSession();
        }
        res.status(200).json(ApiResponse.success({ verified: true }));
        return;
      }

      // Stripe fallback / webhook verification preferred for Stripe
      if (session) {
        await session.commitTransaction();
        session.endSession();
      }
      res.status(200).json(ApiResponse.success({ verified: true }));
    } catch (err) {
      if (session) {
        await session.abortTransaction();
        session.endSession();
      }
      throw err;
    }
  };

  webhook = async (req: Request, res: Response): Promise<void> => {
    const stripeSignature = req.headers['stripe-signature'] as string;
    const razorpaySignature = req.headers['x-razorpay-signature'] as string;
    const signature = razorpaySignature || stripeSignature || '';

    const provider = getPaymentProvider();

    // Use rawBody buffer if available (useful for Stripe signature verification)
    const payload = (req as any).rawBody || req.body;
    let result;
    try {
      result = await provider.verifyWebhook(payload, signature);
    } catch (err: any) {
      logger.warn(`Webhook verification failed: ${err?.message}`);
      res.status(200).json(ApiResponse.success({ received: true }));
      return;
    }

    let session: mongoose.ClientSession | undefined;
    if (process.env.NODE_ENV !== 'test') {
      try {
        session = await mongoose.startSession();
        session.startTransaction();
      } catch {
        session = undefined;
      }
    }

    try {
      const orderQuery = OrderModel.findById(result.orderId);
      const order = session ? await orderQuery.session(session) : await orderQuery;
      if (order) {
        // If order is already paid, return early
        if (order.paymentStatus === 'paid') {
          if (session) {
            await session.commitTransaction();
            session.endSession();
          }
          res.status(200).json(ApiResponse.success({ received: true }));
          return;
        }

        if (result.status === 'paid') {
          order.paymentStatus = 'paid';
          order.status = 'confirmed';
          order.paymentRef = result.paymentRef;
          order.timeline.push({
            status: 'confirmed',
            note: 'Payment received via webhook',
            timestamp: new Date(),
          });
          if (session) {
            await order.save({ session });
          } else {
            await order.save();
          }

          await this.processSuccessfulPayment(order, session);
        } else {
          order.paymentStatus = 'failed';
          order.timeline.push({
            status: 'pending',
            note: 'Payment failed via webhook',
            timestamp: new Date(),
          });
          if (session) {
            await order.save({ session });
          } else {
            await order.save();
          }
        }
      }

      if (session) {
        await session.commitTransaction();
        session.endSession();
      }
      res.status(200).json(ApiResponse.success({ received: true }));
    } catch (err) {
      if (session) {
        await session.abortTransaction();
        session.endSession();
      }
      throw err;
    }
  };

  private processSuccessfulPayment = async (
    order: IOrderDocument,
    session?: mongoose.ClientSession
  ): Promise<void> => {
    try {
      // Transition all child subOrders to confirmed status
      if (order.subOrders && order.subOrders.length > 0) {
        for (const sub of order.subOrders) {
          sub.status = 'confirmed';
          if (!sub.timeline) sub.timeline = [];
          sub.timeline.push({
            status: 'confirmed',
            note: 'Payment verified, package confirmed for packing and dispatch',
            timestamp: new Date(),
          });
        }
        if (session) {
          await order.save({ session });
        } else {
          await order.save();
        }
      }

      // 1. Group items by seller for creating Transaction records & notifications
      const sellerAmounts: Record<string, number> = {};
      for (const item of order.items) {
        if (!item.sellerId) continue;
        const sId = item.sellerId.toString();
        sellerAmounts[sId] = (sellerAmounts[sId] || 0) + item.price * item.quantity;
      }

      const notificationsService = new NotificationsService();

      for (const [sId, amount] of Object.entries(sellerAmounts)) {
        const platformFee = parseFloat((amount * 0.10).toFixed(2)); // 10% platform fee
        const netPayout = parseFloat((amount - platformFee).toFixed(2));

        try {
          if (session) {
            await TransactionModel.create(
              [
                {
                  orderId: order._id,
                  sellerId: new mongoose.Types.ObjectId(sId),
                  amount,
                  platformFee,
                  netPayout,
                  status: 'pending',
                },
              ],
              { session }
            );
          } else {
            await TransactionModel.create({
              orderId: order._id,
              sellerId: new mongoose.Types.ObjectId(sId),
              amount,
              platformFee,
              netPayout,
              status: 'pending',
            });
          }
        } catch (e) {
          logger.warn(`Could not create transaction record: ${e}`);
        }

        try {
          await notificationsService.createNotification(
            sId,
            'new_sale',
            'New Sale Received!',
            `You have received a new order ${order.orderNumber} for fulfillment.`,
            { orderId: order._id.toString() }
          );
        } catch (e) {
          logger.warn(`Could not create seller notification: ${e}`);
        }
      }

      try {
        await notificationsService.createNotification(
          order.buyerId.toString(),
          'order_confirmed',
          'Order Confirmed!',
          `Your order ${order.orderNumber} has been placed and confirmed.`,
          { orderId: order._id.toString() }
        );
      } catch (e) {
        logger.warn(`Could not create buyer notification: ${e}`);
      }
    } catch (e) {
      logger.error('Error processing successful payment:', e);
    }
  };
}

export default PaymentsController;

