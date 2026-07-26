import { Router } from 'express';
import { BooksController } from './books.controller';
import { requireAuth, optionalAuth } from '../../middlewares/auth.middleware';
import { requireRoles } from '../../middlewares/rbac.middleware';
import { validate } from '../../middlewares/validate.middleware';
import { uploadMultiple } from '../../middlewares/upload.middleware';
import { createBookSchema, updateBookSchema, queryBookSchema } from './books.validation';
import { asyncHandler } from '../../utils/asyncHandler';

const router = Router();
const controller = new BooksController();

router.get('/', validate({ query: queryBookSchema }), asyncHandler(controller.list));
router.get('/:slug', optionalAuth, asyncHandler(controller.getDetails));

// Authenticated user mutating routes
router.post(
  '/',
  requireAuth,
  requireRoles(['seller', 'admin']),
  uploadMultiple('images', 5),
  validate({ body: createBookSchema }),
  asyncHandler(controller.create)
);

router.patch(
  '/:id',
  requireAuth,
  requireRoles(['seller', 'admin']),
  uploadMultiple('images', 5),
  validate({ body: updateBookSchema }),
  asyncHandler(controller.update)
);

router.delete('/:id', requireAuth, requireRoles(['seller', 'admin']), asyncHandler(controller.delete));

export default router;
