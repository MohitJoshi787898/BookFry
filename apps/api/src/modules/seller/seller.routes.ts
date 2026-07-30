import { Router } from 'express';
import { SellerController } from './seller.controller';
import { requireAuth } from '../../middlewares/auth.middleware';
import { requireRoles } from '../../middlewares/rbac.middleware';
import { asyncHandler } from '../../utils/asyncHandler';

const router = Router();
const controller = new SellerController();

router.use(requireAuth);
router.use(requireRoles(['seller', 'admin', 'customer']));

router.get('/dashboard', asyncHandler(controller.getDashboard));
router.get('/listings', asyncHandler(controller.getListings));
router.get('/earnings', asyncHandler(controller.getEarnings));

export default router;
