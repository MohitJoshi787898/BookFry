import { Router } from 'express';
import { LandingController } from './landing.controller';
import { requireAuth } from '../../middlewares/auth.middleware';
import { requireRoles } from '../../middlewares/rbac.middleware';
import { asyncHandler } from '../../utils/asyncHandler';
import { validate } from '../../middlewares/validate.middleware';
import {
  createSectionSchema,
  updateSectionSchema,
  reorderSectionsSchema,
  updateLandingSeoSchema,
} from './landing.validation';

const publicRouter = Router();
const adminRouter = Router();
const controller = new LandingController();

// Public route for storefront landing page render
publicRouter.get('/landing', asyncHandler(controller.getPublicLanding));

// Admin routes for managing landing sections & SEO
adminRouter.use(requireAuth, requireRoles(['admin']));

adminRouter.get('/sections', asyncHandler(controller.getAdminSections));
adminRouter.post(
  '/sections',
  validate({ body: createSectionSchema }),
  asyncHandler(controller.createSection)
);
adminRouter.patch(
  '/sections/:id',
  validate({ body: updateSectionSchema }),
  asyncHandler(controller.updateSection)
);
adminRouter.delete('/sections/:id', asyncHandler(controller.deleteSection));
adminRouter.patch(
  '/reorder',
  validate({ body: reorderSectionsSchema }),
  asyncHandler(controller.reorderSections)
);

adminRouter.get('/seo', asyncHandler(controller.getAdminSeo));
adminRouter.patch(
  '/seo',
  validate({ body: updateLandingSeoSchema }),
  asyncHandler(controller.updateAdminSeo)
);

export { publicRouter as publicLandingRouter, adminRouter as adminLandingRouter };
export default publicRouter;
