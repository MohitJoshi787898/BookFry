import { Router } from 'express';
import { OrdersController } from './orders.controller';
import { requireAuth } from '../../middlewares/auth.middleware';
import { requireRoles } from '../../middlewares/rbac.middleware';
import { validate } from '../../middlewares/validate.middleware';
import { checkoutSchema, updateOrderStatusSchema } from './orders.validation';
import { asyncHandler } from '../../utils/asyncHandler';

const router = Router();
const controller = new OrdersController();

router.use(requireAuth);

router.post('/', validate({ body: checkoutSchema }), asyncHandler(controller.create));
router.get('/', asyncHandler(controller.listBuyerOrders));
router.get('/seller', requireRoles(['seller', 'admin']), asyncHandler(controller.listSellerOrders));
router.get('/:id', asyncHandler(controller.getDetails));
router.patch(
  '/:id/status',
  requireRoles(['seller', 'admin']),
  validate({ body: updateOrderStatusSchema }),
  asyncHandler(controller.updateStatus)
);

export default router;
