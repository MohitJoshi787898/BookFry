import { Router } from 'express';
import { CouponsController } from './coupons.controller';
import { asyncHandler } from '../../utils/asyncHandler';

const router = Router();
const controller = new CouponsController();

router.get('/active', asyncHandler(controller.getActiveCoupons));
router.post('/validate', asyncHandler(controller.validateCoupon));

export default router;
