import { OrdersRepository } from './orders.repository';
import { CartRepository } from '../cart/cart.repository';
import { BooksRepository } from '../books/books.repository';
import { TransactionModel } from '../../models/transaction.model';
import { NotificationsService } from '../notifications/notifications.service';
import { NotFoundError, ValidationError, UnauthorizedError } from '../../utils/AppError';
import { Order, OrderStatus } from '@bookmarket/types';
import mongoose from 'mongoose';

export class OrdersService {
  private ordersRepository: OrdersRepository;
  private cartRepository: CartRepository;
  private booksRepository: BooksRepository;

  constructor() {
    this.ordersRepository = new OrdersRepository();
    this.cartRepository = new CartRepository();
    this.booksRepository = new BooksRepository();
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
      const bookIdStr = (item.bookId as any)._id
        ? (item.bookId as any)._id.toString()
        : item.bookId.toString();
      const book = await this.booksRepository.findById(bookIdStr);
      if (!book || book.status !== 'active') {
        throw new NotFoundError(`Book ${bookIdStr} is no longer available`);
      }

      if (book.stock < item.quantity) {
        throw new ValidationError(`Insufficient stock for "${book.title}". Only ${book.stock} left.`);
      }

      book.stock -= item.quantity;
      if (book.stock === 0) {
        book.status = 'sold';
      }
      await book.save();

      const price = book.price;
      subtotal += price * item.quantity;

      orderItems.push({
        bookId: book._id,
        sellerId: book.sellerId,
        title: book.title,
        price,
        quantity: item.quantity,
        condition: book.condition,
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

    // Create notifications for the buyer
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
      notificationBody = `Your order ${order.orderNumber} was cancelled by the seller.`;
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

    return this.mapToDTO(updated!);
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
