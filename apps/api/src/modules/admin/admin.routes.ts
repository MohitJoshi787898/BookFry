import { Router } from 'express';
import { AdminController } from './admin.controller';
import { requireAuth } from '../../middlewares/auth.middleware';
import { requireRoles } from '../../middlewares/rbac.middleware';
import { asyncHandler } from '../../utils/asyncHandler';
import { validate } from '../../middlewares/validate.middleware';
import { updateOrderStatusSchema, resolveReturnSchema } from '../orders/orders.validation';

const router = Router();
const controller = new AdminController();

// Protect all admin routes with authentication and admin role check
router.use(requireAuth, requireRoles(['admin']));

router.get('/dashboard', asyncHandler(controller.getDashboardStats));
router.get('/users', asyncHandler(controller.getUsers));
router.get('/users/:id', asyncHandler(controller.getUserById));
router.patch('/users/:id', asyncHandler(controller.updateUser));
router.patch('/users/:id/ban', asyncHandler(controller.toggleBan));
router.patch('/users/:id/roles', asyncHandler(controller.updateRoles));
router.delete('/users/:id', asyncHandler(controller.softDeleteUser));

router.get('/listings', asyncHandler(controller.getListings));
router.get('/listings/:id', asyncHandler(controller.getListingById));
router.patch('/listings/:id', asyncHandler(controller.updateListing));
router.patch('/listings/:id/moderate', asyncHandler(controller.moderateListing));
router.delete('/listings/:id', asyncHandler(controller.softDeleteListing));

router.get('/reports', asyncHandler(controller.getReports));
router.get('/reports/export', asyncHandler(controller.exportCsvReport));

router.get('/cms', asyncHandler(controller.getCms));
router.patch('/cms', asyncHandler(controller.updateCms));

router.get('/coupons', asyncHandler(controller.getCoupons));
router.post('/coupons', asyncHandler(controller.createCoupon));
router.patch('/coupons/:id', asyncHandler(controller.updateCoupon));
router.delete('/coupons/:id', asyncHandler(controller.deleteCoupon));

router.get('/settings', asyncHandler(controller.getPlatformSettings));
router.patch('/settings', asyncHandler(controller.updatePlatformSettings));

router.get('/support-tickets', asyncHandler(controller.getSupportTickets));
router.patch('/support-tickets/:id', asyncHandler(controller.updateSupportTicket));
router.patch('/support-tickets/:id/resolve', asyncHandler(controller.resolveSupportTicket));
router.delete('/support-tickets/:id', asyncHandler(controller.softDeleteSupportTicket));

// Orders management
router.get('/orders', asyncHandler(controller.getAdminOrders));
router.patch(
  '/orders/:id/status',
  validate({ body: updateOrderStatusSchema }),
  asyncHandler(controller.updateOrderStatus)
);
router.patch(
  '/orders/:id/return/resolve',
  validate({ body: resolveReturnSchema }),
  asyncHandler(controller.resolveReturn)
);

export default router;
