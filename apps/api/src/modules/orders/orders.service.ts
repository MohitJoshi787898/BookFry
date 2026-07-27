import { OrdersRepository } from './orders.repository';
import { CartRepository } from '../cart/cart.repository';
import { ListingRepository } from '../books/listing.repository';
import { CatalogRepository } from '../books/catalog.repository';
import { TransactionModel } from '../../models/transaction.model';
import { NotificationsService } from '../notifications/notifications.service';
import { NotFoundError, ValidationError, UnauthorizedError } from '../../utils/AppError';
import { Order, OrderStatus } from '@bookmarket/types';
import mongoose from 'mongoose';

/** Default return window in days — can be surfaced to admin settings later */
const RETURN_WINDOW_DAYS = 7;

export class OrdersService {
  private ordersRepository: OrdersRepository;
  private cartRepository: CartRepository;
  private listingRepository: ListingRepository;
  private catalogRepository: CatalogRepository;

  constructor() {
    this.ordersRepository = new OrdersRepository();
    this.cartRepository = new CartRepository();
    this.listingRepository = new ListingRepository();
    this.catalogRepository = new CatalogRepository();
  }

  private generateOrderNumber(): string {
    const timestamp = Date.now().toString().slice(-6);
    const random = Math.random().toString(36).substring(2, 6).toUpperCase();
    return `ORD-${timestamp}-${random}`;
  }

  async createOrder(
    buyerId: string,
    shippingAddress: {
      street: string;
      city: string;
      state: string;
      zipCode: string;
      country: string;
    }
  ): Promise<Order> {
    const cart = await this.cartRepository.findByUserId(buyerId);
    if (!cart || cart.items.length === 0) {
      throw new ValidationError('Your cart is empty');
    }

    const orderItems: any[] = [];
    let subtotal = 0;

    for (const item of cart.items) {
      const listingIdStr = (item.listingId as any)?._id
        ? (item.listingId as any)._id.toString()
        : (item as any).bookId
        ? (item as any).bookId.toString()
        : item.listingId?.toString() ?? '';

      const listing = await this.listingRepository.findById(listingIdStr);
      if (!listing || listing.status !== 'active') {
        throw new NotFoundError(`Book listing is no longer available`);
      }

      const catalogDoc = listing.catalogId as any;

      if (listing.stock < item.quantity) {
        throw new ValidationError(
          `Insufficient stock for "${catalogDoc?.title || 'this book'}". Only ${listing.stock} left.`
        );
      }

      listing.stock -= item.quantity;
      if (listing.stock === 0) {
        listing.status = 'sold';
      }
      await listing.save();

      const price = listing.price;
      subtotal += price * item.quantity;

      orderItems.push({
        listingId: listing._id,
        bookId: catalogDoc?._id || listing.catalogId,
        sellerId: listing.sellerId,
        title: catalogDoc?.title || 'Book',
        price,
        quantity: item.quantity,
        condition: listing.condition,
      });
    }

    const shippingFee = subtotal > 35 ? 0 : 4.99;
    const tax = parseFloat((subtotal * 0.08).toFixed(2));
    const total = parseFloat((subtotal + shippingFee + tax).toFixed(2));

    const orderNumber = this.generateOrderNumber();

    const orderDoc = await this.ordersRepository.create({
      orderNumber,
      buyerId: new mongoose.Types.ObjectId(buyerId),
      items: orderItems,
      shippingAddress,
      subtotal,
      shippingFee,
      tax,
      total,
      currency: 'USD',
      status: 'pending',
      paymentStatus: 'pending',
      timeline: [
        {
          status: 'pending',
          note: 'Order created, awaiting payment',
          timestamp: new Date(),
        },
      ],
    });

    await this.cartRepository.update(buyerId, []);

    return this.mapToDTO(orderDoc);
  }

  async getOrderById(id: string, userId: string, roles: string[]): Promise<Order> {
    const order = await this.ordersRepository.findById(id);
    if (!order) {
      throw new NotFoundError('Order not found');
    }

    const isAdmin = roles.includes('admin');
    const isBuyer = order.buyerId.toString() === userId;
    const isSellerOfItem = order.items.some((item) => item.sellerId.toString() === userId);

    if (!isAdmin && !isBuyer && !isSellerOfItem) {
      throw new UnauthorizedError('Not authorized to view this order');
    }

    return this.mapToDTO(order);
  }

  async getBuyerOrders(buyerId: string): Promise<Order[]> {
    const docs = await this.ordersRepository.findByBuyerId(buyerId);
    return docs.map((doc) => this.mapToDTO(doc));
  }

  async getSellerOrders(sellerId: string): Promise<Order[]> {
    const docs = await this.ordersRepository.findBySellerId(sellerId);
    return docs.map((doc) => this.mapToDTO(doc));
  }

  /** Admin: fetch all orders, optionally filtered by status */
  async getAdminOrders(statusFilter?: string): Promise<Order[]> {
    const docs = await this.ordersRepository.findAll(statusFilter);
    return docs.map((doc) => this.mapToDTO(doc));
  }

  async updateOrderStatus(
    id: string,
    userId: string,
    roles: string[],
    newStatus: OrderStatus,
    note?: string
  ): Promise<Order> {
    const order = await this.ordersRepository.findById(id);
    if (!order) {
      throw new NotFoundError('Order not found');
    }

    const isAdmin = roles.includes('admin');
    const isSellerOfItem = order.items.some((item) => item.sellerId.toString() === userId);

    if (!isAdmin && !isSellerOfItem) {
      throw new UnauthorizedError('Not authorized to update order status');
    }

    order.status = newStatus;
    order.timeline.push({
      status: newStatus,
      note: note || `Status updated to ${newStatus}`,
      timestamp: new Date(),
    });

    if (newStatus === 'delivered') {
      order.paymentStatus = 'paid';
      // Release payment transaction funds to sellers
      if (isAdmin) {
        await TransactionModel.updateMany({ orderId: order._id }, { status: 'released' });
      } else {
        await TransactionModel.updateMany(
          { orderId: order._id, sellerId: new mongoose.Types.ObjectId(userId) },
          { status: 'released' }
        );
      }
    }

    const updated = await this.ordersRepository.update(id, {
      status: newStatus,
      paymentStatus: order.paymentStatus,
      timeline: order.timeline,
    } as any);

    // Send buyer notification
    await this.sendStatusNotification(order, newStatus);

    return this.mapToDTO(updated!);
  }

  /** Buyer requests a return within the return window */
  async requestReturn(
    orderId: string,
    buyerId: string,
    reason: string,
    returnWindowDays: number = RETURN_WINDOW_DAYS
  ): Promise<Order> {
    const order = await this.ordersRepository.findById(orderId);
    if (!order) throw new NotFoundError('Order not found');

    if (order.buyerId.toString() !== buyerId) {
      throw new UnauthorizedError('Not authorized to request a return for this order');
    }

    if (order.status !== 'delivered') {
      throw new ValidationError('Returns can only be requested for delivered orders');
    }

    if (order.returnRequest) {
      throw new ValidationError('A return request has already been submitted for this order');
    }

    // Check return window
    const deliveredEvent = [...order.timeline]
      .reverse()
      .find((e) => e.status === 'delivered');
    const deliveredAt = deliveredEvent ? new Date(deliveredEvent.timestamp) : order.updatedAt;
    const windowMs = returnWindowDays * 24 * 60 * 60 * 1000;
    if (Date.now() - deliveredAt.getTime() > windowMs) {
      throw new ValidationError(
        `The ${returnWindowDays}-day return window for this order has expired`
      );
    }

    order.returnRequest = {
      reason,
      requestedAt: new Date(),
      status: 'pending',
    };
    order.status = 'return_requested';
    order.timeline.push({
      status: 'return_requested',
      note: `Buyer requested a return: ${reason}`,
      timestamp: new Date(),
    });

    const updated = await this.ordersRepository.update(orderId, {
      status: 'return_requested',
      returnRequest: order.returnRequest,
      timeline: order.timeline,
    } as any);

    // Notify buyer that return request was received
    const notificationsService = new NotificationsService();
    await notificationsService.createNotification(
      buyerId,
      'return_requested',
      'Return Request Submitted',
      `Your return request for order ${order.orderNumber} has been received and is under review.`,
      { orderId: order._id.toString() }
    );

    return this.mapToDTO(updated!);
  }

  /** Admin approves or rejects a return request */
  async resolveReturn(
    orderId: string,
    adminId: string,
    action: 'approve' | 'reject',
    adminNote?: string
  ): Promise<Order> {
    const order = await this.ordersRepository.findById(orderId);
    if (!order) throw new NotFoundError('Order not found');

    if (!order.returnRequest || order.returnRequest.status !== 'pending') {
      throw new ValidationError('No pending return request found for this order');
    }

    const newStatus: OrderStatus = action === 'approve' ? 'return_approved' : 'return_rejected';

    order.returnRequest.status = action === 'approve' ? 'approved' : 'rejected';
    order.returnRequest.adminNote = adminNote;
    order.returnRequest.resolvedAt = new Date();
    order.status = newStatus;

    order.timeline.push({
      status: newStatus,
      note:
        adminNote ||
        (action === 'approve'
          ? 'Return approved. Refund will be processed.'
          : 'Return request rejected.'),
      timestamp: new Date(),
    });

    if (action === 'approve') {
      order.paymentStatus = 'refunded';
      await TransactionModel.updateMany({ orderId: order._id }, { status: 'released' });
    }

    const updated = await this.ordersRepository.update(orderId, {
      status: newStatus,
      paymentStatus: order.paymentStatus,
      returnRequest: order.returnRequest,
      timeline: order.timeline,
    } as any);

    // Notify buyer of decision
    const notificationsService = new NotificationsService();
    await notificationsService.createNotification(
      order.buyerId.toString(),
      action === 'approve' ? 'return_approved' : 'return_rejected',
      action === 'approve' ? 'Return Approved' : 'Return Rejected',
      action === 'approve'
        ? `Your return request for order ${order.orderNumber} has been approved. Refund will be processed.`
        : `Your return request for order ${order.orderNumber} was not approved. ${adminNote || ''}`,
      { orderId: order._id.toString() }
    );

    return this.mapToDTO(updated!);
  }

  private async sendStatusNotification(order: any, newStatus: OrderStatus): Promise<void> {
    const notificationsService = new NotificationsService();
    let notificationTitle = '';
    let notificationBody = '';
    let notificationType = '';

    if (newStatus === 'shipped') {
      notificationType = 'order_shipped';
      notificationTitle = 'Order Shipped!';
      notificationBody = `Your order ${order.orderNumber} has been shipped by the seller.`;
    } else if (newStatus === 'delivered') {
      notificationType = 'order_delivered';
      notificationTitle = 'Order Delivered!';
      notificationBody = `Your order ${order.orderNumber} has been delivered successfully.`;
    } else if (newStatus === 'cancelled') {
      notificationType = 'order_cancelled';
      notificationTitle = 'Order Cancelled';
      notificationBody = `Your order ${order.orderNumber} was cancelled.`;
    }

    if (notificationType) {
      await notificationsService.createNotification(
        order.buyerId.toString(),
        notificationType,
        notificationTitle,
        notificationBody,
        { orderId: order._id.toString() }
      );
    }
  }

  mapToDTO(doc: any): Order {
    return {
      id: doc._id.toString(),
      orderNumber: doc.orderNumber,
      buyerId: doc.buyerId.toString(),
      items: doc.items.map((item: any) => ({
        bookId: item.bookId.toString(),
        sellerId: item.sellerId.toString(),
        title: item.title,
        price: item.price,
        quantity: item.quantity,
        condition: item.condition,
      })),
      shippingAddress: doc.shippingAddress,
      subtotal: doc.subtotal,
      shippingFee: doc.shippingFee,
      tax: doc.tax,
      total: doc.total,
      currency: doc.currency,
      status: doc.status,
      paymentStatus: doc.paymentStatus,
      paymentRef: doc.paymentRef,
      returnRequest: doc.returnRequest
        ? {
            reason: doc.returnRequest.reason,
            requestedAt: doc.returnRequest.requestedAt.toISOString(),
            status: doc.returnRequest.status,
            adminNote: doc.returnRequest.adminNote,
            resolvedAt: doc.returnRequest.resolvedAt
              ? doc.returnRequest.resolvedAt.toISOString()
              : undefined,
          }
        : undefined,
      timeline: doc.timeline.map((event: any) => ({
        status: event.status,
        note: event.note,
        timestamp: event.timestamp.toISOString(),
      })),
      createdAt: doc.createdAt.toISOString(),
      updatedAt: doc.updatedAt.toISOString(),
    };
  }
}
export default OrdersService;
