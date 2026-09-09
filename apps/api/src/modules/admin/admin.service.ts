import { UserModel } from '../../models/user.model';
import { BookListingModel } from '../../models/book-listing.model';
import { BookCatalogModel } from '../../models/book-catalog.model';
import { OrderModel } from '../../models/order.model';
import { ContactModel } from '../../models/contact.model';
import { NotFoundError, ValidationError } from '../../utils/AppError';
import mongoose from 'mongoose';

export class AdminService {
  async getDashboardStats() {
    const totalUsers = await UserModel.countDocuments();
    const activeListings = await BookListingModel.countDocuments({ status: 'active' });
    const totalOrders = await OrderModel.countDocuments();

    const revenueResult = await OrderModel.aggregate([
      { $match: { paymentStatus: 'paid' } },
      { $group: { _id: null, total: { $sum: '$total' } } },
    ]);
    const grossMerchandiseValue = revenueResult.length > 0 ? parseFloat(revenueResult[0].total.toFixed(2)) : 0;

    const recentUsers = await UserModel.find().sort({ createdAt: -1 }).limit(5).select('-passwordHash -refreshTokenHash');
    const recentOrders = await OrderModel.find().sort({ createdAt: -1 }).limit(5);

    return {
      totalUsers,
      activeListings,
      totalOrders,
      grossMerchandiseValue,
      recentUsers,
      recentOrders,
    };
  }

  async getUsers(page = 1, limit = 20, search?: string, role?: string) {
    const query: any = {};

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }

    if (role) {
      query.roles = role;
    }

    const skip = (page - 1) * limit;
    const [docs, total] = await Promise.all([
      UserModel.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .select('-passwordHash -refreshTokenHash')
        .exec(),
      UserModel.countDocuments(query),
    ]);

    const users = docs.map((u) => ({
      id: u._id.toString(),
      name: u.name,
      email: u.email,
      roles: u.roles,
      isEmailVerified: u.isEmailVerified,
      isBanned: u.isBanned || false,
      createdAt: u.createdAt.toISOString(),
    }));

    return {
      users,
      meta: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  async toggleUserBan(userId: string) {
    const user = await UserModel.findById(userId);
    if (!user) {
      throw new NotFoundError('User not found');
    }

    user.isBanned = !user.isBanned;
    await user.save();

    return {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      roles: user.roles,
      isBanned: user.isBanned,
    };
  }

  async updateUserRoles(userId: string, roles: string[]) {
    const user = await UserModel.findById(userId);
    if (!user) {
      throw new NotFoundError('User not found');
    }

    user.roles = roles as any;
    await user.save();

    return {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      roles: user.roles,
      isBanned: user.isBanned,
    };
  }

  async getListings(page = 1, limit = 20, search?: string, status?: string) {
    const query: any = {};
    if (status) query.status = status;

    const skip = (page - 1) * limit;

    const pipeline: any[] = [
      { $match: query },
      {
        $lookup: {
          from: 'bookcatalogs',
          localField: 'catalogId',
          foreignField: '_id',
          as: 'catalog',
        },
      },
      { $unwind: '$catalog' },
    ];

    if (search) {
      pipeline.push({
        $match: {
          $or: [
            { 'catalog.title': { $regex: search, $options: 'i' } },
            { 'catalog.author': { $regex: search, $options: 'i' } },
            { 'catalog.isbn': { $regex: search, $options: 'i' } },
          ],
        },
      });
    }

    const countPipeline = [...pipeline, { $count: 'total' }];
    pipeline.push(
      { $sort: { createdAt: -1 } },
      { $skip: skip },
      { $limit: limit }
    );

    const [docs, countResult] = await Promise.all([
      BookListingModel.aggregate(pipeline).exec(),
      BookListingModel.aggregate(countPipeline).exec(),
    ]);

    const total = countResult[0]?.total ?? 0;

    const listings = docs.map((b: any) => ({
      id: b._id.toString(),
      title: b.catalog.title,
      slug: b.catalog.slug,
      author: b.catalog.author,
      price: b.price,
      stock: b.stock,
      status: b.status,
      condition: b.condition,
      sellerId: b.sellerId.toString(),
      category: b.catalog.category ? b.catalog.category.toString() : 'Uncategorized',
      createdAt: b.createdAt.toISOString(),
    }));

    return {
      listings,
      meta: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  async moderateListing(listingId: string, status: string, rejectionReason?: string, moderatorId?: string) {
    const listing = await BookListingModel.findById(listingId);
    if (!listing) {
      throw new NotFoundError('Book listing not found');
    }

    if (status === 'rejected') {
      if (!rejectionReason || !rejectionReason.trim()) {
        throw new ValidationError('Rejection reason is required');
      }
      listing.rejectionReason = rejectionReason;
    } else {
      listing.rejectionReason = undefined;
    }

    listing.status = status as any;

    if (!listing.moderationHistory) {
      listing.moderationHistory = [];
    }

    listing.moderationHistory.push({
      status: status as any,
      notes: status === 'rejected' ? rejectionReason : `Listing moderated to ${status}`,
      moderatorId: moderatorId ? new mongoose.Types.ObjectId(moderatorId) : undefined,
      timestamp: new Date(),
    });

    await listing.save();

    const catalog = await BookCatalogModel.findById(listing.catalogId);

    return {
      id: listing._id.toString(),
      title: catalog ? catalog.title : 'Book',
      status: listing.status,
      rejectionReason: listing.rejectionReason,
      moderationHistory: listing.moderationHistory,
    };
  }

  async getPlatformReports() {
    const monthlySales = await OrderModel.aggregate([
      { $match: { paymentStatus: 'paid' } },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
          },
          revenue: { $sum: '$total' },
          ordersCount: { $sum: 1 },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
    ]);

    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const monthlyReport = monthlySales.map((m) => ({
      month: `${monthNames[m._id.month - 1]} ${m._id.year}`,
      revenue: parseFloat(m.revenue.toFixed(2)),
      ordersCount: m.ordersCount,
    }));

    const statusCounts = await OrderModel.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]);

    return {
      monthlyReport,
      statusCounts: statusCounts.map((s) => ({ status: s._id, count: s.count })),
    };
  }

  async getSupportTickets() {
    const docs = await ContactModel.find().sort({ createdAt: -1 }).exec();
    return docs.map((doc, idx) => ({
      id: doc._id.toString(),
      ticketNumber: `TICK-${100 + idx}`,
      userEmail: doc.email,
      name: doc.name,
      subject: doc.subject,
      message: doc.message,
      priority: doc.subject === 'Order Issue' ? ('high' as const) : doc.subject === 'Report a Listing' ? ('high' as const) : ('medium' as const),
      status: doc.status || 'open',
      createdAt: doc.createdAt.toISOString().split('T')[0],
    }));
  }

  async resolveSupportTicket(ticketId: string) {
    const doc = await ContactModel.findById(ticketId);
    if (!doc) {
      throw new NotFoundError('Support ticket not found');
    }
    doc.status = 'resolved';
    await doc.save();
    return {
      id: doc._id.toString(),
      status: doc.status,
    };
  }

  // CMS Methods
  async getCms() {
    const { CmsModel } = await import('../../models/cms.model');
    let cms = await CmsModel.findOne();
    if (!cms) {
      cms = await CmsModel.create({});
    }
    return cms;
  }

  async updateCms(data: { announcementText?: string; announcementEnabled?: boolean; announcementLink?: string; faqs?: any[] }) {
    const { CmsModel } = await import('../../models/cms.model');
    let cms = await CmsModel.findOne();
    if (!cms) {
      cms = new CmsModel();
    }
    if (data.announcementText !== undefined) cms.announcementText = data.announcementText;
    if (data.announcementEnabled !== undefined) cms.announcementEnabled = data.announcementEnabled;
    if (data.announcementLink !== undefined) cms.announcementLink = data.announcementLink;
    if (data.faqs !== undefined) cms.faqs = data.faqs;
    await cms.save();
    return cms;
  }

  // Coupon Methods
  async getCoupons() {
    const { CouponModel } = await import('../../models/coupon.model');
    return CouponModel.find().sort({ createdAt: -1 });
  }

  async createCoupon(data: { code: string; discountType: 'percentage' | 'flat'; discountValue: number; minOrderSubtotal?: number; maxUses?: number; expiryDate?: string }) {
    const { CouponModel } = await import('../../models/coupon.model');
    const existing = await CouponModel.findOne({ code: data.code.toUpperCase() });
    if (existing) throw new ValidationError('Coupon code already exists');
    return CouponModel.create({
      code: data.code.toUpperCase(),
      discountType: data.discountType,
      discountValue: data.discountValue,
      minOrderSubtotal: data.minOrderSubtotal || 0,
      maxUses: data.maxUses || 1000,
      expiryDate: data.expiryDate ? new Date(data.expiryDate) : undefined,
    });
  }

  async deleteCoupon(id: string) {
    const { CouponModel } = await import('../../models/coupon.model');
    const deleted = await CouponModel.findByIdAndDelete(id);
    if (!deleted) throw new NotFoundError('Coupon not found');
    return deleted;
  }

  // Settings Methods
  async getPlatformSettings() {
    const { PlatformSettingsModel } = await import('../../models/platform-settings.model');
    let settings = await PlatformSettingsModel.findOne();
    if (!settings) {
      settings = await PlatformSettingsModel.create({});
    }
    return settings;
  }

  async updatePlatformSettings(data: any) {
    const { PlatformSettingsModel } = await import('../../models/platform-settings.model');
    let settings = await PlatformSettingsModel.findOne();
    if (!settings) {
      settings = new PlatformSettingsModel();
    }
    if (data.commissionPercent !== undefined) settings.commissionPercent = data.commissionPercent;
    if (data.flatShippingFee !== undefined) settings.flatShippingFee = data.flatShippingFee;
    if (data.taxPercent !== undefined) settings.taxPercent = data.taxPercent;
    if (data.returnWindowDays !== undefined) settings.returnWindowDays = data.returnWindowDays;
    if (data.maintenanceMode !== undefined) settings.maintenanceMode = data.maintenanceMode;
    if (data.supportEmail !== undefined) settings.supportEmail = data.supportEmail;
    if (data.supportPhone !== undefined) settings.supportPhone = data.supportPhone;
    await settings.save();
    return settings;
  }

  // Export CSV Report
  async exportCsvReport(): Promise<string> {
    const orders = await OrderModel.find().sort({ createdAt: -1 });
    let csv = 'OrderNumber,BuyerID,Total,Status,PaymentStatus,Date\n';
    for (const order of orders) {
      csv += `${order.orderNumber},${order.buyerId.toString()},${order.total},${order.status},${order.paymentStatus},${order.createdAt.toISOString()}\n`;
    }
    return csv;
  }

  // Expanded Admin CRUD operations
  async getUserById(userId: string) {
    const user = await UserModel.findById(userId).select('-passwordHash -refreshTokenHash');
    if (!user) throw new NotFoundError('User not found');
    return {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      roles: user.roles,
      phone: user.phone,
      isEmailVerified: user.isEmailVerified,
      isBanned: user.isBanned || false,
      addresses: user.addresses || [],
      sellerProfile: user.sellerProfile || null,
      createdAt: user.createdAt.toISOString(),
    };
  }

  async updateUser(userId: string, data: { name?: string; email?: string; roles?: string[]; isBanned?: boolean }) {
    const user = await UserModel.findById(userId);
    if (!user) throw new NotFoundError('User not found');
    if (data.name !== undefined) user.name = data.name;
    if (data.email !== undefined) user.email = data.email;
    if (data.roles !== undefined) user.roles = data.roles as any;
    if (data.isBanned !== undefined) user.isBanned = data.isBanned;
    await user.save();
    return this.getUserById(userId);
  }

  async softDeleteUser(userId: string) {
    const user = await UserModel.findById(userId);
    if (!user) throw new NotFoundError('User not found');
    user.isBanned = true;
    await user.save();
    return { id: userId, isBanned: true, status: 'deleted' };
  }

  async getListingById(listingId: string) {
    const listing = await BookListingModel.findById(listingId);
    if (!listing) throw new NotFoundError('Listing not found');
    const catalog = await BookCatalogModel.findById(listing.catalogId);
    return {
      id: listing._id.toString(),
      title: catalog ? catalog.title : 'Book',
      slug: catalog ? catalog.slug : '',
      author: catalog ? catalog.author : '',
      description: catalog ? catalog.description : '',
      isbn: catalog ? catalog.isbn : '',
      price: listing.price,
      stock: listing.stock,
      status: listing.status,
      condition: listing.condition,
      sellerId: listing.sellerId.toString(),
      images: (listing as any).images || (catalog ? catalog.images : []),
      moderationHistory: listing.moderationHistory || [],
      createdAt: listing.createdAt.toISOString(),
    };
  }

  async updateListing(listingId: string, data: { price?: number; stock?: number; status?: string; condition?: string; title?: string }) {
    const listing = await BookListingModel.findById(listingId);
    if (!listing) throw new NotFoundError('Listing not found');
    if (data.price !== undefined) listing.price = data.price;
    if (data.stock !== undefined) listing.stock = data.stock;
    if (data.status !== undefined) listing.status = data.status as any;
    if (data.condition !== undefined) listing.condition = data.condition as any;
    await listing.save();

    if (data.title && listing.catalogId) {
      await BookCatalogModel.findByIdAndUpdate(listing.catalogId, { title: data.title });
    }

    return this.getListingById(listingId);
  }

  async softDeleteListing(listingId: string) {
    const listing = await BookListingModel.findById(listingId);
    if (!listing) throw new NotFoundError('Listing not found');
    listing.status = 'removed' as any;
    await listing.save();
    return { id: listingId, status: 'removed' };
  }

  async updateCoupon(id: string, data: any) {
    const { CouponModel } = await import('../../models/coupon.model');
    const coupon = await CouponModel.findById(id);
    if (!coupon) throw new NotFoundError('Coupon not found');
    if (data.code) coupon.code = data.code.toUpperCase();
    if (data.discountType) coupon.discountType = data.discountType;
    if (data.discountValue !== undefined) coupon.discountValue = data.discountValue;
    if (data.minOrderSubtotal !== undefined) coupon.minOrderSubtotal = data.minOrderSubtotal;
    if (data.maxUses !== undefined) coupon.maxUses = data.maxUses;
    if (data.expiryDate) coupon.expiryDate = new Date(data.expiryDate);
    await coupon.save();
    return coupon;
  }

  async updateSupportTicket(id: string, data: any) {
    const doc = await ContactModel.findById(id);
    if (!doc) throw new NotFoundError('Support ticket not found');
    if (data.status) doc.status = data.status;
    if (data.subject) doc.subject = data.subject;
    await doc.save();
    return doc;
  }

  /**
   * Admin: approve or reject a seller's verification request.
   * This is the ONLY pathway that can set sellerVerificationStatus to 'approved'.
   */
  async updateSellerVerificationStatus(
    userId: string,
    action: 'approved' | 'rejected',
    rejectionReason?: string
  ) {
    const user = await UserModel.findById(userId);
    if (!user) throw new NotFoundError('User not found');

    if (!user.roles.includes('seller')) {
      throw new ValidationError('This user does not have a seller role');
    }

    if (action === 'rejected' && !rejectionReason?.trim()) {
      throw new ValidationError('A rejection reason is required when rejecting a seller');
    }

    user.sellerVerificationStatus = action;
    if (action === 'rejected') {
      user.sellerVerificationRejectionReason = rejectionReason;
    } else {
      user.sellerVerificationRejectionReason = undefined;
    }

    await user.save();

    return {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      sellerVerificationStatus: user.sellerVerificationStatus,
      sellerVerificationRejectionReason: user.sellerVerificationRejectionReason,
    };
  }

  async softDeleteSupportTicket(id: string) {
    const doc = await ContactModel.findById(id);
    if (!doc) throw new NotFoundError('Support ticket not found');
    doc.status = 'resolved';
    await doc.save();
    return { id, status: 'resolved' };
  }
}

export default AdminService;

