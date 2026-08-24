import { Router } from 'express';
import { UsedBookRequestsController } from './used-book-requests.controller';
import { requireAuth } from '../../middlewares/auth.middleware';
import { requireRoles } from '../../middlewares/rbac.middleware';

const router = Router();
const controller = new UsedBookRequestsController();

// All routes require authentication
router.use(requireAuth);

router.post('/', controller.createRequest);
router.post('/batch', controller.createBatchRequests);
router.get('/buyer', controller.getBuyerRequests);
router.get('/seller', controller.getSellerRequests);
router.get('/admin', requireRoles(['admin']), controller.getAdminRequests);
router.get('/:id', controller.getRequestById);
router.patch('/:id/status', controller.updateStatus);
router.patch('/:id/accept', requireRoles(['seller', 'admin']), controller.acceptRequest);
router.patch('/:id/decline', requireRoles(['seller', 'admin']), controller.declineRequest);

export default router;
