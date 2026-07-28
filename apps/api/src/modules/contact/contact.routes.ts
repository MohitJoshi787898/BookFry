import { Router } from 'express';
import { ContactController } from './contact.controller';
import { validate } from '../../middlewares/validate.middleware';
import { contactSubmitSchema } from './contact.validation';
import { asyncHandler } from '../../utils/asyncHandler';

const router = Router();
const controller = new ContactController();

router.post('/', validate({ body: contactSubmitSchema }), asyncHandler(controller.submit));
router.get('/cms', asyncHandler(controller.getPublicCms));

export default router;
