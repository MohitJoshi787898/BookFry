import { WishlistModel, IWishlistDocument } from '../../models/wishlist.model';
import mongoose from 'mongoose';

export class WishlistRepository {
  async findByUserId(userId: string): Promise<IWishlistDocument | null> {
    return WishlistModel.findOne({ userId: new mongoose.Types.ObjectId(userId) }).exec();
  }

  async findByUserIdPopulated(userId: string): Promise<IWishlistDocument | null> {
    return WishlistModel.findOne({ userId: new mongoose.Types.ObjectId(userId) })
      .populate('bookIds')
      .exec();
  }

  async create(userId: string): Promise<IWishlistDocument> {
    const doc = new WishlistModel({
      userId: new mongoose.Types.ObjectId(userId),
      bookIds: [],
    });
    return doc.save();
  }

  async save(doc: IWishlistDocument): Promise<IWishlistDocument> {
    return doc.save();
  }
}
export default WishlistRepository;
