import { Request, Response } from 'express';
import { RecommendationsService } from './recommendations.service';
import { ApiResponse } from '../../utils/ApiResponse';
import { ValidationError } from '../../utils/AppError';

export class RecommendationsController {
  private recommendationsService: RecommendationsService;

  constructor() {
    this.recommendationsService = new RecommendationsService();
  }

  getHomeRecommendations = async (req: Request, res: Response): Promise<void> => {
    const userId = req.user?.id;
    const data = await this.recommendationsService.getHomeRecommendations(userId);
    res.status(200).json(ApiResponse.success(data));
  };

  getBookRecommendations = async (req: Request, res: Response): Promise<void> => {
    const { bookId } = req.params;
    if (!bookId) {
      throw new ValidationError('bookId parameter is required');
    }
    const data = await this.recommendationsService.getBookRecommendations(bookId);
    res.status(200).json(ApiResponse.success(data));
  };
}

export default RecommendationsController;
