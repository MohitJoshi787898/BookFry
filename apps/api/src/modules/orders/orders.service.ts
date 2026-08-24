import { OrdersRepository } from './orders.repository';
import { CartRepository } from '../cart/cart.repository';
import { ListingRepository } from '../books/listing.repository';
import { CatalogRepository } from '../books/catalog.repository';
import { TransactionModel } from '../../models/transaction.model';
import { NotificationsService } from '../notifications/notifications.service';
import { EmailService } from '../../services/email.service';
import { UserModel } from '../../models/user.model';
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

  private buildSubOrders(
    orderNumber: string,
    orderItems: any[],
    totalSubtotal: number,
    totalShippingFee: number
  ): any[] {
    const sellerMap = new Map<string, any[]>();
    for (const item of orderItems) {
      const sId = item.sellerId.toString();
      if (!sellerMap.has(sId)) {
        sellerMap.set(sId, []);
      }
      sellerMap.get(sId)!.push(item);
    }

    const subOrders: any[] = [];
    let idx = 1;
    for (const [sellerIdStr, sItems] of sellerMap.entries()) {
      const sSubtotal = sItems.reduce((acc, it) => acc + it.price * it.quantity, 0);
      const sRatio = totalSubtotal > 0 ? sSubtotal / totalSubtotal : 1 / sellerMap.size;
      const sShipping = parseFloat((totalShippingFee * sRatio).toFixed(2));
      const sTax = parseFloat((sSubtotal * 0.08).toFixed(2));
      const sTotal = parseFloat((sSubtotal + sShipping + sTax).toFixed(2));
      const sPayout = parseFloat((sSubtotal * 0.9).toFixed(2));

      subOrders.push({
        _id: new mongoose.Types.ObjectId(),
        subOrderNumber: `${orderNumber}-S${idx}`,
        sellerId: new mongoose.Types.ObjectId(sellerIdStr),
        items: sItems,
        subtotal: sSubtotal,
        shippingFee: sShipping,
        tax: sTax,
        total: sTotal,
        sellerPayout: sPayout,
        status: 'pending',
        shippingDetails: {},
        timeline: [
          {
            status: 'pending',
            note: 'Package created, awaiting payment',
            timestamp: new Date(),
          },
        ],
      });
      idx++;
    }
    return subOrders;
  }

  async createOrder(
    buyerId: string,
    shippingAddress: {
      street: string;
      city: string;
      state: string;
      zipCode: string;
      country: string;
    },
    couponCode?: string
  ): Promise<Order> {
    const cart = await this.cartRepository.findByUserId(buyerId);
    if (!cart || cart.items.length === 0) {
      throw new ValidationError('Your cart is empty');
    }

    const orderItems: any[] = [];
    const decrementedListings: Array<{ listing: any; quantity: number }> = [];
    let subtotal = 0;

    try {
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

        if (listing.sellerId.toString() === buyerId) {
          throw new ValidationError(`You cannot purchase your own listed book.`);
        }

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
        decrementedListings.push({ listing, quantity: item.quantity });

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
    } catch (err) {
      // Rollback any stocks decremented before failure
      for (const { listing, quantity } of decrementedListings) {
        try {
          listing.stock += quantity;
          if (listing.status === 'sold') {
            listing.status = 'active';
          }
          await listing.save();
        } catch (rollbackErr) {
          console.error('[Stock Rollback Error]:', rollbackErr);
        }
      }
      throw err;
    }

    let discountAmount = 0;
    let appliedCouponCode: string | undefined = undefined;

    if (couponCode) {
      try {
        const { CouponsService } = await import('../coupons/coupons.service');
        const couponsService = new CouponsService();
        const validation = await couponsService.validateCoupon(couponCode, subtotal);
        if (validation.valid) {
          discountAmount = validation.coupon.discountAmount;
          appliedCouponCode = validation.coupon.code;
          await couponsService.incrementUsage(appliedCouponCode);
        }
      } catch (err) {
        console.warn(`Coupon validation warning for code "${couponCode}":`, err);
      }
    }

    const discountedSubtotal = Math.max(0, subtotal - discountAmount);
    const shippingFee = discountedSubtotal > 499 || discountedSubtotal === 0 ? 0 : 49;
    const tax = parseFloat((discountedSubtotal * 0.08).toFixed(2));
    const total = parseFloat((discountedSubtotal + shippingFee + tax).toFixed(2));

    const orderNumber = this.generateOrderNumber();

    const subOrders = this.buildSubOrders(orderNumber, orderItems, subtotal, shippingFee);

    const orderDoc = await this.ordersRepository.create({
      orderNumber,
      buyerId: new mongoose.Types.ObjectId(buyerId),
      items: orderItems,
      subOrders,
      shippingAddress,
      subtotal,
      discountAmount,
      couponCode: appliedCouponCode,
      shippingFee,
      tax,
      total,
      currency: 'INR',
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

    // Async Email Notifications Dispatch (Non-blocking queue)
    setImmediate(async () => {
      try {
        const emailService = new EmailService();
        const buyerUser = await UserModel.findById(buyerId);
        if (buyerUser) {
          await emailService.queueOrderConfirmation(
            buyerUser.email,
            buyerUser.name,
            orderNumber,
            orderItems.map((item) => ({
              title: item.title,
              price: item.price,
              quantity: item.quantity,
            })),
            total
          );
        }

        // Notify sellers of each unique item
        for (const item of orderItems) {
          const sellerUser = await UserModel.findById(item.sellerId);
          if (sellerUser) {
            const payoutAmount = item.price * 0.9; // 10% platform fee
            await emailService.queueSaleNotification(
              sellerUser.email,
              sellerUser.name,
              orderNumber,
              item.title,
              payoutAmount
            );
          }
        }
      } catch (emailErr) {
        console.error('[Order Email Notification Warning] Non-blocking email error:', emailErr);
      }
    });

    return this.mapToDTO(orderDoc);
  }

  async createMixedCheckout(
    buyerId: string,
    shippingAddress: {
      street: string;
      city: string;
      state: string;
      zipCode: string;
      country: string;
    },
    couponCode?: string,
    buyerContactOverride?: { phone?: string; whatsappPhone?: string; note?: string }
  ): Promise<{ usedRequests: any[]; newOrder: Order | null; requiresPayment: boolean }> {
    const cart = await this.cartRepository.findByUserId(buyerId);
    if (!cart || cart.items.length === 0) {
      throw new ValidationError('Your cart is empty');
    }

    const usedItems: any[] = [];
    const newItems: any[] = [];

    for (const item of cart.items) {
      const listingIdStr = (item.listingId as any)?._id
        ? (item.listingId as any)._id.toString()
        : (item as any).bookId
        ? (item as any).bookId.toString()
        : item.listingId?.toString() ?? '';

      const listing = await this.listingRepository.findById(listingIdStr);
      if (!listing || listing.status !== 'active') {
        throw new NotFoundError(`Listing "${listingIdStr}" is no longer available`);
      }

      if (listing.sellerId.toString() === buyerId) {
        throw new ValidationError(`You cannot purchase your own listed book.`);
      }

      if (listing.condition === 'new') {
        newItems.push({ item, listing });
      } else {
        usedItems.push({ item, listing });
      }
    }

    const usedRequests: any[] = [];
    if (usedItems.length > 0) {
      const { UsedBookRequestsService } = await import('../used-book-requests/used-book-requests.service');
      const usedRequestsService = new UsedBookRequestsService();

      const usedListingIds = usedItems.map(({ listing }) => listing._id.toString());
      const batchRes = await usedRequestsService.createBatchRequests(buyerId, {
        listingIds: usedListingIds,
        phone: buyerContactOverride?.phone,
        whatsappPhone: buyerContactOverride?.whatsappPhone,
        note: buyerContactOverride?.note,
      });
      usedRequests.push(...batchRes);
    }

    let newOrder: Order | null = null;
    if (newItems.length > 0) {
      const orderItems: any[] = [];
      const decrementedListings: Array<{ listing: any; quantity: number }> = [];
      let subtotal = 0;

      try {
        for (const { item, listing } of newItems) {
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
          decrementedListings.push({ listing, quantity: item.quantity });

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
      } catch (err) {
        for (const { listing, quantity } of decrementedListings) {
          try {
            listing.stock += quantity;
            if (listing.status === 'sold') {
              listing.status = 'active';
            }
            await listing.save();
          } catch (rollbackErr) {
            console.error('[Stock Rollback Error]:', rollbackErr);
          }
        }
        throw err;
      }

      let discountAmount = 0;
      let appliedCouponCode: string | undefined = undefined;

      if (couponCode) {
        try {
          const { CouponsService } = await import('../coupons/coupons.service');
          const couponsService = new CouponsService();
          const validation = await couponsService.validateCoupon(couponCode, subtotal);
          if (validation.valid) {
            discountAmount = validation.coupon.discountAmount;
            appliedCouponCode = validation.coupon.code;
            await couponsService.incrementUsage(appliedCouponCode);
          }
        } catch (err) {
          console.warn(`Coupon validation warning for code "${couponCode}":`, err);
        }
      }

      const discountedSubtotal = Math.max(0, subtotal - discountAmount);
      const shippingFee = discountedSubtotal > 499 || discountedSubtotal === 0 ? 0 : 49;
      const tax = parseFloat((discountedSubtotal * 0.08).toFixed(2));
      const total = parseFloat((discountedSubtotal + shippingFee + tax).toFixed(2));

      const orderNumber = this.generateOrderNumber();
      const subOrders = this.buildSubOrders(orderNumber, orderItems, subtotal, shippingFee);

      const orderDoc = await this.ordersRepository.create({
        orderNumber,
        buyerId: new mongoose.Types.ObjectId(buyerId),
        items: orderItems,
        subOrders,
        shippingAddress,
        subtotal,
        discountAmount,
        couponCode: appliedCouponCode,
        shippingFee,
        tax,
        total,
        currency: 'INR',
        status: 'pending',
        paymentStatus: 'pending',
        timeline: [
          {
            status: 'pending',
            note: 'New book order created, awaiting payment',
            timestamp: new Date(),
          },
        ],
      });

      newOrder = this.mapToDTO(orderDoc);

      // Async Email Notifications Dispatch (Non-blocking queue)
      setImmediate(async () => {
        try {
          const emailService = new EmailService();
          const buyerUser = await UserModel.findById(buyerId);
          if (buyerUser) {
            await emailService.queueOrderConfirmation(
              buyerUser.email,
              buyerUser.name,
              orderNumber,
              orderItems.map((item) => ({
                title: item.title,
                price: item.price,
                quantity: item.quantity,
              })),
              total
            );
          }

          for (const item of orderItems) {
            const sellerUser = await UserModel.findById(item.sellerId);
            if (sellerUser) {
              const payoutAmount = item.price * 0.9;
              await emailService.queueSaleNotification(
                sellerUser.email,
                sellerUser.name,
                orderNumber,
                item.title,
                payoutAmount
              );
            }
          }
        } catch (emailErr) {
          console.error('[Order Email Notification Warning]:', emailErr);
        }
      });
    }

    await this.cartRepository.update(buyerId, []);

    return {
      usedRequests,
      newOrder,
      requiresPayment: newOrder !== null,
    };
  }

  async getOrderById(id: string, userId: string, roles: string[]): Promise<Order> {
    const order = await this.ordersRepository.findByIdOrOrderNumber(id);
    if (!order) {
      throw new NotFoundError('Order not found');
    }

    const isAdmin = roles.includes('admin');
    const isBuyer = order.buyerId.toString() === userId;
    const isSellerOfItem = order.items.some((item) => item.sellerId.toString() === userId);

    if (!isAdmin && !isBuyer && !isSellerOfItem) {
      throw new UnauthorizedError('Not authorized to view this order');
    }

    const dto = this.mapToDTO(order);

    if (!isAdmin && !isBuyer && isSellerOfItem) {
      // Seller view isolation: filter to only this seller's items and subOrders
      const sellerSubOrders = (order.subOrders || []).filter(
        (s: any) => s.sellerId?.toString() === userId
      );
      const sellerItems = dto.items.filter((item) => item.sellerId === userId);
      const sellerSubtotal = sellerItems.reduce((sum, it) => sum + it.price * it.quantity, 0);

      return {
        ...dto,
        items: sellerItems,
        subOrders: dto.subOrders?.filter((s) => s.sellerId === userId),
        subtotal: sellerSubtotal,
        total:
          sellerSubOrders.length > 0
            ? sellerSubOrders.reduce((sum: number, s: any) => sum + s.total, 0)
            : parseFloat((sellerSubtotal * 1.08).toFixed(2)),
      };
    }

    return dto;
  }

  async getPublicInvoice(idOrOrderNumber: string, userId?: string, roles: string[] = []): Promise<Order> {
    const order = await this.ordersRepository.findByIdOrOrderNumber(idOrOrderNumber);
    if (!order) {
      throw new NotFoundError('Tax Invoice not found');
    }

    if (userId) {
      const isAdmin = roles.includes('admin');
      const isBuyer = order.buyerId.toString() === userId;
      const isSellerOfItem = order.items.some((item) => item.sellerId.toString() === userId);

      if (!isAdmin && !isBuyer && !isSellerOfItem) {
        throw new UnauthorizedError('Not authorized to view this tax invoice');
      }
    }

    return this.mapToDTO(order);
  }

  async getBuyerOrders(buyerId: string): Promise<Order[]> {
    const docs = await this.ordersRepository.findByBuyerId(buyerId);
    return docs.map((doc) => this.mapToDTO(doc));
  }

  async getSellerOrders(sellerId: string): Promise<Order[]> {
    const docs = await this.ordersRepository.findBySellerId(sellerId);
    return docs.map((doc) => {
      const sellerSubOrders = (doc.subOrders || []).filter(
        (s: any) => s.sellerId?.toString() === sellerId
      );
      const sellerItems = doc.items.filter(
        (item: any) => item.sellerId?.toString() === sellerId
      );
      const sellerSubtotal = sellerItems.reduce(
        (sum: number, it: any) => sum + it.price * it.quantity,
        0
      );

      const dto = this.mapToDTO(doc);
      return {
        ...dto,
        items: sellerItems.map((item: any) => ({
          listingId: item.listingId ? item.listingId.toString() : undefined,
          bookId: item.bookId ? item.bookId.toString() : '',
          sellerId: item.sellerId ? item.sellerId.toString() : '',
          title: item.title,
          price: item.price,
          quantity: item.quantity,
          condition: item.condition,
        })),
        subOrders: dto.subOrders?.filter((s) => s.sellerId === sellerId),
        subtotal: sellerSubtotal,
        total:
          sellerSubOrders.length > 0
            ? sellerSubOrders.reduce((sum: number, s: any) => sum + s.total, 0)
            : parseFloat((sellerSubtotal * 1.08).toFixed(2)),
      };
    });
  }

  async updateSubOrderStatus(
    orderId: string,
    subOrderId: string,
    userId: string,
    roles: string[],
    newStatus: OrderStatus,
    shippingDetails?: {
      carrier?: string;
      trackingNumber?: string;
      trackingUrl?: string;
      estimatedDays?: number;
    },
    note?: string
  ): Promise<Order> {
    const order = await this.ordersRepository.findById(orderId);
    if (!order) {
      throw new NotFoundError('Order not found');
    }

    const isAdmin = roles.includes('admin');
    const subOrder = (order.subOrders || []).find(
      (s: any) => s._id?.toString() === subOrderId || s.subOrderNumber === subOrderId
    );

    if (!subOrder) {
      return this.updateOrderStatus(orderId, userId, roles, newStatus, note);
    }

    const isSellerOfSubOrder = subOrder.sellerId.toString() === userId;
    if (!isAdmin && !isSellerOfSubOrder) {
      throw new UnauthorizedError('Not authorized to update this package status');
    }

    const VALID_TRANSITIONS: Record<string, string[]> = {
      pending: ['confirmed', 'cancelled'],
      confirmed: ['shipped', 'cancelled'],
      shipped: ['delivered', 'cancelled'],
      delivered: ['return_requested'],
      return_requested: ['return_approved', 'return_rejected'],
      return_approved: ['refunded'],
      return_rejected: [],
      cancelled: [],
      refunded: [],
    };

    if (!isAdmin && !VALID_TRANSITIONS[subOrder.status]?.includes(newStatus)) {
      throw new ValidationError(
        `Invalid status transition from "${subOrder.status}" to "${newStatus}"`
      );
    }

    subOrder.status = newStatus;
    subOrder.timeline.push({
      status: newStatus,
      note: note || `Package status updated to ${newStatus}`,
      timestamp: new Date(),
    });

    if (shippingDetails) {
      if (!subOrder.shippingDetails) {
        subOrder.shippingDetails = {};
      }
      if (shippingDetails.carrier) subOrder.shippingDetails.carrier = shippingDetails.carrier;
      if (shippingDetails.trackingNumber)
        subOrder.shippingDetails.trackingNumber = shippingDetails.trackingNumber;
      if (shippingDetails.trackingUrl)
        subOrder.shippingDetails.trackingUrl = shippingDetails.trackingUrl;
      if (newStatus === 'shipped') {
        subOrder.shippingDetails.shippedAt = new Date();
        if (shippingDetails.estimatedDays) {
          const est = new Date();
          est.setDate(est.getDate() + shippingDetails.estimatedDays);
          subOrder.shippingDetails.estimatedDelivery = est;
        }
      } else if (newStatus === 'delivered') {
        subOrder.shippingDetails.deliveredAt = new Date();
      }
    }

    const allStatuses = order.subOrders.map((s: any) => s.status);
    if (allStatuses.every((s: string) => s === 'delivered')) {
      order.status = 'delivered';
    } else if (allStatuses.some((s: string) => s === 'shipped' || s === 'delivered')) {
      order.status = 'shipped';
    } else if (allStatuses.every((s: string) => s === 'cancelled')) {
      order.status = 'cancelled';
    }

    order.timeline.push({
      status: order.status,
      note: `Package ${subOrder.subOrderNumber} updated to ${newStatus}`,
      timestamp: new Date(),
    });

    await order.save();

    try {
      const notificationsService = new NotificationsService();
      await notificationsService.createNotification(
        order.buyerId.toString(),
        `package_${newStatus}`,
        `Package ${newStatus === 'shipped' ? 'Dispatched' : newStatus === 'delivered' ? 'Delivered' : 'Updated'}!`,
        `Your package #${subOrder.subOrderNumber} has been marked as ${newStatus}${
          shippingDetails?.carrier ? ` via ${shippingDetails.carrier}` : ''
        }.`,
        { orderId: order._id.toString(), subOrderId: subOrder._id?.toString() }
      );
    } catch (err) {
      console.warn('[SubOrder Notification Warning]:', err);
    }

    return this.mapToDTO(order);
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

    // If caller is a seller and order has sub-orders, route through sub-order handler
    if (!isAdmin && isSellerOfItem && order.subOrders && order.subOrders.length > 0) {
      const sellerSub = order.subOrders.find((s: any) => s.sellerId.toString() === userId);
      if (sellerSub) {
        return this.updateSubOrderStatus(
          id,
          sellerSub._id?.toString() || sellerSub.subOrderNumber,
          userId,
          roles,
          newStatus,
          undefined,
          note
        );
      }
    }

    // State machine transition validation
    const VALID_TRANSITIONS: Record<string, string[]> = {
      pending: ['confirmed', 'cancelled'],
      confirmed: ['shipped', 'cancelled'],
      shipped: ['delivered', 'cancelled'],
      delivered: ['return_requested'],
      return_requested: ['return_approved', 'return_rejected'],
      cancelled: [],
      refunded: [],
      return_approved: [],
      return_rejected: [],
    };

    const allowedNextStatuses = VALID_TRANSITIONS[order.status] || [];
    if (!isAdmin && !allowedNextStatuses.includes(newStatus)) {
      throw new ValidationError(
        `Invalid order status transition from "${order.status}" to "${newStatus}". Allowed next statuses: ${
          allowedNextStatuses.join(', ') || 'none'
        }`
      );
    }

    order.status = newStatus;
    order.timeline.push({
      status: newStatus,
      note: note || `Status updated to ${newStatus}`,
      timestamp: new Date(),
    });

    if (order.subOrders && order.subOrders.length > 0) {
      for (const sub of order.subOrders) {
        if (isAdmin || sub.sellerId.toString() === userId) {
          sub.status = newStatus;
          if (!sub.timeline) sub.timeline = [];
          sub.timeline.push({
            status: newStatus,
            note: note || `Package status updated to ${newStatus}`,
            timestamp: new Date(),
          });
        }
      }
    }

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
      subOrders: order.subOrders,
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
      subOrders: (doc.subOrders || []).map((sub: any) => ({
        id: sub._id ? sub._id.toString() : sub.subOrderNumber,
        subOrderNumber: sub.subOrderNumber,
        sellerId: sub.sellerId ? sub.sellerId.toString() : '',
        items: (sub.items || []).map((item: any) => ({
          listingId: item.listingId ? item.listingId.toString() : undefined,
          bookId: item.bookId ? item.bookId.toString() : '',
          sellerId: item.sellerId ? item.sellerId.toString() : '',
          title: item.title,
          price: item.price,
          quantity: item.quantity,
          condition: item.condition,
        })),
        subtotal: sub.subtotal,
        shippingFee: sub.shippingFee,
        tax: sub.tax,
        total: sub.total,
        sellerPayout: sub.sellerPayout,
        status: sub.status,
        shippingDetails: sub.shippingDetails
          ? {
              carrier: sub.shippingDetails.carrier,
              trackingNumber: sub.shippingDetails.trackingNumber,
              trackingUrl: sub.shippingDetails.trackingUrl,
              shippedAt: sub.shippingDetails.shippedAt
                ? new Date(sub.shippingDetails.shippedAt).toISOString()
                : undefined,
              estimatedDelivery: sub.shippingDetails.estimatedDelivery
                ? new Date(sub.shippingDetails.estimatedDelivery).toISOString()
                : undefined,
              deliveredAt: sub.shippingDetails.deliveredAt
                ? new Date(sub.shippingDetails.deliveredAt).toISOString()
                : undefined,
            }
          : undefined,
        timeline: (sub.timeline || []).map((ev: any) => ({
          status: ev.status,
          note: ev.note,
          timestamp: ev.timestamp
            ? new Date(ev.timestamp).toISOString()
            : new Date().toISOString(),
        })),
        returnRequest: sub.returnRequest
          ? {
              reason: sub.returnRequest.reason,
              requestedAt: sub.returnRequest.requestedAt
                ? new Date(sub.returnRequest.requestedAt).toISOString()
                : new Date().toISOString(),
              status: sub.returnRequest.status,
              adminNote: sub.returnRequest.adminNote,
              resolvedAt: sub.returnRequest.resolvedAt
                ? new Date(sub.returnRequest.resolvedAt).toISOString()
                : undefined,
            }
          : undefined,
        createdAt: sub.createdAt ? new Date(sub.createdAt).toISOString() : doc.createdAt.toISOString(),
        updatedAt: sub.updatedAt ? new Date(sub.updatedAt).toISOString() : doc.updatedAt.toISOString(),
      })),
      shippingAddress: doc.shippingAddress,
      subtotal: doc.subtotal,
      discountAmount: doc.discountAmount,
      couponCode: doc.couponCode,
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
