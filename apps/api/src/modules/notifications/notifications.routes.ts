import { Router } from 'express';
import { NotificationsController } from './notifications.controller';
import { requireAuth } from '../../middlewares/auth.middleware';
import { asyncHandler } from '../../utils/asyncHandler';

const router = Router();
const controller = new NotificationsController();

router.use(requireAuth);

router.get('/', asyncHandler(controller.list));
router.get('/unread-count', asyncHandler(controller.unreadCount));
router.patch('/:id/read', asyncHandler(controller.markRead));
router.post('/push-token', asyncHandler(controller.registerPushToken));
router.delete('/push-token', asyncHandler(controller.removePushToken));

export default router;
