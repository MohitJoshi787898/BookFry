import { Router } from 'express';
import { UsedBookRequestsController } from './used-book-requests.controller';
import { requireAuth } from '../../middlewares/auth.middleware';
import { requireRoles } from '../../middlewares/rbac.middleware';

const router = Router();
const controller = new UsedBookRequestsController();

// All routes require authentication
router.use(requireAuth);

router.post('/', controller.createRequest);
router.get('/buyer', controller.getBuyerRequests);
router.get('/seller', controller.getSellerRequests);
router.get('/admin', requireRoles(['admin']), controller.getAdminRequests);
router.get('/:id', controller.getRequestById);
router.patch('/:id/status', controller.updateStatus);

export default router;
