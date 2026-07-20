import { ReviewsRepository } from './reviews.repository';
import { BookModel } from '../../models/book.model';
import { OrderModel } from '../../models/order.model';
import { UserModel } from '../../models/user.model';
import { NotFoundError, ValidationError, ConflictError, UnauthorizedError } from '../../utils/AppError';
import { Review } from '@bookmarket/types';

export class ReviewsService {
  private reviewsRepository: ReviewsRepository;

  constructor() {
    this.reviewsRepository = new ReviewsRepository();
  }

  private mapToDTO(doc: any): Review {
    return {
      id: doc._id.toString(),
      bookId: doc.bookId.toString(),
      authorId: doc.authorId.toString(),
      authorName: doc.authorName,
      orderId: doc.orderId.toString(),
      rating: doc.rating,
      comment: doc.comment,
      sellerReply: doc.sellerReply,
      createdAt: doc.createdAt.toISOString(),
      updatedAt: doc.updatedAt.toISOString(),
    };
  }

  async createReview(
    authorId: string,
    data: { bookId: string; orderId: string; rating: number; comment: string }
  ): Promise<Review> {
    const user = await UserModel.findById(authorId);
    if (!user) {
      throw new NotFoundError('User not found');
    }
    const authorName = user.name;

    // 1. Verify proof of purchase
    const order = await OrderModel.findOne({
      _id: data.orderId,
      buyerId: authorId,
      'items.bookId': data.bookId,
      status: { $in: ['confirmed', 'shipped', 'delivered'] },
    });

    if (!order) {
      throw new ValidationError('You can only review books you have purchased.');
    }

    // 2. Check for duplicate review
    const existing = await this.reviewsRepository.findByPurchase(
      data.bookId,
      authorId,
      data.orderId
    );
    if (existing) {
      throw new ConflictError('You have already submitted a review for this purchase.');
    }

    // 3. Create review
    const review = await this.reviewsRepository.create({
      bookId: Object(data.bookId),
      authorId: Object(authorId),
      authorName,
      orderId: Object(data.orderId),
      rating: data.rating,
      comment: data.comment,
    });

    // 4. Update book stats
    const stats = await this.reviewsRepository.calculateBookRatingStats(data.bookId);
    await BookModel.findByIdAndUpdate(data.bookId, {
      ratingAvg: stats.average,
      ratingCount: stats.count,
    });

    return this.mapToDTO(review);
  }

  async getBookReviews(bookId: string): Promise<Review[]> {
    const docs = await this.reviewsRepository.findByBookId(bookId);
    return docs.map((doc) => this.mapToDTO(doc));
  }

  async deleteReview(userId: string, roles: string[], id: string): Promise<void> {
    const review = await this.reviewsRepository.findById(id);
    if (!review) {
      throw new NotFoundError('Review not found');
    }

    const isAuthor = review.authorId.toString() === userId;
    const isAdmin = roles.includes('admin');
    if (!isAuthor && !isAdmin) {
      throw new UnauthorizedError('You are not authorized to delete this review.');
    }

    await this.reviewsRepository.delete(id);

    // Update book stats
    const stats = await this.reviewsRepository.calculateBookRatingStats(review.bookId.toString());
    await BookModel.findByIdAndUpdate(review.bookId, {
      ratingAvg: stats.average,
      ratingCount: stats.count,
    });
  }

  async replyToReview(userId: string, roles: string[], reviewId: string, sellerReply: string): Promise<Review> {
    const review = await this.reviewsRepository.findById(reviewId);
    if (!review) {
      throw new NotFoundError('Review not found');
    }

    const book = await BookModel.findById(review.bookId);
    if (!book) {
      throw new NotFoundError('Associated book not found');
    }

    const isSeller = book.sellerId.toString() === userId;
    const isAdmin = roles.includes('admin');

    if (!isSeller && !isAdmin) {
      throw new UnauthorizedError('Only the seller of this book can reply to reviews.');
    }

    review.sellerReply = sellerReply;
    await review.save();

    return this.mapToDTO(review);
  }
}
export default ReviewsService;
