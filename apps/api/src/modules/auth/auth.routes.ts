import { Router } from 'express';
import { AuthController } from './auth.controller';
import { validate } from '../../middlewares/validate.middleware';
import { requireAuth } from '../../middlewares/auth.middleware';
import { registerSchema, loginSchema } from './auth.validation';
import { asyncHandler } from '../../utils/asyncHandler';

const router = Router();
const controller = new AuthController();

router.post('/register', validate({ body: registerSchema }), asyncHandler(controller.register));
router.post('/login', validate({ body: loginSchema }), asyncHandler(controller.login));
router.post('/refresh', asyncHandler(controller.refresh));
router.post('/logout', requireAuth, asyncHandler(controller.logout));
router.get('/me', requireAuth, asyncHandler(controller.me));

export default router;
