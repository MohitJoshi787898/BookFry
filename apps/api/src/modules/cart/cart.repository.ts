import { CartModel, ICartDocument } from '../../models/cart.model';

export class CartRepository {
  async findByUserId(userId: string): Promise<ICartDocument | null> {
    return CartModel.findOne({ userId }).populate('items.bookId').exec();
  }

  async create(userId: string): Promise<ICartDocument> {
    const cart = new CartModel({ userId, items: [] });
    return cart.save();
  }

  async update(userId: string, items: any[]): Promise<ICartDocument | null> {
    return CartModel.findOneAndUpdate({ userId }, { items }, { new: true })
      .populate('items.bookId')
      .exec();
  }
}
export default CartRepository;
