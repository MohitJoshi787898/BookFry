import { CartModel, ICartDocument } from '../../models/cart.model';

export class CartRepository {
  async findByUserId(userId: string): Promise<ICartDocument | null> {
    return CartModel.findOne({ userId })
      .populate({
        path: 'items.listingId',
        populate: { path: 'catalogId', select: 'title author isbn images slug' },
      })
      .exec();
  }

  async create(userId: string): Promise<ICartDocument> {
    const cart = new CartModel({ userId, items: [] });
    return cart.save();
  }

  async update(userId: string, items: any[]): Promise<ICartDocument | null> {
    return CartModel.findOneAndUpdate({ userId }, { items }, { new: true })
      .populate({
        path: 'items.listingId',
        populate: { path: 'catalogId', select: 'title author isbn images slug' },
      })
      .exec();
  }
}
export default CartRepository;
