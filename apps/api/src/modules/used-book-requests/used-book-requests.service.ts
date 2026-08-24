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
      preferredContactMethod: 'whatsapp' as const,
      isContactUnlocked: false,
      note: data.note,
    };

    const itemRecord = {
      listingId: listing._id as mongoose.Types.ObjectId,
      catalogId: (catalogDoc?._id || listing.catalogId) as mongoose.Types.ObjectId,
      title: catalogDoc?.title || 'Book',
      price: listing.price,
      condition: listing.condition,
    };

    const doc = await this.repository.create({
      requestNumber,
      buyerId: new mongoose.Types.ObjectId(buyerId),
      sellerId: listing.sellerId,
      listingId: listing._id as mongoose.Types.ObjectId,
      catalogId: (catalogDoc?._id || listing.catalogId) as mongoose.Types.ObjectId,
      title: catalogDoc?.title || 'Book',
      price: listing.price,
      condition: listing.condition,
      items: [itemRecord],
      totalAskingPrice: listing.price,
      buyerContact,
      status: 'requested',
      expiresAt: new Date(Date.now() + 72 * 60 * 60 * 1000),
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

  async createBatchRequests(
    buyerId: string,
    data: {
      listingIds: string[];
      phone?: string;
      whatsappPhone?: string;
      note?: string;
      preferredContactMethod?: 'whatsapp' | 'phone' | 'email';
    }
  ): Promise<UsedBookRequest[]> {
    const buyerUser = await UserModel.findById(buyerId);
    if (!buyerUser) {
      throw new NotFoundError('Buyer account profile not found.');
    }

    // 1. Group listings by sellerId
    const sellerListingsMap = new Map<string, any[]>();
    for (const listingId of data.listingIds) {
      const listing = await this.listingRepository.findById(listingId);
      if (!listing || listing.status !== 'active') {
        continue;
      }
      if (listing.sellerId.toString() === buyerId) {
        continue;
      }
      const sId = listing.sellerId.toString();
      if (!sellerListingsMap.has(sId)) {
        sellerListingsMap.set(sId, []);
      }
      sellerListingsMap.get(sId)!.push(listing);
    }

    const createdRequests: UsedBookRequest[] = [];
    const notificationsService = new NotificationsService();
    const emailService = new EmailService();

    for (const [sellerIdStr, sListings] of sellerListingsMap.entries()) {
      const firstListing = sListings[0];
      const catalogDoc = firstListing.catalogId as any;
      const requestNumber = this.generateRequestNumber();

      const items = sListings.map((l) => {
        const cat = l.catalogId as any;
        return {
          listingId: l._id as mongoose.Types.ObjectId,
          catalogId: (cat?._id || l.catalogId) as mongoose.Types.ObjectId,
          title: cat?.title || 'Book',
          price: l.price,
          condition: l.condition,
        };
      });

      const totalAskingPrice = items.reduce((sum, it) => sum + it.price, 0);

      const buyerContact = {
        name: buyerUser.name,
        email: buyerUser.email,
        phone: data.phone || buyerUser.phone || undefined,
        whatsappPhone: data.whatsappPhone || data.phone || buyerUser.phone || undefined,
        preferredContactMethod: data.preferredContactMethod || 'whatsapp',
        isContactUnlocked: false,
        note: data.note,
      };

      const titlesSummary = items.map((i) => i.title).join(', ');

      const doc = await this.repository.create({
        requestNumber,
        buyerId: new mongoose.Types.ObjectId(buyerId),
        sellerId: new mongoose.Types.ObjectId(sellerIdStr),
        listingId: firstListing._id as mongoose.Types.ObjectId,
        catalogId: (catalogDoc?._id || firstListing.catalogId) as mongoose.Types.ObjectId,
        title: items.length === 1 ? items[0].title : `${items.length} Used Books (${items[0].title}...)`,
        price: totalAskingPrice,
        condition: firstListing.condition,
        items,
        totalAskingPrice,
        buyerContact,
        status: 'requested',
        expiresAt: new Date(Date.now() + 72 * 60 * 60 * 1000),
        timeline: [
          {
            status: 'requested',
            note: `Used book request for ${items.length} book(s) submitted by buyer.`,
            timestamp: new Date(),
          },
        ],
      });

      // Notifications
      try {
        await notificationsService.createNotification(
          sellerIdStr,
          'used_book_request',
          'New Used Book Request Received!',
          `A buyer requested ${items.length} used book(s): ${titlesSummary}.`,
          { requestId: doc._id.toString(), requestNumber }
        );

        await notificationsService.createNotification(
          buyerId,
          'used_book_request_submitted',
          'Request Dispatched to Seller',
          `Your request for "${titlesSummary}" was sent to the seller.`,
          { requestId: doc._id.toString(), requestNumber }
        );

        const sellerUser = await UserModel.findById(sellerIdStr);
        if (sellerUser) {
          await emailService.sendUsedBookRequestToSeller(
            sellerUser.email,
            sellerUser.name,
            requestNumber,
            titlesSummary,
            buyerUser.name,
            buyerUser.email,
            buyerContact.phone
          );
        }
      } catch (err) {
        console.warn('[Batch UsedBookRequest Notification Warning]:', err);
      }

      createdRequests.push(this.mapToDTO(doc));
    }

    return createdRequests;
  }

  async getBuyerRequests(buyerId: string): Promise<UsedBookRequest[]> {
    const docs = await this.repository.findByBuyerId(buyerId);
    return docs.map((doc) => this.mapToDTO(doc, 'buyer'));
  }

  async getSellerRequests(sellerId: string): Promise<UsedBookRequest[]> {
    const docs = await this.repository.findBySellerId(sellerId);
    return docs.map((doc) => this.mapToDTO(doc, 'seller'));
  }

  async getAdminRequests(statusFilter?: string): Promise<UsedBookRequest[]> {
    const docs = await this.repository.findAll(statusFilter);
    return docs.map((doc) => this.mapToDTO(doc, 'admin'));
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

    const viewerRole = isAdmin ? 'admin' : isBuyer ? 'buyer' : 'seller';
    return this.mapToDTO(doc, viewerRole);
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

  async acceptRequest(id: string, sellerId: string): Promise<UsedBookRequest> {
    const doc = await this.repository.findById(id);
    if (!doc) {
      throw new NotFoundError('Used book request not found');
    }

    const isSeller = doc.sellerId._id
      ? doc.sellerId._id.toString() === sellerId
      : doc.sellerId.toString() === sellerId;

    if (!isSeller) {
      throw new UnauthorizedError('Only the assigned seller can accept this request.');
    }

    if (doc.status !== 'requested' && doc.status !== 'seller_notified') {
      throw new ValidationError(`Cannot accept request in status "${doc.status}"`);
    }

    doc.status = 'accepted';
    if (!doc.buyerContact) {
      doc.buyerContact = {} as any;
    }
    doc.buyerContact.isContactUnlocked = true;

    doc.timeline.push({
      status: 'accepted',
      note: 'Seller accepted request and unlocked contact details.',
      timestamp: new Date(),
    });

    await doc.save();

    // Notify buyer
    try {
      const buyerIdStr = doc.buyerId._id ? doc.buyerId._id.toString() : doc.buyerId.toString();
      const notificationsService = new NotificationsService();
      await notificationsService.createNotification(
        buyerIdStr,
        'used_request_accepted',
        'Used Book Request Accepted! 🎉',
        `The seller accepted your request for "${doc.title}". Expect contact via ${doc.buyerContact.preferredContactMethod || 'WhatsApp'}.`,
        { requestId: doc._id.toString(), requestNumber: doc.requestNumber }
      );
    } catch (err) {
      console.warn('[UsedBookRequest Accept Notification Warning]:', err);
    }

    return this.mapToDTO(doc);
  }

  async declineRequest(id: string, sellerId: string, reason?: string): Promise<UsedBookRequest> {
    const doc = await this.repository.findById(id);
    if (!doc) {
      throw new NotFoundError('Used book request not found');
    }

    const isSeller = doc.sellerId._id
      ? doc.sellerId._id.toString() === sellerId
      : doc.sellerId.toString() === sellerId;

    if (!isSeller) {
      throw new UnauthorizedError('Only the assigned seller can decline this request.');
    }

    doc.status = 'declined';
    doc.timeline.push({
      status: 'declined',
      note: reason || 'Seller declined request.',
      timestamp: new Date(),
    });

    await doc.save();

    // Notify buyer
    try {
      const buyerIdStr = doc.buyerId._id ? doc.buyerId._id.toString() : doc.buyerId.toString();
      const notificationsService = new NotificationsService();
      await notificationsService.createNotification(
        buyerIdStr,
        'used_request_declined',
        'Used Book Request Declined',
        `The seller declined your request for "${doc.title}"${reason ? `: ${reason}` : '.'}`,
        { requestId: doc._id.toString(), requestNumber: doc.requestNumber }
      );
    } catch (err) {
      console.warn('[UsedBookRequest Decline Notification Warning]:', err);
    }

    return this.mapToDTO(doc);
  }

  mapToDTO(doc: any, viewerRole?: 'seller' | 'buyer' | 'admin'): UsedBookRequest {
    const sellerObj = doc.sellerId as any;
    const sellerProfile = sellerObj?.sellerProfile;
    const sellerAddress = sellerObj?.addresses?.[0];
    const isUnlocked = doc.buyerContact?.isContactUnlocked ?? true;
    const isSellerViewingLocked = viewerRole === 'seller' && !isUnlocked;

    return {
      id: doc._id.toString(),
      requestNumber: doc.requestNumber,
      buyerId: doc.buyerId._id ? doc.buyerId._id.toString() : doc.buyerId.toString(),
      sellerId: doc.sellerId._id ? doc.sellerId._id.toString() : doc.sellerId.toString(),
      listingId: doc.listingId?.toString() || '',
      catalogId: doc.catalogId?.toString() || '',
      title: doc.title,
      price: doc.price,
      condition: doc.condition,
      items: (doc.items || []).map((it: any) => ({
        listingId: it.listingId ? it.listingId.toString() : '',
        catalogId: it.catalogId ? it.catalogId.toString() : '',
        title: it.title,
        price: it.price,
        condition: it.condition,
      })),
      totalAskingPrice: doc.totalAskingPrice || doc.price,
      buyerContact: {
        name: doc.buyerContact?.name || '',
        email: isSellerViewingLocked ? '' : (doc.buyerContact?.email || ''),
        phone: isSellerViewingLocked ? undefined : doc.buyerContact?.phone,
        whatsappPhone: isSellerViewingLocked ? undefined : doc.buyerContact?.whatsappPhone,
        note: doc.buyerContact?.note,
        preferredContactMethod: doc.buyerContact?.preferredContactMethod || 'whatsapp',
        isContactUnlocked: isUnlocked,
      },
      sellerName: sellerProfile?.storeName || sellerObj?.name || 'Verified Seller',
      sellerCity: sellerAddress?.city || undefined,
      sellerState: sellerAddress?.state || undefined,
      status: doc.status,
      timeline: (doc.timeline || []).map((t: any) => ({
        status: t.status,
        note: t.note,
        timestamp: t.timestamp ? new Date(t.timestamp).toISOString() : new Date().toISOString(),
      })),
      expiresAt: doc.expiresAt ? new Date(doc.expiresAt).toISOString() : undefined,
      createdAt: doc.createdAt ? new Date(doc.createdAt).toISOString() : new Date().toISOString(),
      updatedAt: doc.updatedAt ? new Date(doc.updatedAt).toISOString() : new Date().toISOString(),
    };
  }
}
export default UsedBookRequestsService;
