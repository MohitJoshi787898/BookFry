import { Router } from 'express';
import { AuthController } from './auth.controller';
import { validate } from '../../middlewares/validate.middleware';
import { requireAuth } from '../../middlewares/auth.middleware';
import {
  registerSchema,
  loginSchema,
  sendOtpSchema,
  verifyEmailOtpSchema,
  forgotPasswordSchema,
  verifyResetOtpSchema,
  resetPasswordOtpSchema,
} from './auth.validation';
import { asyncHandler } from '../../utils/asyncHandler';

import { authLimiter } from '../../middlewares/rateLimiter.middleware';
import { env } from '../../config/env';

const router = Router();
const controller = new AuthController();

const applyAuthLimiter = env.NODE_ENV === 'test' ? (req: any, res: any, next: any) => next() : authLimiter;

router.post('/register', applyAuthLimiter, validate({ body: registerSchema }), asyncHandler(controller.register));
router.post('/login', applyAuthLimiter, validate({ body: loginSchema }), asyncHandler(controller.login));
router.post('/refresh', asyncHandler(controller.refresh));
router.post('/logout', requireAuth, asyncHandler(controller.logout));
router.get('/me', requireAuth, asyncHandler(controller.me));

// OTP & Password Management
router.post('/send-verification-otp', applyAuthLimiter, validate({ body: sendOtpSchema }), asyncHandler(controller.sendVerificationOtp));
router.post('/verify-email-otp', applyAuthLimiter, validate({ body: verifyEmailOtpSchema }), asyncHandler(controller.verifyEmailOtp));
router.post('/forgot-password', applyAuthLimiter, validate({ body: forgotPasswordSchema }), asyncHandler(controller.forgotPassword));
router.post('/verify-reset-otp', applyAuthLimiter, validate({ body: verifyResetOtpSchema }), asyncHandler(controller.verifyResetOtp));
router.post('/reset-password', applyAuthLimiter, validate({ body: resetPasswordOtpSchema }), asyncHandler(controller.resetPassword));

export default router;
