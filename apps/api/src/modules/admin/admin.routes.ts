import { Router } from 'express';
import { AdminController } from './admin.controller';
import { requireAuth } from '../../middlewares/auth.middleware';
import { requireRoles } from '../../middlewares/rbac.middleware';
import { asyncHandler } from '../../utils/asyncHandler';

const router = Router();
const controller = new AdminController();

// Protect all admin routes with authentication and admin role check
router.use(requireAuth, requireRoles(['admin']));

router.get('/dashboard', asyncHandler(controller.getDashboardStats));
router.get('/users', asyncHandler(controller.getUsers));
router.patch('/users/:id/ban', asyncHandler(controller.toggleBan));
router.patch('/users/:id/roles', asyncHandler(controller.updateRoles));

router.get('/listings', asyncHandler(controller.getListings));
router.patch('/listings/:id/moderate', asyncHandler(controller.moderateListing));

router.get('/reports', asyncHandler(controller.getReports));

router.get('/support-tickets', asyncHandler(controller.getSupportTickets));
router.patch('/support-tickets/:id/resolve', asyncHandler(controller.resolveSupportTicket));

export default router;
