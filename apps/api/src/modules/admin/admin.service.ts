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
}

export default AdminService;
