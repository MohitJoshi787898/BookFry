import { Router } from 'express';
import { WishlistController } from './wishlist.controller';
import { requireAuth } from '../../middlewares/auth.middleware';
import { asyncHandler } from '../../utils/asyncHandler';

const router = Router();
const controller = new WishlistController();

router.use(requireAuth);

router.get('/', asyncHandler(controller.getWishlist));
router.post('/:bookId', asyncHandler(controller.add));
router.delete('/:bookId', asyncHandler(controller.remove));

export default router;
