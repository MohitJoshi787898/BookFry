import { Router } from 'express';
import { CartController } from './cart.controller';
import { requireAuth } from '../../middlewares/auth.middleware';
import { validate } from '../../middlewares/validate.middleware';
import { addToCartSchema, updateCartItemSchema, mergeCartSchema } from './cart.validation';
import { asyncHandler } from '../../utils/asyncHandler';

const router = Router();
const controller = new CartController();

router.use(requireAuth);

router.get('/', asyncHandler(controller.get));
router.post('/items', validate({ body: addToCartSchema }), asyncHandler(controller.addItem));
router.patch(
  '/items/:bookId',
  validate({ body: updateCartItemSchema }),
  asyncHandler(controller.updateItem)
);
router.delete('/items/:bookId', asyncHandler(controller.removeItem));
router.post('/merge', validate({ body: mergeCartSchema }), asyncHandler(controller.merge));

export default router;
