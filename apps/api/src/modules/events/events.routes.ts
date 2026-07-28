import { Router } from 'express';
import { EventsController } from './events.controller';
import { optionalAuth } from '../../middlewares/auth.middleware';
import { asyncHandler } from '../../utils/asyncHandler';

const router = Router();
const controller = new EventsController();

router.post('/view', optionalAuth, asyncHandler(controller.trackView));

export default router;
