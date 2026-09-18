import { Router } from 'express';
import { BooksController } from './books.controller';
import { requireAuth, optionalAuth } from '../../middlewares/auth.middleware';
import { requireRoles } from '../../middlewares/rbac.middleware';
import { validate } from '../../middlewares/validate.middleware';
import { uploadMultiple, verifyImageFiles } from '../../middlewares/upload.middleware';
import { createBookSchema, updateBookSchema, queryBookSchema } from './books.validation';
import { asyncHandler } from '../../utils/asyncHandler';

const router = Router();
const controller = new BooksController();

router.get('/', validate({ query: queryBookSchema }), asyncHandler(controller.list));
router.get('/lookup-isbn/:isbn', optionalAuth, asyncHandler(controller.lookupIsbn));
router.get('/:slug', optionalAuth, asyncHandler(controller.getDetails));
router.get('/:slug/listings', asyncHandler(controller.getListings));

// Authenticated user mutating routes
router.post(
  '/',
  requireAuth,
  uploadMultiple('images', 5),
  verifyImageFiles,
  validate({ body: createBookSchema }),
  asyncHandler(controller.create)
);

router.patch(
  '/:id',
  requireAuth,
  uploadMultiple('images', 5),
  verifyImageFiles,
  validate({ body: updateBookSchema }),
  asyncHandler(controller.update)
);

router.delete('/:id', requireAuth, asyncHandler(controller.delete));

export default router;
