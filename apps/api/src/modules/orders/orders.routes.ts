import { Router } from 'express';
import { OrdersController } from './orders.controller';
import { requireAuth } from '../../middlewares/auth.middleware';
import { requireRoles } from '../../middlewares/rbac.middleware';
import { validate } from '../../middlewares/validate.middleware';
import {
  checkoutSchema,
  updateOrderStatusSchema,
  requestReturnSchema,
  resolveReturnSchema,
} from './orders.validation';
import { asyncHandler } from '../../utils/asyncHandler';

const router = Router();
const controller = new OrdersController();

router.use(requireAuth);

// Buyer routes
router.post('/', validate({ body: checkoutSchema }), asyncHandler(controller.create));
router.get('/', asyncHandler(controller.listBuyerOrders));
router.get('/:id', asyncHandler(controller.getDetails));
router.post(
  '/:id/return',
  validate({ body: requestReturnSchema }),
  asyncHandler(controller.requestReturn)
);

// Seller / Admin routes
router.get('/seller', requireRoles(['seller', 'admin']), asyncHandler(controller.listSellerOrders));
router.patch(
  '/:id/status',
  requireRoles(['seller', 'admin']),
  validate({ body: updateOrderStatusSchema }),
  asyncHandler(controller.updateStatus)
);
router.patch(
  '/:id/return/resolve',
  requireRoles(['admin']),
  validate({ body: resolveReturnSchema }),
  asyncHandler(controller.resolveReturn)
);

// Admin all-orders listing
router.get(
  '/admin/all',
  requireRoles(['admin']),
  asyncHandler(controller.adminListAll)
);

export default router;
