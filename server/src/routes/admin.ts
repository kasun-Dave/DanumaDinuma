import { Router } from 'express';
import * as admin from '../controllers/adminController';
import { authenticate, authorize, validate } from '../middleware';
import { bulkImportSchema } from '../validators';

const router = Router();

router.use(authenticate, authorize('admin'));

router.get('/stats', admin.getAdminStats);
router.post('/pdf-upload', admin.uploadMiddleware, admin.uploadPdf);
router.post('/import-json', validate(bulkImportSchema), admin.importJson);
router.get('/review', admin.getReviewQuestions);
router.post('/publish', admin.publishQuestions);

export default router;
