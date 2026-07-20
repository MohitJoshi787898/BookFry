import { Router } from 'express';
import { ReviewsController } from './reviews.controller';
import { requireAuth } from '../../middlewares/auth.middleware';
import { requireRoles } from '../../middlewares/rbac.middleware';
import { validate } from '../../middlewares/validate.middleware';
import { createReviewSchema, replyReviewSchema } from './reviews.validation';
import { asyncHandler } from '../../utils/asyncHandler';

const router = Router();
const controller = new ReviewsController();

router.get('/book/:bookId', asyncHandler(controller.listBookReviews));

router.post(
  '/',
  requireAuth,
  validate({ body: createReviewSchema }),
  asyncHandler(controller.create)
);

router.patch(
  '/:id/reply',
  requireAuth,
  requireRoles(['seller', 'admin']),
  validate({ body: replyReviewSchema }),
  asyncHandler(controller.reply)
);

router.delete('/:id', requireAuth, asyncHandler(controller.delete));

export default router;
