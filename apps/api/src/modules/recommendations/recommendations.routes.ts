import { Router } from 'express';
import { RecommendationsController } from './recommendations.controller';
import { optionalAuth } from '../../middlewares/auth.middleware';
import { asyncHandler } from '../../utils/asyncHandler';

const router = Router();
const controller = new RecommendationsController();

router.get('/home', optionalAuth, asyncHandler(controller.getHomeRecommendations));
router.get('/:bookId', asyncHandler(controller.getBookRecommendations));

export default router;
