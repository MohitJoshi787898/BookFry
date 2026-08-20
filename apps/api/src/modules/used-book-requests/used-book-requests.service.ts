import { UsedBookRequestsRepository } from './used-book-requests.repository';
import { ListingRepository } from '../books/listing.repository';
import { CatalogRepository } from '../books/catalog.repository';
import { UserModel } from '../../models/user.model';
import { NotificationsService } from '../notifications/notifications.service';
import { EmailService } from '../../services/email.service';
import { NotFoundError, ValidationError, UnauthorizedError } from '../../utils/AppError';
import { UsedBookRequest, UsedBookRequestStatus } from '@bookmarket/types';
import mongoose from 'mongoose';

export class UsedBookRequestsService {
  private repository: UsedBookRequestsRepository;
  private listingRepository: ListingRepository;
  private catalogRepository: CatalogRepository;

  constructor() {
    this.repository = new UsedBookRequestsRepository();
    this.listingRepository = new ListingRepository();
    this.catalogRepository = new CatalogRepository();
  }

  private generateRequestNumber(): string {
    const timestamp = Date.now().toString().slice(-6);
    const random = Math.random().toString(36).substring(2, 6).toUpperCase();
    return `REQ-${timestamp}-${random}`;
  }

  async createRequest(
    buyerId: string,
    data: {
      listingId: string;
      phone?: string;
      whatsappPhone?: string;
      note?: string;
    }
  ): Promise<UsedBookRequest> {
    const listing = await this.listingRepository.findById(data.listingId);
    if (!listing || listing.status !== 'active') {
      throw new NotFoundError('Used book listing is no longer active or available.');
    }

    if (listing.sellerId.toString() === buyerId) {
      throw new ValidationError('You cannot request your own listed book.');
    }

    const catalogDoc = listing.catalogId as any;
    const buyerUser = await UserModel.findById(buyerId);
    if (!buyerUser) {
      throw new NotFoundError('Buyer account profile not found.');
    }

    const sellerUser = await UserModel.findById(listing.sellerId);

    const requestNumber = this.generateRequestNumber();
    const buyerContact = {
      name: buyerUser.name,
      email: buyerUser.email,
      phone: data.phone || buyerUser.phone || undefined,
      whatsappPhone: data.whatsappPhone || data.phone || buyerUser.phone || undefined,
      note: data.note,
    };

    const doc = await this.repository.create({
      requestNumber,
      buyerId: new mongoose.Types.ObjectId(buyerId),
      sellerId: listing.sellerId,
      listingId: listing._id as mongoose.Types.ObjectId,
      catalogId: catalogDoc?._id || listing.catalogId,
      title: catalogDoc?.title || 'Book',
      price: listing.price,
      condition: listing.condition,
      buyerContact,
      status: 'requested',
      timeline: [
        {
          status: 'requested',
          note: 'Used book purchase request submitted by buyer.',
          timestamp: new Date(),
        },
      ],
    });

    // In-app Notifications
    try {
      const notificationsService = new NotificationsService();
      await notificationsService.createNotification(
        listing.sellerId.toString(),
        'used_book_request',
        'New Used Book Request!',
        `A buyer expressed interest in your used listing "${catalogDoc?.title || 'Book'}".`,
        { requestId: doc._id.toString(), requestNumber }
      );

      await notificationsService.createNotification(
        buyerId,
        'used_book_request_submitted',
        'Request Sent to Seller',
        `Your purchase request for "${catalogDoc?.title || 'Book'}" has been sent to the seller.`,
        { requestId: doc._id.toString(), requestNumber }
      );
    } catch (notifErr) {
      console.warn('[UsedBookRequest Notification Warning]:', notifErr);
    }

    // Email Notifications (Async / Non-blocking)
    try {
      if (sellerUser) {
        const emailService = new EmailService();
        await emailService.sendUsedBookRequestToSeller(
          sellerUser.email,
          sellerUser.name,
          requestNumber,
          catalogDoc?.title || 'Book',
          buyerUser.name,
          buyerUser.email,
          buyerContact.phone
        );
      }
    } catch (emailErr) {
      console.warn('[UsedBookRequest Email Warning]:', emailErr);
    }

    return this.mapToDTO(doc);
  }

  async getBuyerRequests(buyerId: string): Promise<UsedBookRequest[]> {
    const docs = await this.repository.findByBuyerId(buyerId);
    return docs.map((doc) => this.mapToDTO(doc));
  }

  async getSellerRequests(sellerId: string): Promise<UsedBookRequest[]> {
    const docs = await this.repository.findBySellerId(sellerId);
    return docs.map((doc) => this.mapToDTO(doc));
  }

  async getAdminRequests(statusFilter?: string): Promise<UsedBookRequest[]> {
    const docs = await this.repository.findAll(statusFilter);
    return docs.map((doc) => this.mapToDTO(doc));
  }

  async getRequestById(id: string, userId: string, roles: string[]): Promise<UsedBookRequest> {
    const doc = await this.repository.findById(id);
    if (!doc) {
      throw new NotFoundError('Used book request not found');
    }

    const isAdmin = roles.includes('admin');
    const isBuyer = doc.buyerId._id
      ? doc.buyerId._id.toString() === userId
      : doc.buyerId.toString() === userId;
    const isSeller = doc.sellerId._id
      ? doc.sellerId._id.toString() === userId
      : doc.sellerId.toString() === userId;

    if (!isAdmin && !isBuyer && !isSeller) {
      throw new UnauthorizedError('You are not authorized to view this purchase request.');
    }

    return this.mapToDTO(doc);
  }

  async updateStatus(
    id: string,
    userId: string,
    roles: string[],
    status: UsedBookRequestStatus,
    note?: string
  ): Promise<UsedBookRequest> {
    const doc = await this.repository.findById(id);
    if (!doc) {
      throw new NotFoundError('Used book request not found');
    }

    const isAdmin = roles.includes('admin');
    const isBuyer = doc.buyerId._id
      ? doc.buyerId._id.toString() === userId
      : doc.buyerId.toString() === userId;
    const isSeller = doc.sellerId._id
      ? doc.sellerId._id.toString() === userId
      : doc.sellerId.toString() === userId;

    if (!isAdmin && !isBuyer && !isSeller) {
      throw new UnauthorizedError('You are not authorized to update this request status.');
    }

    const updated = await this.repository.updateStatus(id, status, note);

    // Notify buyer on status update
    try {
      const buyerIdStr = doc.buyerId._id ? doc.buyerId._id.toString() : doc.buyerId.toString();
      const notificationsService = new NotificationsService();
      await notificationsService.createNotification(
        buyerIdStr,
        'used_request_status_update',
        'Request Status Updated',
        `Your used book request #${doc.requestNumber} status is now: ${status.replace('_', ' ')}.`,
        { requestId: doc._id.toString() }
      );

      const buyerUser = doc.buyerId as any;
      if (buyerUser?.email) {
        const emailService = new EmailService();
        await emailService.sendUsedBookRequestStatusUpdateToBuyer(
          buyerUser.email,
          buyerUser.name || 'Buyer',
          doc.requestNumber,
          doc.title,
          status,
          note
        );
      }
    } catch (err) {
      console.warn('[UsedBookRequest Status Update Warning]:', err);
    }

    return this.mapToDTO(updated!);
  }

  mapToDTO(doc: any): UsedBookRequest {
    const sellerObj = doc.sellerId as any;
    const sellerProfile = sellerObj?.sellerProfile;
    const sellerAddress = sellerObj?.addresses?.[0];

    return {
      id: doc._id.toString(),
      requestNumber: doc.requestNumber,
      buyerId: doc.buyerId._id ? doc.buyerId._id.toString() : doc.buyerId.toString(),
      sellerId: doc.sellerId._id ? doc.sellerId._id.toString() : doc.sellerId.toString(),
      listingId: doc.listingId.toString(),
      catalogId: doc.catalogId.toString(),
      title: doc.title,
      price: doc.price,
      condition: doc.condition,
      buyerContact: doc.buyerContact,
      sellerName: sellerProfile?.storeName || sellerObj?.name || 'Verified Seller',
      sellerCity: sellerAddress?.city || undefined,
      sellerState: sellerAddress?.state || undefined,
      status: doc.status,
      timeline: (doc.timeline || []).map((t: any) => ({
        status: t.status,
        note: t.note,
        timestamp: t.timestamp ? new Date(t.timestamp).toISOString() : new Date().toISOString(),
      })),
      createdAt: doc.createdAt ? new Date(doc.createdAt).toISOString() : new Date().toISOString(),
      updatedAt: doc.updatedAt ? new Date(doc.updatedAt).toISOString() : new Date().toISOString(),
    };
  }
}
export default UsedBookRequestsService;
