import { OrderModel, IOrderDocument } from '../../models/order.model';
import mongoose from 'mongoose';

export class OrdersRepository {
  async findById(id: string): Promise<IOrderDocument | null> {
    return OrderModel.findById(id).exec();
  }

  async findByBuyerId(buyerId: string): Promise<IOrderDocument[]> {
    return OrderModel.find({ buyerId: new mongoose.Types.ObjectId(buyerId) })
      .sort({ createdAt: -1 })
      .exec();
  }

  async findBySellerId(sellerId: string): Promise<IOrderDocument[]> {
    return OrderModel.find({ 'items.sellerId': new mongoose.Types.ObjectId(sellerId) })
      .sort({ createdAt: -1 })
      .exec();
  }

  async create(data: Partial<IOrderDocument>): Promise<IOrderDocument> {
    const order = new OrderModel(data);
    return order.save();
  }

  async update(
    id: string,
    updateData: Partial<IOrderDocument>
  ): Promise<IOrderDocument | null> {
    return OrderModel.findByIdAndUpdate(id, updateData, { new: true }).exec();
  }
}
export default OrdersRepository;
