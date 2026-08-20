import { UsedBookRequestModel, IUsedBookRequestDocument } from '../../models/used-book-request.model';
import mongoose from 'mongoose';

export class UsedBookRequestsRepository {
  async create(data: Partial<IUsedBookRequestDocument>): Promise<IUsedBookRequestDocument> {
    const request = new UsedBookRequestModel(data);
    return request.save();
  }

  async findById(id: string): Promise<IUsedBookRequestDocument | null> {
    return UsedBookRequestModel.findById(id)
      .populate('buyerId', 'name email phone')
      .populate('sellerId', 'name email phone sellerProfile')
      .exec();
  }

  async findByRequestNumber(reqNumber: string): Promise<IUsedBookRequestDocument | null> {
    return UsedBookRequestModel.findOne({ requestNumber: reqNumber })
      .populate('buyerId', 'name email phone')
      .populate('sellerId', 'name email phone sellerProfile')
      .exec();
  }

  async findByBuyerId(buyerId: string): Promise<IUsedBookRequestDocument[]> {
    return UsedBookRequestModel.find({ buyerId: new mongoose.Types.ObjectId(buyerId) })
      .sort({ createdAt: -1 })
      .populate('sellerId', 'name email phone sellerProfile')
      .exec();
  }

  async findBySellerId(sellerId: string): Promise<IUsedBookRequestDocument[]> {
    return UsedBookRequestModel.find({ sellerId: new mongoose.Types.ObjectId(sellerId) })
      .sort({ createdAt: -1 })
      .populate('buyerId', 'name email phone')
      .exec();
  }

  async findAll(statusFilter?: string): Promise<IUsedBookRequestDocument[]> {
    const query: Record<string, unknown> = {};
    if (statusFilter) query.status = statusFilter;
    return UsedBookRequestModel.find(query)
      .sort({ createdAt: -1 })
      .populate('buyerId', 'name email phone')
      .populate('sellerId', 'name email phone sellerProfile')
      .exec();
  }

  async updateStatus(
    id: string,
    status: string,
    note?: string
  ): Promise<IUsedBookRequestDocument | null> {
    const doc = await UsedBookRequestModel.findById(id);
    if (!doc) return null;

    doc.status = status as any;
    doc.timeline.push({
      status: status as any,
      note: note || `Status updated to ${status}`,
      timestamp: new Date(),
    });

    return doc.save();
  }
}
export default UsedBookRequestsRepository;
