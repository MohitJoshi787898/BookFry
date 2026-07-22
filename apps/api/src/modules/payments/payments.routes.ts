import { Router } from 'express';
import { PaymentsController } from './payments.controller';
import { requireAuth } from '../../middlewares/auth.middleware';
import { asyncHandler } from '../../utils/asyncHandler';

const router = Router();
const controller = new PaymentsController();

router.post('/create-intent', requireAuth, asyncHandler(controller.createIntent));
router.post('/verify', requireAuth, asyncHandler(controller.verify));
router.post('/webhook', asyncHandler(controller.webhook));

export default router;
