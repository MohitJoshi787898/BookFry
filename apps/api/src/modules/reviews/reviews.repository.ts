import { ReviewModel, IReviewDocument } from '../../models/review.model';
import mongoose from 'mongoose';

export class ReviewsRepository {
  async findByBookId(bookId: string): Promise<IReviewDocument[]> {
    return ReviewModel.find({ bookId: new mongoose.Types.ObjectId(bookId) })
      .sort({ createdAt: -1 })
      .exec();
  }

  async findById(id: string): Promise<IReviewDocument | null> {
    return ReviewModel.findById(id).exec();
  }

  async findByPurchase(
    bookId: string,
    authorId: string,
    orderId: string
  ): Promise<IReviewDocument | null> {
    return ReviewModel.findOne({
      bookId: new mongoose.Types.ObjectId(bookId),
      authorId: new mongoose.Types.ObjectId(authorId),
      orderId: new mongoose.Types.ObjectId(orderId),
    }).exec();
  }

  async create(data: Partial<IReviewDocument>): Promise<IReviewDocument> {
    const doc = new ReviewModel(data);
    return doc.save();
  }

  async delete(id: string): Promise<IReviewDocument | null> {
    return ReviewModel.findByIdAndDelete(id).exec();
  }

  async calculateBookRatingStats(bookId: string): Promise<{ count: number; average: number }> {
    const stats = await ReviewModel.aggregate([
      { $match: { bookId: new mongoose.Types.ObjectId(bookId) } },
      {
        $group: {
          _id: '$bookId',
          average: { $avg: '$rating' },
          count: { $sum: 1 },
        },
      },
    ]);

    if (stats.length === 0) {
      return { count: 0, average: 0 };
    }

    return {
      count: stats[0].count,
      average: parseFloat(stats[0].average.toFixed(1)),
    };
  }
}
export default ReviewsRepository;
