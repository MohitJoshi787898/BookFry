import { Router, Request, Response, NextFunction } from 'express';
import { SellerController } from './seller.controller';
import { requireAuth } from '../../middlewares/auth.middleware';
import { requireRoles } from '../../middlewares/rbac.middleware';
import { asyncHandler } from '../../utils/asyncHandler';
import { SellerAccessPolicy } from '../admin/seller-access.policy';
import { ForbiddenError } from '../../utils/AppError';

const router = Router();
const controller = new SellerController();

/**
 * Middleware: Enforces that seller portal access is active.
 * Super Admins are exempt to permit catalog inspection and operational dispute review.
 */
const requireSellerPortalAccess = async (req: Request, _res: Response, next: NextFunction) => {
  const isAdmin = req.user?.roles?.includes('admin');
  if (isAdmin) {
    return next();
  }

  const isAccessEnabled = await SellerAccessPolicy.isSellerLoginEnabled();
  if (!isAccessEnabled) {
    throw new ForbiddenError(
      'Seller access is temporarily unavailable. Please try again later.',
      'SELLER_LOGIN_DISABLED'
    );
  }
  next();
};

router.use(requireAuth);
router.use(requireRoles(['seller', 'admin']));
router.use(asyncHandler(requireSellerPortalAccess));

router.get('/dashboard', asyncHandler(controller.getDashboard));
router.get('/listings', asyncHandler(controller.getListings));
router.get('/earnings', asyncHandler(controller.getEarnings));

export default router;
