import { Router } from 'express';
import { NotificationsController } from './notifications.controller';
import { requireAuth, optionalAuth } from '../../middlewares/auth.middleware';
import { asyncHandler } from '../../utils/asyncHandler';

const router = Router();
const controller = new NotificationsController();

// SSE Stream route supports ?token= query parameter as well as Bearer header
router.get('/stream', optionalAuth, asyncHandler(controller.stream));

router.get('/', requireAuth, asyncHandler(controller.list));
router.get('/unread-count', requireAuth, asyncHandler(controller.unreadCount));
router.patch('/read-all', requireAuth, asyncHandler(controller.markAllRead));
router.patch('/:id/read', requireAuth, asyncHandler(controller.markRead));
router.post('/push-token', requireAuth, asyncHandler(controller.registerPushToken));
router.delete('/push-token', requireAuth, asyncHandler(controller.removePushToken));
router.get('/preferences', requireAuth, asyncHandler(controller.getPreferences));
router.patch('/preferences', requireAuth, asyncHandler(controller.updatePreferences));

export default router;
