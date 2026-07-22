import { UserModel } from '../../models/user.model';
import { BookModel } from '../../models/book.model';
import { OrderModel } from '../../models/order.model';
import { ContactModel } from '../../models/contact.model';
import { NotFoundError } from '../../utils/AppError';
import mongoose from 'mongoose';

export class AdminService {
  async getDashboardStats() {
    const totalUsers = await UserModel.countDocuments();
    const activeListings = await BookModel.countDocuments({ status: 'active' });
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

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { author: { $regex: search, $options: 'i' } },
        { isbn: { $regex: search, $options: 'i' } },
      ];
    }

    if (status) {
      query.status = status;
    }

    const skip = (page - 1) * limit;
    const [docs, total] = await Promise.all([
      BookModel.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('category', 'name slug')
        .exec(),
      BookModel.countDocuments(query),
    ]);

    const listings = docs.map((b: any) => ({
      id: b._id.toString(),
      title: b.title,
      slug: b.slug,
      author: b.author,
      price: b.price,
      stock: b.stock,
      status: b.status,
      condition: b.condition,
      sellerId: b.sellerId.toString(),
      category: b.category ? b.category.name : 'Uncategorized',
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

  async moderateListing(bookId: string, status: string) {
    const book = await BookModel.findById(bookId);
    if (!book) {
      throw new NotFoundError('Book listing not found');
    }

    book.status = status as any;
    await book.save();

    return {
      id: book._id.toString(),
      title: book.title,
      status: book.status,
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
