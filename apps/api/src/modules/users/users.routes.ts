import { Router } from 'express';
import { UsersController } from './users.controller';
import { requireAuth } from '../../middlewares/auth.middleware';
import { uploadSingle } from '../../middlewares/upload.middleware';
import { asyncHandler } from '../../utils/asyncHandler';

const router = Router();
const controller = new UsersController();

// All routes require user authentication
router.use(requireAuth);

router.get('/profile', asyncHandler(controller.getProfile));
router.patch('/profile', asyncHandler(controller.updateProfile));
router.post('/avatar', uploadSingle('avatar'), asyncHandler(controller.uploadAvatar));

router.get('/addresses', asyncHandler(controller.getAddresses));
router.post('/addresses', asyncHandler(controller.addAddress));
router.patch('/addresses/:id', asyncHandler(controller.updateAddress));
router.patch('/addresses/:id/default', asyncHandler(controller.setAddressDefault));
router.delete('/addresses/:id', asyncHandler(controller.deleteAddress));

router.get('/reverse-geocode', asyncHandler(controller.reverseGeocode));
router.post('/checkout-intent', asyncHandler(controller.checkoutIntent));
router.patch('/seller-payout', asyncHandler(controller.updateSellerPayout));

export default router;
