import { Request, Response } from 'express';
import { ReviewsService } from './reviews.service';
import { ApiResponse } from '../../utils/ApiResponse';

export class ReviewsController {
  private reviewsService: ReviewsService;

  constructor() {
    this.reviewsService = new ReviewsService();
  }

  create = async (req: Request, res: Response): Promise<void> => {
    const authorId = req.user!.id;
    const { bookId, orderId, rating, comment } = req.body;

    const review = await this.reviewsService.createReview(authorId, {
      bookId,
      orderId,
      rating,
      comment,
    });

    res.status(201).json(ApiResponse.success(review));
  };

  listBookReviews = async (req: Request, res: Response): Promise<void> => {
    const { bookId } = req.params;
    const reviews = await this.reviewsService.getBookReviews(bookId);
    res.status(200).json(ApiResponse.success(reviews));
  };

  delete = async (req: Request, res: Response): Promise<void> => {
    const userId = req.user!.id;
    const roles = req.user!.roles;
    const { id } = req.params;

    await this.reviewsService.deleteReview(userId, roles, id);
    res.status(200).json(ApiResponse.success({ message: 'Review deleted successfully' }));
  };

  reply = async (req: Request, res: Response): Promise<void> => {
    const userId = req.user!.id;
    const roles = req.user!.roles;
    const { id } = req.params;
    const { sellerReply } = req.body;

    const updated = await this.reviewsService.replyToReview(userId, roles, id, sellerReply);
    res.status(200).json(ApiResponse.success(updated));
  };
}
export default ReviewsController;
