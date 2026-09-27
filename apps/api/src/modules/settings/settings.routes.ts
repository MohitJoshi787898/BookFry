import { Router } from 'express';
import { SettingsController } from './settings.controller';
import { asyncHandler } from '../../utils/asyncHandler';

const router = Router();
const controller = new SettingsController();

// Public route to retrieve platform feature flags and public configuration
router.get('/public', asyncHandler(controller.getPublicSettings));

export default router;
