import { BookModel } from '../../models/book.model';
import { OrderModel } from '../../models/order.model';
import { TransactionModel } from '../../models/transaction.model';
import { OrdersService } from '../orders/orders.service';
import { SellerAnalytics, Transaction } from '@bookmarket/types';
import mongoose from 'mongoose';

export class SellerService {
  private ordersService: OrdersService;

  constructor() {
    this.ordersService = new OrdersService();
  }

  private mapTransactionToDTO(doc: any): Transaction {
    return {
      id: doc._id.toString(),
      orderId: doc.orderId.toString(),
      sellerId: doc.sellerId.toString(),
      amount: doc.amount,
      platformFee: doc.platformFee,
      netPayout: doc.netPayout,
      status: doc.status,
      createdAt: doc.createdAt.toISOString(),
      updatedAt: doc.updatedAt.toISOString(),
    };
  }

  async getDashboardStats(sellerId: string): Promise<SellerAnalytics> {
    const sellerObjId = new mongoose.Types.ObjectId(sellerId);

    // 1. Total Sales Count (total items sold & paid)
    const salesStats = await OrderModel.aggregate([
      { $match: { paymentStatus: 'paid' } },
      { $unwind: '$items' },
      { $match: { 'items.sellerId': sellerObjId } },
      { $group: { _id: null, count: { $sum: '$items.quantity' } } },
    ]);
    const totalSales = salesStats.length > 0 ? salesStats[0].count : 0;

    // 2. Total Earnings (sum of net payouts)
    const earningsStats = await TransactionModel.aggregate([
      { $match: { sellerId: sellerObjId } },
      { $group: { _id: null, sum: { $sum: '$netPayout' } } },
    ]);
    const totalEarnings = earningsStats.length > 0 ? parseFloat(earningsStats[0].sum.toFixed(2)) : 0;

    // 3. Active Listings Count
    const activeListingsCount = await BookModel.countDocuments({
      sellerId: sellerObjId,
      status: 'active',
    });

    // 4. Sales by Month (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    const monthlyStats = await TransactionModel.aggregate([
      {
        $match: {
          sellerId: sellerObjId,
          createdAt: { $gte: sixMonthsAgo },
        },
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
          },
          amount: { $sum: '$netPayout' },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
    ]);

    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const salesByMonth = monthlyStats.map((item) => {
      const monthLabel = `${monthNames[item._id.month - 1]} ${item._id.year}`;
      return {
        month: monthLabel,
        amount: parseFloat(item.amount.toFixed(2)),
      };
    });

    // 5. Recent Orders (last 5 orders containing this seller's products)
    const recentOrderDocs = await OrderModel.find({
      'items.sellerId': sellerObjId,
    })
      .sort({ createdAt: -1 })
      .limit(5)
      .exec();

    const recentOrders = recentOrderDocs.map((doc) => this.ordersService.mapToDTO(doc));

    return {
      totalSales,
      totalEarnings,
      activeListingsCount,
      salesByMonth,
      recentOrders,
    };
  }

  async getEarningsLedger(sellerId: string): Promise<Transaction[]> {
    const docs = await TransactionModel.find({
      sellerId: new mongoose.Types.ObjectId(sellerId),
    })
      .sort({ createdAt: -1 })
      .exec();

    return docs.map((doc) => this.mapTransactionToDTO(doc));
  }
}
export default SellerService;
