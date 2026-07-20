import { Router } from 'express';
import { CategoriesController } from './categories.controller';
import { requireAuth } from '../../middlewares/auth.middleware';
import { requireRoles } from '../../middlewares/rbac.middleware';
import { validate } from '../../middlewares/validate.middleware';
import { createCategorySchema, updateCategorySchema } from './categories.validation';
import { asyncHandler } from '../../utils/asyncHandler';

const router = Router();
const controller = new CategoriesController();

router.get('/', asyncHandler(controller.getAll));

// Admin only routes
router.post(
  '/',
  requireAuth,
  requireRoles(['admin']),
  validate({ body: createCategorySchema }),
  asyncHandler(controller.create)
);

router.patch(
  '/:id',
  requireAuth,
  requireRoles(['admin']),
  validate({ body: updateCategorySchema }),
  asyncHandler(controller.update)
);

router.delete('/:id', requireAuth, requireRoles(['admin']), asyncHandler(controller.delete));

export default router;
